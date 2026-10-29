// Procedural textures for the Onyx Glyph Preloader: sandblasted metal faces,
// glitter and grain, painted onto canvas. Pure drawing code with no React, so it
// runs both on the main thread and inside onyx-glyph-paint.worker.ts.

import type { OnyxGlyph, OnyxPalette } from './onyx-glyph-preloader';

// Seeded so every mount paints the same glitter.
export function ogpRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FACE = 512;

export type Surface = HTMLCanvasElement | OffscreenCanvas;
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// A page canvas on the main thread, an OffscreenCanvas inside the paint worker.
function canvas(n: number): Surface {
  if (typeof document === 'undefined') return new OffscreenCanvas(n, n);
  const c = document.createElement('canvas');
  c.width = n;
  c.height = n;
  return c;
}

function ctx(c: Surface): Ctx {
  const g = c.getContext('2d');
  if (!g) throw new Error('no 2d context');
  return g as Ctx;
}

function roundRect(g: Ctx, n: number, r: number) {
  g.beginPath();
  g.moveTo(r, 0);
  g.arcTo(n, 0, n, n, r);
  g.arcTo(n, n, 0, n, r);
  g.arcTo(0, n, 0, 0, r);
  g.arcTo(0, 0, n, 0, r);
  g.closePath();
}

// Fine sandblast plus glitter, weighted toward the lit top-left corner.
function sprinkle(
  g: Ctx,
  rnd: () => number,
  n: number,
  count: number,
  color: string,
  alpha: number,
) {
  g.fillStyle = color;
  for (let k = 0; k < count; k++) {
    const x = rnd() * n;
    const y = rnd() * n;
    const b = rnd();
    const lit = 0.4 + 0.6 * (1 - (x + y) / (2 * n));
    g.globalAlpha = alpha * lit * (b * b * 0.9 + 0.04);
    const s = b > 0.99 ? 2.4 : b > 0.92 ? 1.6 : 1;
    g.fillRect(x, y, s, s);
  }
  g.globalAlpha = 1;
}

function glyphMask(glyph: OnyxGlyph) {
  const c = canvas(FACE);
  const g = ctx(c);
  const k = (FACE * 0.66) / 100;
  g.setTransform(k, 0, 0, k, FACE * 0.17, FACE * 0.17);
  const path = new Path2D(glyph.d);
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  if (glyph.stroke) {
    g.lineWidth = glyph.stroke;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.stroke(path);
  } else {
    g.fill(path, 'evenodd');
  }
  return c;
}

export function paintFace(
  glyph: OnyxGlyph | null,
  mode: 'cut' | 'deboss',
  pal: OnyxPalette,
  density: number,
  seed: number,
) {
  const rnd = ogpRng(seed);
  const n = FACE;
  const c = canvas(n);
  const g = ctx(c);
  // The face span clips to the same 20% radius over a shade background, so the
  // corners are filled with shade and the face can be encoded as an opaque JPEG.
  g.fillStyle = pal.shade;
  g.fillRect(0, 0, n, n);
  roundRect(g, n, n * 0.2);
  g.clip();

  const base = g.createLinearGradient(0, 0, n, n);
  base.addColorStop(0, pal.metal);
  base.addColorStop(0.62, pal.shade);
  base.addColorStop(1, pal.shade);
  g.fillStyle = base;
  g.fillRect(0, 0, n, n);
  const bloom = g.createRadialGradient(n * 0.26, n * 0.2, 0, n * 0.26, n * 0.2, n * 0.85);
  bloom.addColorStop(0, 'rgba(255,255,255,0.11)');
  bloom.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = bloom;
  g.fillRect(0, 0, n, n);

  sprinkle(g, rnd, n, 14000, '#000', 0.5);
  sprinkle(g, rnd, n, Math.round(16000 * density), pal.glitter, 0.95);

  if (glyph) {
    const mask = glyphMask(glyph);
    // everything but the glyph: its shadow is what falls into the recess
    const inv = canvas(n);
    const ig = ctx(inv);
    ig.fillStyle = '#fff';
    ig.fillRect(0, 0, n, n);
    ig.globalCompositeOperation = 'destination-out';
    ig.drawImage(mask, 0, 0);

    const well = canvas(n);
    const w = ctx(well);
    w.drawImage(mask, 0, 0);
    w.globalCompositeOperation = 'source-in';
    if (mode === 'cut') {
      w.fillStyle = pal.stage;
      w.fillRect(0, 0, n, n);
    } else {
      const floor = w.createLinearGradient(0, 0, n, n);
      floor.addColorStop(0, '#0f1a36');
      floor.addColorStop(1, '#1f3a78');
      w.fillStyle = floor;
      w.fillRect(0, 0, n, n);
      w.globalCompositeOperation = 'source-atop';
      sprinkle(w, rnd, n, Math.round(2400 * density), pal.glitter, 0.4);
    }
    w.globalCompositeOperation = 'source-atop';
    // draw the stencil far off-canvas so only its offset shadow lands
    const shade = (color: string, blur: number, dx: number, dy: number) => {
      w.shadowColor = color;
      w.shadowBlur = blur;
      w.shadowOffsetX = dx + n * 3;
      w.shadowOffsetY = dy;
      w.drawImage(inv, -n * 3, 0);
    };
    if (mode === 'cut') {
      shade('rgba(0,0,0,1)', 6, 0, 7);
      shade('rgba(150,150,160,0.55)', 5, -3, -9);
      shade('rgba(255,255,255,0.35)', 1, -1, -2);
    } else {
      shade('rgba(0,0,0,0.95)', 9, 7, 10);
      shade('rgba(0,0,0,0.8)', 2, 2, 3);
      shade('rgba(255,255,255,0.24)', 2, -2, -3);
    }
    w.shadowColor = 'transparent';
    g.drawImage(well, 0, 0);

    // the lip of the recess catches the light along its lower edge
    const lip = canvas(n);
    const l = ctx(lip);
    l.shadowColor = 'rgba(255,255,255,0.22)';
    l.shadowBlur = 2;
    l.shadowOffsetX = n * 3 + 1.5;
    l.shadowOffsetY = 2;
    l.drawImage(mask, -n * 3, 0);
    l.globalCompositeOperation = 'destination-out';
    l.shadowColor = 'transparent';
    l.drawImage(mask, 0, 0);
    g.drawImage(lip, 0, 0);
  }

  const bevel = g.createLinearGradient(0, 0, n, n);
  bevel.addColorStop(0, 'rgba(255,255,255,0.34)');
  bevel.addColorStop(0.45, 'rgba(255,255,255,0.03)');
  bevel.addColorStop(1, 'rgba(255,255,255,0.18)');
  g.lineWidth = n * 0.028;
  g.strokeStyle = bevel;
  roundRect(g, n, n * 0.2);
  g.stroke();
  return c;
}

// Sparse, brighter specks with a few cross glints, laid over a face and
// faded by the light so they flash as it moves.
export function paintSparkle(seed: number, count: number) {
  const n = 256;
  const c = canvas(n);
  const g = ctx(c);
  const rnd = ogpRng(seed);
  for (let k = 0; k < count; k++) {
    const x = rnd() * n;
    const y = rnd() * n;
    const b = rnd();
    const r = 0.35 + b * 0.75;
    const dot = g.createRadialGradient(x, y, 0, x, y, r * 2);
    dot.addColorStop(0, 'rgba(255,255,255,' + (0.55 + b * 0.45).toFixed(2) + ')');
    dot.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = dot;
    g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    if (b > 0.94) {
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillRect(x - r * 5, y - 0.3, r * 10, 0.6);
      g.fillRect(x - 0.3, y - r * 5, 0.6, r * 10);
    }
  }
  return c;
}

export function paintGrain() {
  const n = 160;
  const c = canvas(n);
  const g = ctx(c);
  const img = g.createImageData(n, n);
  const rnd = ogpRng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.round(rnd() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 34;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export interface TextureRequest {
  glyphs: OnyxGlyph[];
  mark: OnyxGlyph;
  markStyle: 'cut' | 'deboss';
  pal: OnyxPalette;
  density: number;
}

/**
 * Every texture of one look, in a fixed order: one face per glyph, then the
 * hero face, the hero's back, the two glitter layers and the grain. `face`
 * marks the opaque 512px faces.
 */
export function textureJobs({ glyphs, mark, markStyle, pal, density }: TextureRequest) {
  const sparkles = Math.round(110 * Math.max(0.2, density));
  return [
    ...glyphs.map((gl, i) => ({
      face: true,
      paint: () => paintFace(gl, 'deboss', pal, density, 101 + i * 17),
    })),
    { face: true, paint: () => paintFace(mark, markStyle, pal, density, 977) },
    { face: true, paint: () => paintFace(null, 'deboss', pal, density, 1301) },
    { face: false, paint: () => paintSparkle(11, sparkles) },
    { face: false, paint: () => paintSparkle(29, sparkles) },
    { face: false, paint: () => paintGrain() },
  ];
}
