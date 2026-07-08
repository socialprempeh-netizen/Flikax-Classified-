import sharp from "sharp";

const MAX_DIMENSION = 1600;

// A solid brand-blue backing blends into photos that are already blue-toned
// (sky, denim, water, etc.), making the watermark hard to see. A dark,
// near-opaque pill reads clearly against any photo regardless of its colors,
// a soft offset shadow rect gives it edge definition against dark photos too,
// and a thin light outline keeps that edge crisp. Avoids SVG filter primitives
// (feDropShadow etc.) since sharp's librsvg backend has inconsistent support.
function watermarkSvg(width: number, height: number) {
  const fontSize = Math.round(height * 0.48);
  const radius = height / 2;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2" width="100%" height="100%" rx="${radius}" fill="#000000" fill-opacity="0.3" />
    <rect width="100%" height="100%" rx="${radius}" fill="#0B1420" fill-opacity="0.72" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1" />
    <text x="50%" y="54%" font-family="Arial, Helvetica, sans-serif" font-weight="800"
      font-size="${fontSize}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">flikax</text>
  </svg>`;
}

/** Resizes an uploaded image and stamps a semi-transparent "flikax" watermark in the corner. */
export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const resizedBuffer = await sharp(input)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const { width, height } = await sharp(resizedBuffer).metadata();
  if (!width || !height) {
    throw new Error("Could not read image dimensions");
  }

  const wmWidth = Math.max(100, Math.round(width * 0.24));
  const wmHeight = Math.round(wmWidth * 0.4);
  const margin = Math.round(Math.min(width, height) * 0.03);

  const watermarkBuffer = await sharp(Buffer.from(watermarkSvg(wmWidth, wmHeight)))
    .png()
    .toBuffer();

  return sharp(resizedBuffer)
    .composite([
      {
        input: watermarkBuffer,
        left: Math.max(0, width - wmWidth - margin),
        top: Math.max(0, height - wmHeight - margin),
      },
    ])
    .jpeg({ quality: 82 })
    .toBuffer();
}
