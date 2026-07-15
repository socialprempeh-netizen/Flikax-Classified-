/**
 * One-time backfill: re-watermarks listing images uploaded before the
 * watermark pipeline existed (or before it moved to WebP), overwriting each
 * Storage object in place at its existing path.
 *
 * Usage:
 *   npx tsx scripts/backfill-watermarks.ts --dry-run
 *   npx tsx scripts/backfill-watermarks.ts
 *
 * Flags:
 *   --dry-run           Download + watermark every candidate and report
 *                        before/after sizes, but never upload. Safe to run
 *                        any number of times.
 *   --batch-size=N       Images processed per batch (default 20).
 *
 * Resumability: every successfully-overwritten path is appended to
 * scripts/.backfill-progress.json as it completes (not batched at the end),
 * so a crash mid-run loses at most the one in-flight image. Re-running the
 * script (with or without --dry-run) skips anything already in that file.
 * Delete the file to start over.
 *
 * Note on the .jpg-path-with-WebP-bytes wrinkle: this overwrites each
 * object at its ORIGINAL path (per the "in place" requirement), so a file
 * that used to be genuinely JPEG-formatted at `foo.jpg` will, after this
 * runs, be WebP-formatted bytes still living at a path ending in `.jpg`.
 * The Content-Type header on the object is set correctly either way, and
 * nothing in this app resolves image type from the URL's extension (Next's
 * image optimizer and browsers both trust Content-Type, not the path), so
 * this is cosmetic, not a functional bug -- but it does mean anyone
 * browsing the Supabase Storage bucket UI will see a mismatched extension.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { watermarkImage } from "../src/lib/watermark";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.join(__dirname, ".backfill-progress.json");
const CUTOFF = "2026-07-15T12:53:37+00:00"; // d3736b4 deploy time
const BUCKET = "listing-images";

function loadEnv() {
  const envContent = readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

function loadProgress(): Set<string> {
  if (!existsSync(PROGRESS_FILE)) return new Set();
  return new Set(JSON.parse(readFileSync(PROGRESS_FILE, "utf-8")));
}

function markDone(done: Set<string>, storagePath: string) {
  done.add(storagePath);
  writeFileSync(PROGRESS_FILE, JSON.stringify([...done], null, 2));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const batchArg = process.argv.find((a) => a.startsWith("--batch-size="));
  const batchSize = batchArg ? Number(batchArg.split("=")[1]) : 20;

  loadEnv();
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: rows, error } = await admin
    .from("listing_images")
    .select("id, listing_id, storage_path, created_at")
    .not("storage_path", "like", "http%")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to list candidate images:", error.message);
    process.exit(1);
  }

  const candidates = (rows ?? []).filter(
    (r) => !r.storage_path.toLowerCase().endsWith(".webp") || r.created_at < CUTOFF
  );

  const done = loadProgress();
  const pending = candidates.filter((r) => !done.has(r.storage_path));

  console.log(
    `${candidates.length} candidate image(s), ${done.size} already done, ${pending.length} pending.` +
      (dryRun ? " [DRY RUN -- no uploads will happen]" : "")
  );

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    console.log(`\n--- Batch ${Math.floor(i / batchSize) + 1} (${batch.length} images) ---`);

    for (const row of batch) {
      try {
        const { data: original, error: downloadError } = await admin.storage
          .from(BUCKET)
          .download(row.storage_path);
        if (downloadError || !original) {
          throw new Error(`download failed: ${downloadError?.message ?? "no data"}`);
        }

        const originalBuffer = Buffer.from(await original.arrayBuffer());
        const watermarked = await watermarkImage(originalBuffer);

        if (dryRun) {
          console.log(
            `[dry-run] ${row.storage_path}: ${originalBuffer.length} -> ${watermarked.length} bytes (would overwrite)`
          );
          continue; // dry-run never marks progress -- every run re-checks everything
        }

        const { error: uploadError } = await admin.storage
          .from(BUCKET)
          .upload(row.storage_path, watermarked, { contentType: "image/webp", upsert: true });
        if (uploadError) {
          throw new Error(`upload failed: ${uploadError.message}`);
        }

        markDone(done, row.storage_path);
        succeeded++;
        console.log(`OK ${row.storage_path} (${originalBuffer.length} -> ${watermarked.length} bytes)`);
      } catch (err) {
        failed++;
        console.error(`FAILED ${row.storage_path}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(
    `\nDone. ${succeeded} succeeded, ${failed} failed` + (dryRun ? " (dry run, nothing written)." : ".")
  );
  if (failed > 0) {
    console.log("Re-run the same command to retry only the failed/remaining images.");
  }
}

main();
