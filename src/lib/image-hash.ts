import sharp from "sharp";

/**
 * 8x8 grayscale average-hash (aHash): downscale to 8x8, compare each pixel
 * to the mean luminance, pack the 64 bits as a '0'/'1' string for Postgres's
 * `bit(64)` column. Cheap and order-of-magnitude coarser than a real
 * perceptual hash (pHash/DCT), but catches near-identical re-uploads (same
 * photo, re-compressed or lightly cropped) which is the actual duplicate-
 * listing pattern this is meant to catch.
 */
export async function computeAverageHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .rotate()
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data);
  const mean = pixels.reduce((sum, v) => sum + v, 0) / pixels.length;
  return pixels.map((v) => (v >= mean ? "1" : "0")).join("");
}

/**
 * Per-channel standard deviation of pixel intensity as a cheap blur proxy —
 * blurry/low-detail images have low variance. Not a real focus-detection
 * model (e.g. Laplacian variance would be more accurate), but needs no new
 * dependency and catches the obviously-bad uploads. Threshold is a rough
 * starting point, tune against real flagged images over time.
 */
export const BLUR_SCORE_THRESHOLD = 15;

export async function computeBlurScore(buffer: Buffer): Promise<number> {
  const stats = await sharp(buffer).rotate().grayscale().stats();
  return stats.channels[0]?.stdev ?? 0;
}
