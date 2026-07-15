import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_DIMENSION = 1600;

// The logo itself sits at a low opacity so the photo underneath stays fully
// visible — legibility against both light and dark backgrounds comes from
// the blurred dark halo composited underneath it (WATERMARK_OPACITY alone
// would be unreadable on a busy or similarly-colored photo), not from
// cranking this value up.
const WATERMARK_OPACITY = 0.3;
const SHADOW_OPACITY = 0.45;
const SHADOW_BLUR_SIGMA = 3;

// Sized off the shorter edge so it scales sensibly for both landscape and
// portrait photos, and stays a fixed fraction of the frame at any dimension.
const WATERMARK_SIZE_RATIO = 0.28;

const WATERMARK_ASSET_PATH = path.join(process.cwd(), "public", "watermark-logo.png");

let cachedLogoBuffer: Buffer | null = null;

async function loadWatermarkAsset(): Promise<Buffer> {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    cachedLogoBuffer = await readFile(WATERMARK_ASSET_PATH);
  } catch {
    throw new Error(
      `Watermark asset missing: expected a transparent PNG at ${WATERMARK_ASSET_PATH}`
    );
  }
  return cachedLogoBuffer;
}

/** Multiplies an image's existing alpha channel by `opacity` (0-1), preserving its RGB. */
function scaleOpacity(image: ReturnType<typeof sharp>, opacity: number): ReturnType<typeof sharp> {
  return image.composite([
    {
      input: Buffer.from([0, 0, 0, Math.round(255 * opacity)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: "dest-in",
    },
  ]);
}

/** Resizes an uploaded image and centers a translucent, shadowed Flikax logo watermark over it. */
export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const logoAsset = await loadWatermarkAsset();

  const resizedBuffer = await sharp(input)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const { width, height } = await sharp(resizedBuffer).metadata();
  if (!width || !height) {
    throw new Error("Could not read image dimensions");
  }

  const targetSize = Math.round(Math.min(width, height) * WATERMARK_SIZE_RATIO);

  const resizedLogoBuffer = await sharp(logoAsset)
    .resize({ width: targetSize, height: targetSize, fit: "inside" })
    .ensureAlpha()
    .toBuffer();
  const logoMeta = await sharp(resizedLogoBuffer).metadata();
  const logoWidth = logoMeta.width!;
  const logoHeight = logoMeta.height!;
  const left = Math.round((width - logoWidth) / 2);
  const top = Math.round((height - logoHeight) / 2);

  // A blurred black silhouette of the logo, sitting directly behind it —
  // this is what keeps the mark readable against any photo, not opacity.
  const shadowBuffer = await scaleOpacity(
    sharp(resizedLogoBuffer).tint({ r: 0, g: 0, b: 0 }).blur(SHADOW_BLUR_SIGMA),
    SHADOW_OPACITY
  )
    .png()
    .toBuffer();

  const translucentLogoBuffer = await scaleOpacity(sharp(resizedLogoBuffer), WATERMARK_OPACITY)
    .png()
    .toBuffer();

  return sharp(resizedBuffer)
    .composite([
      { input: shadowBuffer, left, top },
      { input: translucentLogoBuffer, left, top },
    ])
    .webp({ quality: 80 })
    .toBuffer();
}
