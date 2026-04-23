import { PixelRatio } from 'react-native';

// Image URL helpers — rewrite Unsplash/generic CDN URLs với width param khớp
// display size. Tránh tải full 1200-1600px cho thumbnail 48-96px.
//
// - Unsplash: support `?w=`, `?q=` query params
// - Pixel ratio aware: iPhone @3x → multiply displayed px × 3 cho sharp
// - Tiny thumbnails (<100px) cap q=70; hero ≥ 800px giữ q=80

const DPR = PixelRatio.get();

// Map displayed width (logical px) → request width (device px × safety cap).
// Cap max 2000 tránh request oversized trên tablet.
function targetWidth(displayWidth: number): number {
  return Math.min(2000, Math.round(displayWidth * DPR));
}

/**
 * Rewrite Unsplash image URL với `w=` + `q=` khớp display size.
 * Nếu không phải Unsplash URL → return as-is (không đụng).
 *
 * @param url original image URL
 * @param displayWidth logical width (pt/dp) component sẽ render
 */
export function cdnImage(url: string, displayWidth: number): string {
  if (!url.includes('images.unsplash.com')) return url;

  const width = targetWidth(displayWidth);
  // Thumbnail nhỏ (≤ 200 request px) giảm quality để save bandwidth, hero giữ cao.
  const quality = width <= 200 ? 60 : width <= 600 ? 72 : 80;

  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    return u.toString();
  } catch {
    return url;
  }
}

// Common display presets — giữ consistent across codebase.
export const IMG_SIZE = {
  avatar: 48,       // lead avatar, small circle
  thumb: 96,        // card thumbnail (listing, project card)
  rowThumb: 72,     // tower row, unit row
  floorplan: 120,   // unit type floorplan mini
  card: 400,        // medium card (~ screen width / 2 - margin)
  fullWidth: 1200,  // full-screen hero / gallery (screen width + hi-DPR)
} as const;
