/**
 * Utility for Tire Product Image Enhancement
 * 1. Intelligent client-side background cutout (removes white/light-gray studio backgrounds)
 * 2. Studio Frame renderer with soft radial vignette and metallic bevel to eliminate harsh square cuts
 */

export type TireImagePresentationMode = 'auto-cutout' | 'studio-frame';

/**
 * Removes uniform white/light-gray/neutral backgrounds from product images.
 * Samples corner pixels, determines if it's a solid background, and sets alpha to 0 with soft feathering.
 */
export function processImageBackgroundCutout(
  img: HTMLImageElement,
  tolerance = 38
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width || 600;
  canvas.height = img.naturalHeight || img.height || 600;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Sample the 4 corners to detect background color
    const w = canvas.width;
    const h = canvas.height;
    const samplePoints = [
      0, // top-left
      (w - 1) * 4, // top-right
      ((h - 1) * w) * 4, // bottom-left
      ((h - 1) * w + (w - 1)) * 4, // bottom-right
      Math.floor(w / 2) * 4, // top-center
      ((h - 1) * w + Math.floor(w / 2)) * 4, // bottom-center
    ];

    let avgR = 0;
    let avgG = 0;
    let avgB = 0;
    let validSamples = 0;

    for (const p of samplePoints) {
      const a = data[p + 3];
      if (a > 200) {
        avgR += data[p];
        avgG += data[p + 1];
        avgB += data[p + 2];
        validSamples++;
      }
    }

    if (validSamples > 0) {
      avgR /= validSamples;
      avgG /= validSamples;
      avgB /= validSamples;
    } else {
      // Default to white
      avgR = 255;
      avgG = 255;
      avgB = 255;
    }

    // Only attempt cutout if background is bright (e.g. white/light gray showroom > 180 brightness)
    const isBrightBg = (avgR + avgG + avgB) / 3 > 175;

    if (isBrightBg) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const dist = Math.sqrt(
          (r - avgR) ** 2 +
          (g - avgG) ** 2 +
          (b - avgB) ** 2
        );

        if (dist < tolerance) {
          // Fully transparent
          data[i + 3] = 0;
        } else if (dist < tolerance + 22) {
          // Soft edge feathering
          const factor = (dist - tolerance) / 22;
          data[i + 3] = Math.round(a * factor);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } catch (err) {
    // If CORS or tainted canvas, fallback to original image
    console.warn('Canvas image cutout error:', err);
  }

  return canvas;
}

/**
 * Draws the tire inside an Automotive Studio Frame (Metallic Bezel & Soft Radial Vignette)
 * so that any image with background integrates seamlessly without harsh square cuts.
 */
export function drawStudioFramedTire(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  size: number,
  accentColor = '#facc15'
) {
  if (!Number.isFinite(size) || size <= 0) return;

  ctx.save();
  const radius = Math.max(1, size * 0.48);

  // 1. Soft radial vignette background in dark carbon
  try {
    const bgGrad = ctx.createRadialGradient(0, 0, Math.max(0.1, radius * 0.2), 0, 0, radius);
    bgGrad.addColorStop(0, '#1c1c1c');
    bgGrad.addColorStop(0.7, '#0d0d0d');
    bgGrad.addColorStop(1, '#050505');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();
  } catch {}

  // 2. Clip inside circle/soft bezel so image never bleeds outside
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.5, radius - 4), 0, Math.PI * 2);
  ctx.clip();

  // Draw the image centered
  const drawW = size * 0.95;
  const drawH = size * 0.95;
  try {
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  } catch {}

  // Soft inner edge shadow to blend image borders
  try {
    const innerShadow = ctx.createRadialGradient(0, 0, Math.max(0.1, radius * 0.65), 0, 0, radius);
    innerShadow.addColorStop(0, 'transparent');
    innerShadow.addColorStop(0.8, 'rgba(0,0,0,0.5)');
    innerShadow.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = innerShadow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  } catch {}
  ctx.restore();

  // 3. Metallic ring & Accent Neon glow border
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#262626';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}
