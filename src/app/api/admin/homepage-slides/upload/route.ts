import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient, getUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Fixed banner aspect ratio so every slide crops consistently and the
// slider never has to letterbox or reflow between slides.
const SLIDE_WIDTH = 1600;
const SLIDE_HEIGHT = 480;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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

  let resized: Buffer;
  try {
    resized = await sharp(inputBuffer)
      .rotate()
      .resize({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (err) {
    console.error("Slide image processing failed:", err);
    return NextResponse.json({ error: "Could not process image" }, { status: 400 });
  }

  const path = `${randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("homepage-slides")
    .upload(path, resized, { contentType: "image/webp", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({ path });
}
