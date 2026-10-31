'use client';

/**
 * Supplied Ring Tower, redrawn on a 2D canvas so it needs no three.js. The
 * same scene: open, tilted cylinder bands wrapped in a strip of images, each
 * leaning a quarter turn from the last so the stack zig-zags, seen through a
 * narrow 7° camera from 70 units away. The images crawl around the bands,
 * dragging spins the tower with inertia, the pointer turns neighboring bands
 * opposite ways, and the inside of each band fades toward the ground.
 *
 * Every band is cut into thin vertical slices; through that narrow lens each
 * slice is a parallelogram, drawn as one affine `drawImage` and depth sorted.
 * Additions for the site: any number of rings, a camera `pan` the page scroll
 * drives, a `focus` tag that dims every image without it, an entrance where
 * the rings drop in, and placeholder cards for images without a `src`.
 * Pauses off screen and in hidden tabs; holds still under reduced motion.
 */

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

export type RingTowerTheme = 'light' | 'dark';

/** An image on a band. An empty `src` draws a placeholder card. */
export type RingTowerImage = { src: string; tag?: string; label?: string };

/** One ring's own settings. Anything left out follows the tower. */
export type RingTowerRing = {
  images?: readonly RingTowerImage[];
  /** Which way the ring leans, in degrees around the tower. Default `i * 90`. */
  rotation?: number;
  /** How far the ring leans, in degrees, -45 to 45. Default `14`. */
  tilt?: number;
  /** Degrees per second the ring turns around the tower. Default `0`. */
  spin?: number;
  /** Crawl speed for this ring, -4 to 4. Default: the tower's `speed`. */
  speed?: number;
  /** Degrees the pointer turns this ring, -90 to 90. */
  parallax?: number;
};

export type RingTowerOptions = {
  images?: readonly RingTowerImage[];
  rings?: number | readonly RingTowerRing[];
  speed?: number;
  draggable?: boolean;
  parallax?: number;
  backface?: number;
  /** The page color the band insides and dimmed images fade toward. */
  ground?: string;
  /** Lean of the whole stack, in radians. Default `0.2`. */
  lean?: number;
  /** Placeholder card colors. */
  palette?: readonly string[];
};

export type RingTowerInstance = {
  setOptions: (options: Partial<RingTowerOptions>) => void;
  /** 0 frames the top ring, 1 the bottom one. */
  setPan: (value: number) => void;
  /** Dims every image whose tag differs; `null` clears. */
  setFocus: (tag: string | null) => void;
  /** Drops the rings in, nearest the camera first. */
  enter: (immediate?: boolean) => void;
  destroy: () => void;
};

export const DEFAULT_SPEED = 1;
export const DEFAULT_PARALLAX = 24;
export const DEFAULT_BACKFACE = 0.86;
export const DEFAULT_TILT = 14;
const MAX_RINGS = 12;

const RADIUS = 4;
const BAND_HEIGHT = 2;
const SPACING = 3.5;
const CAMERA = 70;
const HALF_FOV = 3.5 * (Math.PI / 180);
const STRIP_HEIGHT = 320;
const CRAWL = 0.012;
const START_ANGLE = 0.5;
const DEG = Math.PI / 180;
const PARALLAX_FACTORS = [1, -0.75, 1.25, -0.9];
const SEAM = 0.045;
const PALETTE = ['#5b8dfb', '#f8fa55', '#f3d061', '#e43468', '#17284f', '#ffffff'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const numberOr = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

function ringsOf(value: RingTowerOptions['rings']): RingTowerRing[] {
  if (Array.isArray(value) && value.length > 0) return value.slice(0, MAX_RINGS);
  const count = Math.round(numberOr(Array.isArray(value) ? undefined : value, 5, 1, MAX_RINGS));
  return Array.from({ length: count }, () => ({}));
}

type Mat = [number, number, number, number, number, number, number, number, number];

/** Rotation matrix for Euler angles in XYZ order (Rx · Ry · Rz). */
function euler(ax: number, ay: number, az: number): Mat {
  const [cx, sx, cy, sy, cz, sz] = [
    Math.cos(ax),
    Math.sin(ax),
    Math.cos(ay),
    Math.sin(ay),
    Math.cos(az),
    Math.sin(az),
  ];
  return [
    cy * cz,
    -cy * sz,
    sy,
    sx * sy * cz + cx * sz,
    -sx * sy * sz + cx * cz,
    -sx * cy,
    -cx * sy * cz + sx * sz,
    cx * sy * sz + sx * cz,
    cx * cy,
  ];
}

function multiply(a: Mat, b: Mat): Mat {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadImage(src: string) {
  let pending = imageCache.get(src);
  if (!pending) {
    pending = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    imageCache.set(src, pending);
  }
  return pending;
}

type Span = { from: number; to: number; tag: string };
type Strip = { canvas: HTMLCanvasElement; aspect: number; spans: Span[] };

const PLACEHOLDER_ASPECT = 0.78;

function placeholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  index: number,
  image: RingTowerImage,
  palette: readonly string[],
) {
  const h = STRIP_HEIGHT;
  const fill = palette[index % palette.length] ?? '#5b8dfb';
  const dark = fill === '#17284f' || fill === '#e43468' || fill === '#5b8dfb';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, 0, width, h);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x + 10, 10, width - 20, h - 20, 18);
  ctx.fill();
  if (fill === '#ffffff') {
    ctx.strokeStyle = '#17284f';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  const ink = dark ? '#ffffff' : '#17284f';
  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${Math.round(h * 0.3)}px "Archivo Black", "Arial Black", Impact, sans-serif`;
  ctx.fillText(String(index + 1).padStart(2, '0'), x + 26, 30 + h * 0.26);
  // A small camera, drawn: this frame is waiting for a photo.
  const cx = x + width / 2;
  const cy = h * 0.58;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(cx - 34, cy - 20, 68, 46, 8);
  ctx.moveTo(cx - 12, cy - 20);
  ctx.lineTo(cx - 6, cy - 30);
  ctx.lineTo(cx + 6, cy - 30);
  ctx.lineTo(cx + 12, cy - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + 3, 12, 0, Math.PI * 2);
  ctx.stroke();
  if (image.label) {
    ctx.font = `400 ${Math.round(h * 0.075)}px "Archivo Black", "Arial Black", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(image.label.toUpperCase(), cx, h - 34, width - 40);
    ctx.textAlign = 'start';
  }
}

/** Draws the images side by side at one height on a white strip. */
async function stitch(
  images: readonly RingTowerImage[],
  palette: readonly string[],
  offset: number,
) {
  const loaded = await Promise.all(
    images.map((image) => (image.src ? loadImage(image.src) : Promise.resolve(null))),
  );
  const widths = images.map((_, index) => {
    const img = loaded[index];
    const aspect = img ? img.naturalWidth / Math.max(1, img.naturalHeight) : PLACEHOLDER_ASPECT;
    return Math.round(STRIP_HEIGHT * aspect);
  });
  const width = widths.reduce((sum, w) => sum + w, 0);
  if (width <= 0) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = STRIP_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, STRIP_HEIGHT);
  const spans: Span[] = [];
  let x = 0;
  images.forEach((image, index) => {
    const w = widths[index] ?? 0;
    const img = loaded[index];
    if (img) ctx.drawImage(img, x, 0, w, STRIP_HEIGHT);
    else placeholder(ctx, x, w, offset + index, image, palette);
    spans.push({ from: x / width, to: (x + w) / width, tag: image.tag ?? '' });
    x += w;
  });
  return { canvas, aspect: width / STRIP_HEIGHT, spans } satisfies Strip;
}

type Band = {
  index: number;
  strip: Strip;
  tiles: number;
  repeatY: number;
};

type Slice = { z: number; band: number; k: number; back: boolean };

/** A tower of tilted, image-wrapped bands on a transparent 2D canvas. */
export function createRingTower(
  root: HTMLElement,
  initial: RingTowerOptions = {},
): RingTowerInstance | null {
  let options: RingTowerOptions = { draggable: true, ...initial };
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'pan-y';
  root.appendChild(canvas);

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const segments = coarse ? 56 : 72;
  const sinTable = Array.from({ length: segments + 1 }, (_, k) =>
    Math.sin((k / segments) * Math.PI * 2),
  );
  const cosTable = Array.from({ length: segments + 1 }, (_, k) =>
    Math.cos((k / segments) * Math.PI * 2),
  );
  const midSin = Array.from({ length: segments }, (_, k) =>
    Math.sin(((k + 0.5) / segments) * Math.PI * 2),
  );
  const midCos = Array.from({ length: segments }, (_, k) =>
    Math.cos(((k + 0.5) / segments) * Math.PI * 2),
  );

  let rings = ringsOf(options.rings);
  let bands: (Band | null)[] = [];
  const crawls: number[] = [];
  const turns: number[] = [];
  let buildToken = 0;
  let destroyed = false;

  // Projected slice corners per band: x, y and depth for top and bottom rows.
  let points: Float32Array[] = [];
  const slices: Slice[] = [];
  const order: Slice[] = [];

  const fit = (aspect: number) => {
    const around = (2 * Math.PI * RADIUS) / BAND_HEIGHT;
    const whole = Math.floor(around / aspect);
    if (whole >= 1) return { tiles: whole, repeatY: Math.min(1, (aspect * whole) / around) };
    return { tiles: around / aspect, repeatY: 1 };
  };

  const build = () => {
    const token = ++buildToken;
    const palette = options.palette ?? PALETTE;
    bands = rings.map(() => null);
    points = rings.map(() => new Float32Array((segments + 1) * 6));
    slices.length = 0;
    rings.forEach((_, band) => {
      for (let k = 0; k < segments; k++) slices.push({ z: 0, band, k, back: false });
    });
    // Placeholder numbers count from the top ring down, the way the eye reads.
    const imagesOf = (ring: RingTowerRing) =>
      ring.images?.length ? ring.images : (options.images ?? []);
    let offset = 0;
    const starts = rings.map(() => 0);
    for (let index = rings.length - 1; index >= 0; index--) {
      starts[index] = offset;
      offset += imagesOf(rings[index] ?? {}).length;
    }
    rings.forEach((ring, index) => {
      const images = imagesOf(ring);
      const start = starts[index] ?? 0;
      void stitch(images, palette, start).then((strip) => {
        if (destroyed || token !== buildToken || !strip) return;
        bands[index] = { index, strip, ...fit(strip.aspect) };
        wake();
      });
    });
  };

  const size = { width: 0, height: 0, ratio: 1 };
  const resize = () => {
    const { width, height } = root.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    if (width === size.width && height === size.height && ratio === size.ratio) return;
    size.width = width;
    size.height = height;
    size.ratio = ratio;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    wake();
  };

  let raf = 0;
  let last = 0;
  let onScreen = false;
  let angle = START_ANGLE;
  let velocity = 0;
  let dragging = false;
  let dragX = 0;
  let pointerX = 0;
  let pointerTarget = 0;
  let pan = 0;
  let camY = Number.NaN;
  let focus: string | null = null;
  let focusShown: string | null = null;
  let focusMix = 0;
  let enteredAt = Number.NaN;

  const visible = () => onScreen && document.visibilityState !== 'hidden';
  function wake() {
    if (raf || destroyed || !visible()) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  /** Pixels per world unit: the narrow lens, capped so a ring fits the width. */
  const unit = () =>
    Math.min(
      size.height / (2 * CAMERA * Math.tan(HALF_FOV)),
      (size.width * 0.86) / (2 * RADIUS + 0.6),
    );

  const ringY = (index: number) => (index - (rings.length - 1) / 2) * SPACING;
  const panTarget = () => {
    const ppu = unit();
    const half = size.height / 2 / Math.max(1, ppu);
    const top = ringY(rings.length - 1) + BAND_HEIGHT / 2 + 0.4 - half;
    const bottom = ringY(0) - BAND_HEIGHT / 2 - 0.4 + half;
    if (top <= bottom) return 0;
    return top + (bottom - top) * pan;
  };

  const introOf = (index: number, now: number) => {
    if (Number.isNaN(enteredAt)) return 0;
    if (mqReduce.matches) return 1;
    // Rings nearest the middle of the view land first.
    const distance = Math.abs(ringY(index) - camY) / SPACING;
    const t = (now - enteredAt) / 1000 - distance * 0.13;
    return clamp(t / 1.35, 0, 1);
  };

  const draw = (now: number) => {
    const { width, height, ratio } = size;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (width <= 0 || height <= 0) return false;
    const ppu = unit() * ratio;
    const cx = (width / 2) * ratio;
    const cy = (height / 2) * ratio;
    const lean = numberOr(options.lean, 0.2, -0.6, 0.6);
    const tower = euler(-0.2, angle, lean);
    const towerParallax = numberOr(options.parallax, DEFAULT_PARALLAX, 0, 90);
    const ground = options.ground ?? '#ffffff';
    const backface = numberOr(options.backface, DEFAULT_BACKFACE, 0, 1);
    let entering = false;
    order.length = 0;
    const view = height * ratio;

    bands.forEach((band, b) => {
      if (!band) return;
      const ring = rings[b] ?? {};
      const intro = introOf(b, now);
      if (intro < 1) entering = true;
      if (intro <= 0) return;
      const drop = (1 - easeBack(intro)) * 5;
      const twist = (1 - easeOut(intro)) * 1.4;
      const rotation = numberOr(ring.rotation, (b * 90) % 360, -3600, 3600);
      const tilt = numberOr(ring.tilt, DEFAULT_TILT, -45, 45);
      const m = multiply(tower, euler(0, rotation * DEG + (turns[b] ?? 0) + twist, tilt * DEG));
      const y = ringY(b) + drop;
      const ox = tower[1] * y;
      const oy = tower[4] * y - camY;
      const oz = tower[7] * y;
      const pts = points[b];
      if (!pts) return;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let k = 0; k <= segments; k++) {
        const sx = RADIUS * (sinTable[k] ?? 0);
        const sz = RADIUS * (cosTable[k] ?? 0);
        for (let row = 0; row < 2; row++) {
          const ly = row === 0 ? BAND_HEIGHT / 2 : -BAND_HEIGHT / 2;
          const wx = m[0] * sx + m[1] * ly + m[2] * sz + ox;
          const wy = m[3] * sx + m[4] * ly + m[5] * sz + oy;
          const wz = m[6] * sx + m[7] * ly + m[8] * sz + oz;
          const p = (CAMERA / (CAMERA - wz)) * ppu;
          const at = k * 6 + row * 3;
          const screenY = cy - wy * p;
          pts[at] = cx + wx * p;
          pts[at + 1] = screenY;
          pts[at + 2] = wz;
          if (screenY < minY) minY = screenY;
          if (screenY > maxY) maxY = screenY;
        }
      }
      if (maxY < 0 || minY > view) return;
      const base = b * segments;
      for (let k = 0; k < segments; k++) {
        const slice = slices[base + k];
        if (!slice) continue;
        const nx = m[0] * (midSin[k] ?? 0) + m[2] * (midCos[k] ?? 0);
        const ny = m[3] * (midSin[k] ?? 0) + m[5] * (midCos[k] ?? 0);
        const nz = m[6] * (midSin[k] ?? 0) + m[8] * (midCos[k] ?? 0);
        const at = k * 6;
        const px = ((pts[at] ?? 0) - cx) / ppu;
        const py = (cy - ((pts[at + 1] ?? 0) + (pts[at + 4] ?? 0)) / 2) / ppu;
        const pz = ((pts[at + 2] ?? 0) + (pts[at + 5] ?? 0)) / 2;
        slice.z = pz;
        // Facing the camera when the normal points back along the view ray.
        slice.back = -nx * px - ny * py + nz * (CAMERA - pz) <= 0;
        order.push(slice);
      }
    });
    order.sort((a, c) => a.z - c.z);

    for (const slice of order) {
      const band = bands[slice.band];
      const pts = points[slice.band];
      if (!band || !pts) continue;
      const ring = rings[slice.band] ?? {};
      const intro = easeOut(introOf(slice.band, now));
      const parallax = numberOr(
        ring.parallax,
        towerParallax * (PARALLAX_FACTORS[slice.band % 4] ?? 1),
        -90,
        90,
      );
      const offsetX = (crawls[slice.band] ?? 0) + (pointerX * parallax * band.tiles) / 360;
      const k = slice.k;
      const a = k * 6;
      const n = (k + 1) * 6;
      const ax = pts[a] ?? 0;
      const ay = pts[a + 1] ?? 0;
      ctx.setTransform(
        (pts[n] ?? 0) - ax,
        (pts[n + 1] ?? 0) - ay,
        (pts[a + 3] ?? 0) - ax,
        (pts[a + 4] ?? 0) - ay,
        ax,
        ay,
      );
      const { canvas: source, spans } = band.strip;
      const sw = source.width;
      const sh = source.height;
      const u = ((((k / segments) * band.tiles + offsetX) % 1) + 1) % 1;
      const du = band.tiles / segments;
      const sy = ((1 - band.repeatY) / 2) * sh;
      const sHeight = band.repeatY * sh;
      ctx.globalAlpha = intro;
      const from = u * sw;
      const span = du * sw;
      if (from + span <= sw) {
        ctx.drawImage(source, from, sy, span, sHeight, 0, 0, 1 + SEAM, 1);
      } else {
        const first = (sw - from) / span;
        ctx.drawImage(source, from, sy, sw - from, sHeight, 0, 0, first + SEAM, 1);
        ctx.drawImage(source, 0, sy, span - (sw - from), sHeight, first, 0, 1 - first + SEAM, 1);
      }
      let fade = slice.back ? backface : 0;
      if (focusMix > 0.001 && focusShown) {
        const mid = (u + du / 2) % 1;
        const hit = spans.find((s) => mid >= s.from && mid < s.to);
        if (hit && hit.tag !== focusShown) fade = 1 - (1 - fade) * (1 - 0.74 * focusMix);
      }
      if (fade > 0.001) {
        ctx.globalAlpha = intro * fade;
        ctx.fillStyle = ground;
        ctx.fillRect(0, 0, 1 + SEAM, 1);
      }
    }
    ctx.globalAlpha = 1;
    return entering;
  };

  const tick = (now: number) => {
    raf = 0;
    if (destroyed || !visible()) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const still = mqReduce.matches;
    const towerSpeed = numberOr(options.speed, DEFAULT_SPEED, 0, 4);
    let moving = false;
    if (!still) {
      bands.forEach((band, i) => {
        if (!band) return;
        const ring = rings[i] ?? {};
        const speed = numberOr(ring.speed, towerSpeed, -4, 4);
        const crawl = (crawls[i] ?? 0) + dt * CRAWL * band.tiles * speed;
        crawls[i] = crawl - Math.floor(crawl);
        if (speed !== 0) moving = true;
        const spin = numberOr(ring.spin, 0, -180, 180);
        if (spin !== 0) {
          turns[i] = ((turns[i] ?? 0) + spin * DEG * dt) % (Math.PI * 2);
          moving = true;
        }
      });
    }
    if (!dragging) {
      if (still) velocity = 0;
      angle += velocity * dt;
      velocity *= Math.pow(0.95, dt * 60);
      if (Math.abs(velocity) < 1e-4) velocity = 0;
    }
    const ease = 1 - Math.exp(-dt * 4);
    const target = still ? 0 : pointerTarget;
    pointerX += (target - pointerX) * ease;

    const goal = panTarget();
    if (Number.isNaN(camY) || still) camY = goal;
    else camY += (goal - camY) * (1 - Math.exp(-dt * 7));
    const panning = Math.abs(goal - camY) > 1e-3;

    const focusGoal = focus ? 1 : 0;
    if (focus) focusShown = focus;
    focusMix += (focusGoal - focusMix) * (still ? 1 : 1 - Math.exp(-dt * 7));
    if (Math.abs(focusGoal - focusMix) < 1e-3) focusMix = focusGoal;
    if (!focus && focusMix === 0) focusShown = null;

    const entering = draw(now);
    if (
      moving ||
      entering ||
      panning ||
      dragging ||
      velocity !== 0 ||
      Math.abs(target - pointerX) > 1e-4 ||
      focusMix !== focusGoal
    )
      raf = requestAnimationFrame(tick);
  };

  const hits = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const reach = unit() * (RADIUS + 0.4);
    return Math.abs(event.clientX - (rect.left + rect.width / 2)) <= reach;
  };
  const setCursor = (value: string) => {
    if (canvas.style.cursor !== value) canvas.style.cursor = value;
  };
  const onWindowMove = (event: PointerEvent) => {
    if (!onScreen) return;
    const rect = root.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    pointerTarget = inside ? clamp(x * 2 - 1, -1, 1) : 0;
    wake();
  };
  const onDown = (event: PointerEvent) => {
    if (options.draggable === false || !hits(event)) return;
    dragging = true;
    dragX = event.clientX;
    velocity = 0;
    canvas.setPointerCapture(event.pointerId);
    setCursor('grabbing');
    wake();
  };
  const onMove = (event: PointerEvent) => {
    if (dragging) {
      const delta = ((event.clientX - dragX) / Math.max(1, size.width)) * Math.PI * 2;
      angle += delta;
      velocity = delta * 60;
      dragX = event.clientX;
      return;
    }
    setCursor(options.draggable !== false && hits(event) ? 'grab' : '');
  };
  const onUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    setCursor(hits(event) ? 'grab' : '');
    wake();
  };
  const onLeave = () => {
    if (!dragging) setCursor('');
  };
  window.addEventListener('pointermove', onWindowMove, { passive: true });
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    wake();
  });
  io.observe(root);
  const onVisibility = () => wake();
  document.addEventListener('visibilitychange', onVisibility);
  mqReduce.addEventListener('change', onVisibility);

  resize();
  build();

  return {
    setOptions(next) {
      const rebuild =
        next.rings !== undefined || next.images !== undefined || next.palette !== undefined;
      options = { ...options, ...next };
      if (rebuild) {
        rings = ringsOf(options.rings);
        build();
      }
      if (options.draggable === false) {
        dragging = false;
        setCursor('');
      }
      wake();
    },
    setPan(value) {
      const next = clamp(value, 0, 1);
      if (next === pan) return;
      pan = next;
      wake();
    },
    setFocus(tag) {
      if (tag === focus) return;
      focus = tag;
      wake();
    },
    enter(immediate = false) {
      if (!Number.isNaN(enteredAt)) return;
      enteredAt = performance.now() - (immediate ? 1e5 : 0);
      wake();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      mqReduce.removeEventListener('change', onVisibility);
      window.removeEventListener('pointermove', onWindowMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.remove();
    },
  };
}

export type RingTowerProps = RingTowerOptions & {
  className?: string;
  /** Receives the engine once it mounts, for pan, focus and the entrance. */
  onReady?: (instance: RingTowerInstance | null) => void;
};

/**
 * A tower of tilted bands wrapped in images. Transparent; the parent paints
 * the background. Options other than `rings`, `images` and `palette` are read
 * live.
 */
export function RingTower({ className, onReady, ...options }: RingTowerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<RingTowerInstance | null>(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const instance = createRingTower(root, options);
    instanceRef.current = instance;
    readyRef.current?.(instance);
    return () => {
      readyRef.current?.(null);
      instance?.destroy();
      instanceRef.current = null;
    };
    // The engine reads later options through setOptions; mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { images, rings, speed, draggable, parallax, backface, ground, lean, palette } = options;
  useEffect(() => {
    instanceRef.current?.setOptions({ speed, draggable, parallax, backface, ground, lean });
  }, [speed, draggable, parallax, backface, ground, lean]);
  useEffect(() => {
    instanceRef.current?.setOptions({ images, rings, palette });
    // Rebuilding restitches every strip; skip the mount pass.
  }, [images, rings, palette]);

  return (
    <div
      ref={rootRef}
      data-slot="ring-tower"
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden rounded-[inherit]', className)}
    />
  );
}
