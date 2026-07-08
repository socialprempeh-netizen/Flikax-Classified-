import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { watermarkImage } from "@/lib/watermark";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const supabase = await createClient();

  // A batch of photos means many of these requests fire back-to-back. Each
  // one previously did its own cookie-based getUser(), which independently
  // decides whether the session needs refreshing — with 10+ requests in a
  // few seconds, those refresh attempts raced each other (and Supabase's own
  // refresh-token rate limit), so some requests in the middle of a batch
  // failed even though nothing the user did was concurrent. The client now
  // fetches its access token once per batch and sends it as a Bearer token;
  // validating an explicit token is a stateless check with no refresh
  // involved, so none of these requests can race one another. Cookie-based
  // getUser() stays as the fallback for any other caller of this route.
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const {
    data: { user },
  } = bearerToken ? await supabase.auth.getUser(bearerToken) : await getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let watermarked: Buffer;
  try {
    watermarked = await watermarkImage(inputBuffer);
  } catch {
    return NextResponse.json({ error: "Could not process image" }, { status: 400 });
  }

  const path = `${user.id}/${randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("listing-images")
    .upload(path, watermarked, { contentType: "image/jpeg", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("listing-images").getPublicUrl(path);

  return NextResponse.json({ path, url: publicUrl });
}
