'use client';

// Type Remix Preloader — a loading gate for a designer's portfolio that
// re-typesets one word through seven cover treatments while the page loads:
// die-cut stickers, felt letters with a pirate mascot, inflated bubble type,
// a sticker-outlined script, stretched condensed caps, a vector-tool canvas
// and a ransom-note collage. Each take wipes over the last as the count climbs,
// and at 100 the camera pulls back to show every take pinned to one moodboard
// before the tiles burst away off whatever the gate was guarding.
//
// Click anywhere while it loads to slap a sticker down. The pointer drifts the
// stickers in parallax and steers the cursor on the vector take.
//
// Adapted for the portfolio (see docs/VALIDATION.md): brand colours, a
// scroll mode that drives the takes and the moodboard from scroll instead of
// the timers, per-take copy (so each take can carry its own chapter), a link
// tile on the moodboard, and pausing while off screen.
//
// One file, React only. Every rule in the scoped <style> is .rtp- prefixed and
// every sticker is SVG drawn here. The display faces arrive by an injected
// Google Fonts <link> (pass fontHref={null} to load nothing and use the
// fallback stacks).

import * as React from 'react';

export type RemixTake = 'sticker' | 'felt' | 'bubble' | 'script' | 'stretch' | 'vector' | 'cutout';

/** A sticker placed on a take: x and y in percent of the stage, rot in degrees. */
export interface RemixDecal {
  /** A drawn sticker, or `image` for a picture given by `src`. */
  kind: 'smile' | 'heart' | 'bolt' | 'flower' | 'star' | 'hi' | 'image';
  src?: string;
  x: number;
  y: number;
  rot?: number;
  /** Width relative to a dropped sticker. Defaults to 1. */
  size?: number;
  /** Where it sits on a phone-sized stage, when that differs. */
  mx?: number;
  my?: number;
}

export interface RemixTheme {
  /** The take's background. */
  bg: string;
  /** The wordmark colour. */
  ink: string;
  /** Supporting colour: the arc, the outline, the mascot, the paper. */
  accent: string;
  /** Per-letter colours, cycled. Used by the felt and bubble takes. */
  pop: string[];
}

export interface TypeRemixPreloaderProps {
  /** Content revealed once the gate lifts. Ignored while `loop` is set. */
  children?: React.ReactNode;
  /** Run forever as a showcase: children are never revealed, onComplete never fires. */
  loop?: boolean;
  /**
   * Real loading progress, 0–100. Leave undefined to run the built-in
   * simulated load over `durationMs`. The count holds until this hits 100.
   */
  progress?: number;
  /** Length of the simulated load. Defaults to 7000ms. */
  durationMs?: number;
  /** The word that gets remixed. Two-line takes break it in half, or at a space. */
  word?: string;
  /** Your name: the byline on the takes and the index tile. */
  name?: string;
  /** The discipline line in the HUD and on the script take. */
  discipline?: string;
  /** The handwritten year and the badge year. */
  year?: string;
  /** The date range in the HUD. */
  period?: string;
  /** Top-right HUD line: a handle or domain. */
  handle?: string;
  /** Services: the felt take's tag row, the vector badge and the index tile. */
  roles?: string[];
  /** The heading over the vector take. */
  kicker?: string;
  /** The line under the cut-out finale. */
  tagline?: string;
  /** The words that circle the sticker badge. */
  motto?: string;
  /** Which takes play, in order. The last one is the frame the count lands on. */
  takes?: RemixTake[];
  /** Colour overrides per take, merged over the defaults. */
  themes?: RemixThemesInput;
  /** Pull back to the moodboard of every take before lifting. Defaults to true. */
  moodboard?: boolean;
  /** Click to slap stickers down while it loads. Defaults to true. */
  stickers?: boolean;
  /** Stickers laid on each take, slapped down as it arrives. */
  decals?: { [K in RemixTake]?: RemixDecal[] };
  /** The corner type, the count and the progress hairline. Defaults to true. */
  hud?: boolean;
  /** Stylesheet for the display faces. null loads nothing. */
  fontHref?: string | null;
  /** Root height. A definite length, never a percentage. */
  height?: string;
  /** Fired once, after the gate has lifted. */
  onComplete?: () => void;
  /** Extra root class names. */
  className?: string;
  /**
   * Scroll mode: raw scroll progress, 0–1 (see RTP_SCROLL). The gate eases
   * toward it every frame; the timers, `progress` and `loop` are ignored, and
   * the moodboard is where it ends.
   */
  scrub?: { readonly current: number };
  /** Copy per take, merged over the shared props, so every take can say something else. */
  slides?: RemixSlides;
  /** HUD names per take. */
  labels?: Partial<RemixLabelMap>;
  /** Turns the moodboard's count tile into a link. */
  cta?: { href: string; label: string; kicker: string; note: string; download?: boolean };
  /** The gate's own ground, shown between takes. Defaults to near black. */
  ground?: string;
  /** Accessible name of the gate in scroll mode. */
  label?: string;
}

/** The copy a take reads, all optional. */
/** One line of a slide's fact sheet: a small label over its value. */
export interface RemixFact {
  k: string;
  v: string;
  /** An optional badge image shown with the fact. */
  icon?: string;
  /** An optional count stamped on the fact, such as "18 stores". */
  n?: string;
}

export interface RemixSlide {
  /** The fact sheet shown with the take (hidden on the moodboard tiles). */
  facts: RemixFact[];
  word: string;
  name: string;
  discipline: string;
  year: string;
  roles: string[];
  kicker: string;
  tagline: string;
  handle: string;
  motto: string;
}

const ALL_TAKES: RemixTake[] = [
  'sticker',
  'felt',
  'bubble',
  'script',
  'stretch',
  'vector',
  'cutout',
];

const LABELS: RemixLabelMap = {
  sticker: 'Sticker',
  felt: 'Felt',
  bubble: 'Bubble',
  script: 'Script',
  stretch: 'Stretch',
  vector: 'Vector',
  cutout: 'Cut-out',
};

// Brand colourway: primary #5B8DFB, secondary #F8FA55, warm #F3D061, rose
// #E43468, ink #17284F.
const THEMES: RemixThemeMap = {
  sticker: { bg: '#17284f', ink: '#f8fa55', accent: '#e43468', pop: [] },
  felt: {
    bg: '#5b8dfb',
    ink: '#ffffff',
    accent: '#e43468',
    pop: [
      '#f8fa55',
      '#17284f',
      '#e43468',
      '#ffffff',
      '#f3d061',
      '#17284f',
      '#f8fa55',
      '#e43468',
      '#ffffff',
    ],
  },
  bubble: {
    bg: '#17284f',
    ink: '#ffffff',
    accent: '#f8fa55',
    pop: [
      '#f8fa55',
      '#5b8dfb',
      '#e43468',
      '#f3d061',
      '#5b8dfb',
      '#f8fa55',
      '#e43468',
      '#f3d061',
      '#5b8dfb',
    ],
  },
  script: { bg: '#5b8dfb', ink: '#17284f', accent: '#ffffff', pop: [] },
  stretch: { bg: '#e43468', ink: '#17284f', accent: '#ffffff', pop: [] },
  vector: { bg: '#17284f', ink: '#f8fa55', accent: '#ffffff', pop: [] },
  cutout: { bg: '#0f1a36', ink: '#17284f', accent: '#f8fa55', pop: [] },
};

/**
 * Scroll mode: the takes run to `takes`, the last one holds to `zoom`, and the
 * scroll pulls back onto the moodboard by `board`, both ways.
 */
export const RTP_SCROLL = { takes: 0.7, zoom: 0.74, board: 0.86 } as const;

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Caveat:wght@700&family=DM+Serif+Display&family=Rubik:wght@900&family=Shrikhand&family=Space+Mono:wght@400;700&family=Titan+One&display=swap';

const FONT_PROBES = [
  '400 1em "Archivo Black"',
  '400 1em "Anton"',
  '400 1em "Titan One"',
  '400 1em "Shrikhand"',
  '900 1em "Rubik"',
  '400 1em "DM Serif Display"',
  '400 1em "Abril Fatface"',
  '700 1em "Caveat"',
  '400 1em "Space Mono"',
];

const MIN_TAKE_MS = 640;
const HOLD_MS = 1100;
const ZOOM_MS = 1300;
const BOARD_MS = 1500;
const SCATTER_MS = 1050;
const MAX_STICKERS = 12;

// #region timeline
// Pure helpers, lifted out and executed by tests/type-remix-preloader.test.mjs.

/** Clamp to [0, 1]. */
export function rtpClamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * The simulated load at time fraction t ∈ [0, 1], as a percentage. Eased, with
 * a few short stalls so it reads like assets arriving, and never backwards.
 * Exactly 0 at t = 0 and exactly 100 at t = 1.
 */
export function rtpSimulated(t: number) {
  const k = rtpClamp01(t);
  const ease = 1 - Math.pow(1 - k, 2.2);
  const stall = 0.03 * Math.sin(k * Math.PI * 4) * Math.sin(k * Math.PI);
  const v = (ease * 0.86 + k * 0.14 - stall) * 100;
  return k >= 1 ? 100 : Math.max(0, Math.min(100, v));
}

/** Which take shows at a percentage: equal slices, the last one holds to 100. */
export function rtpTakeAt(pct: number, n: number) {
  if (n <= 1) return 0;
  return Math.min(n - 1, Math.floor(rtpClamp01(pct / 100) * n));
}

/** Zero-padded three-digit count. */
export function rtpPad(pct: number) {
  const n = Math.max(0, Math.min(100, Math.floor(pct)));
  return (n < 10 ? '00' : n < 100 ? '0' : '') + n;
}

/** Two-digit index. */
export function rtpTwo(n: number) {
  return (n < 10 ? '0' : '') + n;
}

/** Break the word for two-line takes: at the first space, else in half. */
export function rtpSplit(word: string): [string, string] {
  const w = word.trim().replace(/\s+/g, ' ');
  const sp = w.indexOf(' ');
  if (sp > 0) return [w.slice(0, sp), w.slice(sp + 1)];
  if (w.length <= 4) return [w, ''];
  const h = Math.floor(w.length / 2);
  return [w.slice(0, h), w.slice(h)];
}

/** "PORTFOLIO" → "Portfolio", word by word. */
export function rtpTitle(word: string) {
  return word.toLowerCase().replace(/(^|\s)(\S)/g, (_m, s, c) => s + c.toUpperCase());
}

/** Index of the first O (or zero) in a line, or -1. */
export function rtpFindO(line: string) {
  const i = line.toUpperCase().search(/[O0]/);
  return i;
}

/** A small seeded PRNG (mulberry32), so every render cuts the same paper. */
export function rtpRand(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A scissor-cut clip-path: a rectangle whose edges wander by up to `amp` %. */
export function rtpJag(seed: number, amp = 5) {
  const r = rtpRand(seed * 9973 + 17);
  const j = () => Math.round(r() * amp * 10) / 10;
  const pts = [
    [j(), j()],
    [35 + r() * 30, j() * 0.6],
    [100 - j(), j()],
    [100 - j() * 0.6, 40 + r() * 20],
    [100 - j(), 100 - j()],
    [35 + r() * 30, 100 - j() * 0.6],
    [j(), 100 - j()],
    [j() * 0.6, 40 + r() * 20],
  ];
  return (
    'polygon(' +
    pts
      .map(([x = 0, y = 0]) => Math.round(x * 10) / 10 + '% ' + Math.round(y * 10) / 10 + '%')
      .join(', ') +
    ')'
  );
}

/** Mix a hex colour toward black by k ∈ [0, 1]. Accepts #rgb or #rrggbb. */
export function rtpShade(hex: string, k: number) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
  if (!/^[0-9a-f]{6}$/i.test(h)) return hex;
  const m = 1 - rtpClamp01(k);
  const c = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * m));
  return '#' + c.map((x) => (x < 16 ? '0' : '') + x.toString(16)).join('');
}

/**
 * The moodboard: a 3 × 3 grid with the final take in the centre (so the pull
 * back from full screen keeps its aspect), the other takes on the corners then
 * the edges, the index and count tiles filling the gaps. Returns nine slots.
 */
export function rtpBoard(n: number) {
  const order = [0, 2, 6, 8, 1, 7, 3, 5];
  const slots: { kind: string; take: number }[] = [];
  for (let i = 0; i < 9; i++) slots.push({ kind: 'take', take: n - 1 });
  const others = Math.max(0, n - 1);
  let extra = 0;
  let again = 0;
  order.forEach((pos, k) => {
    if (k < others) slots[pos] = { kind: 'take', take: k };
    else if (extra < 2) slots[pos] = { kind: extra++ === 0 ? 'index' : 'count', take: -1 };
    else slots[pos] = { kind: 'take', take: others ? again++ % others : n - 1 };
  });
  return slots;
}

/** How far the board starts zoomed so its centre cell exactly covers the gate. */
export function rtpZoom(w: number, h: number, gap: number) {
  const cw = (w - gap * 4) / 3;
  const ch = (h - gap * 4) / 3;
  if (cw <= 0 || ch <= 0) return 3;
  return Math.max(w / cw, h / ch);
}
// #endregion

const RTP_CSS = `
.rtp-root { position: relative; width: 100%; overflow: hidden; isolation: isolate; }
.rtp-gate {
  position: absolute; inset: 0; z-index: 2; overflow: hidden; background: var(--rtp-ground, #0b0b0b); color: #fff;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; user-select: none; -webkit-user-select: none;
  transition: background-color 700ms ease; touch-action: manipulation;
}
.rtp-gate[data-stick="true"] { cursor: crosshair; }
.rtp-gate[data-idle="true"] *, .rtp-gate[data-idle="true"] *::before, .rtp-gate[data-idle="true"] *::after { animation-play-state: paused !important; }
.rtp-gate[data-phase="scatter"][data-loop="false"] { background-color: transparent; }
.rtp-stage { position: absolute; inset: 0; }
.rtp-slide { position: absolute; inset: 0; animation: rtp-wipe-b 620ms cubic-bezier(.77,0,.18,1) both; }
.rtp-slide[data-dir="1"] { animation-name: rtp-wipe-l; }
.rtp-slide[data-dir="2"] { animation-name: rtp-wipe-t; }
.rtp-slide[data-dir="3"] { animation-name: rtp-wipe-r; }
.rtp-slide[data-first="true"] { animation-name: rtp-fade-in; animation-duration: 500ms; }
@keyframes rtp-wipe-b { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes rtp-wipe-l { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes rtp-wipe-t { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes rtp-wipe-r { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
@keyframes rtp-fade-in { from { opacity: 0; } }

.rtp-take {
  position: absolute; inset: 0; overflow: hidden; container-type: size;
  background: var(--bg); color: var(--ink); display: grid; place-items: center;
}
.rtp-take svg { max-width: none; overflow: visible; display: block; }
.rtp-take[data-still="true"] .rtp-in { animation: none !important; }
.rtp-word { position: relative; margin: 0; white-space: nowrap; }
.rtp-line { display: block; white-space: nowrap; }
.rtp-ch { display: inline-block; position: relative; }
.rtp-par {
  translate: calc(var(--rtp-px, 0) * var(--dp, 10) * 1px) calc(var(--rtp-py, 0) * var(--dp, 10) * 1px);
  transition: translate 700ms cubic-bezier(.2,.8,.2,1);
}
.rtp-abs { position: absolute; }
.rtp-sticker { filter: drop-shadow(0 0.5cqmin 0.9cqmin rgba(0,0,0,.38)); }
.rtp-die * { fill: #fff !important; stroke: #fff !important; stroke-width: 9px; stroke-linejoin: round; stroke-linecap: round; }
.rtp-slap { animation: rtp-slap 560ms cubic-bezier(.2,1.5,.4,1) both; animation-delay: var(--dl, 0ms); }
@keyframes rtp-slap { from { transform: scale(1.9) rotate(-18deg); opacity: 0; } 40% { opacity: 1; } }
.rtp-spin { animation: rtp-spin 14s linear infinite; transform-origin: 50px 50px; }
.rtp-spin-r { animation-direction: reverse; }
@keyframes rtp-spin { to { transform: rotate(360deg); } }
.rtp-bob { animation: rtp-bob 2.6s ease-in-out infinite; }
@keyframes rtp-bob { 50% { translate: 0 -5%; } }

/* ---- sticker ---- */
.rtp-t-sticker .rtp-word {
  font-family: var(--rtp-heavy); font-size: min(calc(112cqw / var(--n2)), 29cqh);
  line-height: .8; letter-spacing: -.035em; text-transform: uppercase; translate: 0 -3cqh;
}
.rtp-t-sticker .rtp-line:first-child { padding-left: .34em; }
.rtp-t-sticker .rtp-ch { animation: rtp-pop 640ms cubic-bezier(.34,1.56,.64,1) both; animation-delay: calc(var(--i) * 45ms + 140ms); }
@keyframes rtp-pop { from { transform: translateY(.35em) scale(.6); opacity: 0; } 55% { opacity: 1; } }
.rtp-arc { left: 30%; top: -.16em; width: 42%; }
.rtp-arc path { stroke-dasharray: 220; animation: rtp-draw 900ms cubic-bezier(.65,0,.35,1) both 520ms; }
@keyframes rtp-draw { from { stroke-dashoffset: 220; } }
.rtp-badge { left: 50%; top: 50%; width: 1.16em; translate: -50% -50%; }
.rtp-hand {
  position: absolute; left: 50%; top: calc(50% + min(calc(112cqw / var(--n2)), 29cqh) * .9); translate: -50% 0;
  font-family: var(--rtp-hand); color: var(--ac); font-size: min(4.4cqw, 7cqh); line-height: 1; rotate: -4deg;
}
.rtp-hand span { display: inline-block; animation: rtp-pop 500ms cubic-bezier(.34,1.56,.64,1) both 900ms; }

/* ---- felt ---- */
.rtp-t-felt .rtp-col { display: flex; flex-direction: column; align-items: center; translate: 0 2cqh; }
.rtp-tags {
  position: absolute; top: 7cqh; left: 0; right: 0; display: flex; justify-content: center; gap: 4.5cqw;
  font-family: var(--rtp-mono); font-weight: 700; font-size: clamp(8px, 1.15cqw, 13px); letter-spacing: .14em; text-transform: uppercase;
}
.rtp-tags i { font-style: normal; opacity: .9; }
.rtp-tags b { font-size: .7em; }
.rtp-hat { width: min(15cqw, 25cqh); margin-bottom: -1.2cqh; }
.rtp-t-felt .rtp-word {
  font-family: var(--rtp-felt); font-weight: 900; font-size: min(calc(112cqw / var(--n1)), 26cqh);
  line-height: .9; letter-spacing: -.02em; text-transform: uppercase; display: flex; align-items: center;
}
.rtp-t-felt .rtp-ch { animation: rtp-drop 700ms cubic-bezier(.3,1.6,.5,1) both; animation-delay: calc(var(--i) * 55ms + 160ms); }
@keyframes rtp-drop { from { transform: translateY(-.7em) rotate(-14deg); opacity: 0; } 50% { opacity: 1; } }
.rtp-felt-ch { display: inline-block; color: var(--c); text-shadow: 0 .045em 0 var(--sh); rotate: var(--rz); }
.rtp-wheel { width: .92em; height: .92em; margin: 0 .02em; }
.rtp-byline {
  margin-top: 2.4cqh; font-family: var(--rtp-heavy); font-size: clamp(10px, 1.7cqw, 22px); letter-spacing: .04em; text-transform: uppercase;
}
.rtp-wave { position: absolute; left: 50%; bottom: 11cqh; width: min(52cqw, 90cqh); translate: -50% 0;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
.rtp-wave g { animation: rtp-wave 2.4s linear infinite; }
@keyframes rtp-wave { to { transform: translateX(-100px); } }

/* ---- bubble ---- */
.rtp-t-bubble { background:
  radial-gradient(60cqw 50cqh at 18% 12%, rgba(255,255,255,.07), transparent 60%),
  radial-gradient(50cqw 60cqh at 85% 90%, rgba(255,255,255,.05), transparent 60%),
  linear-gradient(160deg, #24386a, var(--bg) 55%, #0f1a36); }
.rtp-pill {
  position: absolute; font-family: var(--rtp-heavy); font-size: clamp(8px, 1.05cqw, 12px); letter-spacing: .12em; text-transform: uppercase;
  color: var(--ac); border: 1.5px solid var(--ac); border-radius: 99px; padding: .45em 1.1em .4em; background: rgba(0,0,0,.35); line-height: 1;
}
.rtp-pill-top { top: 7cqh; left: 50%; translate: -50% 0; }
.rtp-rule { position: absolute; top: calc(7cqh + 1em); height: 1px; background: rgba(255,255,255,.22); }
.rtp-pill-bot { right: 9cqw; bottom: 17cqh; }
.rtp-t-bubble .rtp-word {
  font-family: var(--rtp-round); font-size: min(calc(118cqw / var(--n2)), 28cqh);
  line-height: .9; letter-spacing: -.01em; text-transform: uppercase; text-align: center;
}
.rtp-t-bubble .rtp-ch { animation: rtp-boing 900ms cubic-bezier(.25,.8,.3,1) both; animation-delay: calc(var(--i) * 60ms + 120ms); transform-origin: 50% 100%; }
@keyframes rtp-boing {
  0% { transform: translateY(-60cqh) scale(.85, 1.25); opacity: 0; }
  45% { transform: translateY(0) scale(1.18, .78); opacity: 1; }
  65% { transform: translateY(-9%) scale(.94, 1.08); }
  82% { transform: translateY(0) scale(1.04, .96); }
}
.rtp-bub { display: inline-block; color: var(--c); rotate: var(--rz); text-shadow: var(--ts); position: relative; }
.rtp-bub::after {
  content: attr(data-ch); position: absolute; inset: 0; text-shadow: none; pointer-events: none;
  background: linear-gradient(170deg, rgba(255,255,255,.75), rgba(255,255,255,0) 38%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rtp-float { display: inline-block; animation: rtp-float 3.2s ease-in-out infinite; animation-delay: calc(var(--i) * -310ms); }
@keyframes rtp-float { 50% { translate: 0 -4%; } }
.rtp-burst { left: -.62em; top: .05em; width: .6em; }
.rtp-spark { width: .26em; }
.rtp-twinkle { animation: rtp-twinkle 1.8s ease-in-out infinite; transform-origin: 50px 50px; }
@keyframes rtp-twinkle { 50% { transform: scale(.55) rotate(45deg); opacity: .6; } }
.rtp-drip { width: .2em; }

/* ---- script ---- */
.rtp-t-script { background: radial-gradient(90cqw 70cqh at 50% 40%, #82a9fc, var(--bg) 70%); }
.rtp-t-script .rtp-word {
  font-family: var(--rtp-script); font-size: min(calc(128cqw / var(--n1)), 30cqh); line-height: 1.1;
  letter-spacing: -.01em; color: var(--ink); translate: 0 -3cqh;
  -webkit-text-stroke: .15em var(--ac); paint-order: stroke fill;
  filter: drop-shadow(0 .035em 0 rgba(0,0,0,.18)) drop-shadow(0 .1em .14em rgba(0,0,0,.28));
}
.rtp-t-script .rtp-ch { animation: rtp-rise 700ms cubic-bezier(.2,1.3,.4,1) both; animation-delay: calc(var(--i) * 50ms + 140ms); }
@keyframes rtp-rise { from { transform: translateY(.4em) rotate(-10deg) scale(.8); opacity: 0; } 60% { opacity: 1; } }
.rtp-yr {
  right: .1em; top: .5em; font-family: var(--rtp-heavy); font-size: .17em; color: var(--ink);
  -webkit-text-stroke: .32em var(--ac); letter-spacing: 0; line-height: 1;
}
.rtp-sub {
  position: absolute; top: calc(50% + min(calc(128cqw / var(--n1)), 30cqh) * .42); left: 50%; translate: -50% 0;
  width: min(calc(128cqw / var(--n1) * 5.8), 84cqw); display: flex; justify-content: space-between; gap: 2em;
  font-family: var(--rtp-mono); font-size: clamp(9px, 1.45cqw, 18px); letter-spacing: .08em; text-transform: uppercase; color: var(--ac);
}
.rtp-sub span { animation: rtp-fade-in 600ms ease both 700ms; }
.rtp-sub small { font-size: .62em; vertical-align: super; margin-right: .5em; }

/* ---- stretch ---- */
.rtp-t-stretch { place-items: stretch; }
.rtp-meta-serif { position: absolute; font-family: var(--rtp-serif); color: var(--ac); line-height: 1; }
.rtp-stretch-yr { top: 7cqh; left: 3.5cqw; font-size: clamp(14px, 2.6cqw, 34px); }
.rtp-stretch-row {
  position: absolute; left: 1cqw; right: 1cqw; bottom: 30cqh; display: flex; align-items: flex-end; justify-content: space-between;
  font-family: var(--rtp-cond); font-size: min(calc(172cqw / var(--n1)), 30cqh); line-height: .78; text-transform: uppercase; color: var(--ink);
}
.rtp-t-stretch .rtp-ch { transform-origin: 50% 100%; animation: rtp-grow 820ms cubic-bezier(.2,1.25,.35,1) both; animation-delay: calc(var(--i) * 50ms + 120ms); }
@keyframes rtp-grow { from { transform: scaleY(0); } }
.rtp-st { display: inline-block; transform-origin: 50% 100%; scale: 1 var(--sy); rotate: var(--rz); animation: rtp-breathe 2.8s ease-in-out infinite; animation-delay: calc(var(--i) * -380ms); }
@keyframes rtp-breathe { 50% { scale: 1 calc(var(--sy) * .84); } }
.rtp-band { position: absolute; left: 0; right: 0; bottom: 0; height: 30cqh; background: linear-gradient(180deg, #17284f, #0c1530); }
.rtp-band::before { content: ""; position: absolute; inset: 0 0 auto; height: 1px; background: linear-gradient(90deg, transparent, rgba(248,250,85,.5), transparent); }
.rtp-stretch-name { left: 4cqw; bottom: 11cqh; text-align: left; font-family: var(--rtp-heavy); font-weight: 400; font-size: clamp(16px, 2.6cqw, 36px); letter-spacing: -.03em; color: #fff; }
.rtp-stretch-name i { display: block; font-family: var(--rtp-mono); font-style: normal; font-size: .38em; letter-spacing: .2em; text-transform: uppercase; opacity: .7; margin-top: .9em; }

/* ---- vector ---- */
.rtp-t-vector { background-color: var(--bg); background-image: radial-gradient(rgba(255,255,255,.12) 1px, transparent 1.4px); background-size: 3.2cqmin 3.2cqmin; }
.rtp-kicker { position: absolute; top: 9cqh; left: 8cqw; font-family: var(--rtp-heavy); color: var(--ac); font-size: clamp(16px, 3.6cqw, 48px); letter-spacing: .06em; text-transform: uppercase; line-height: 1; }
.rtp-kicker.rtp-in { animation: rtp-type 700ms steps(9, end) both 200ms; }
@keyframes rtp-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.rtp-t-vector .rtp-word {
  font-family: var(--rtp-heavy); font-size: min(calc(104cqw / var(--n2)), 27cqh); line-height: .96; letter-spacing: .1em;
  text-transform: uppercase; translate: 0 6cqh;
}
.rtp-t-vector .rtp-ch { animation: rtp-up 700ms cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 50ms + 160ms); }
@keyframes rtp-up { from { transform: translateY(40%); opacity: 0; filter: blur(8px); } }
.rtp-eye { left: 50%; top: 50%; width: .66em; translate: -50% -50%; filter: drop-shadow(0 .02em .04em rgba(0,0,0,.3)); }
.rtp-bbox { inset: .02em -.06em .04em -.08em; border: max(1.5px, .012em) solid var(--ac); }
.rtp-bbox.rtp-in { animation: rtp-type 600ms cubic-bezier(.65,0,.35,1) both 700ms; }
.rtp-bbox i { position: absolute; width: .09em; height: .09em; background: var(--ac); border: max(1px, .01em) solid var(--bg); }
.rtp-bbox i:nth-child(1) { left: -.05em; top: -.05em; }
.rtp-bbox i:nth-child(2) { right: -.05em; top: -.05em; }
.rtp-bbox i:nth-child(3) { left: -.05em; bottom: -.05em; }
.rtp-bbox i:nth-child(4) { right: -.05em; bottom: -.05em; }
.rtp-bbox i:nth-child(5) { left: calc(50% - .045em); top: -.05em; }
.rtp-bbox i:nth-child(6) { left: calc(50% - .045em); bottom: -.05em; }
.rtp-cursor { width: .2em; left: 22%; top: -.3em; }
.rtp-cursor-move { translate: calc(var(--rtp-px, 0) * 24cqw) calc(var(--rtp-py, 0) * 18cqh); transition: translate 900ms cubic-bezier(.2,.8,.2,1); }
.rtp-cursor-idle { animation: rtp-idle 4.8s ease-in-out infinite; }
@keyframes rtp-idle { 25% { translate: 1.4cqw 1cqh; } 60% { translate: -1cqw 1.6cqh; } }
.rtp-pen { width: .42em; left: 49%; top: .78em; }
.rtp-rings { width: .3em; right: 20%; top: -.42em; }
.rtp-seal { width: .82em; right: -.5em; bottom: -.08em; }

/* ---- cut-out ---- */
.rtp-t-cutout { background: radial-gradient(80cqw 70cqh at 50% 46%, #1f3263, var(--bg) 72%); }
.rtp-cut-row { display: flex; align-items: center; justify-content: center; gap: 0; translate: 0 -2cqh; font-size: min(calc(100cqw / var(--n1)), 28cqh); line-height: 1; }
.rtp-t-cutout .rtp-ch { animation: rtp-paste 420ms cubic-bezier(.2,1.4,.4,1) both; animation-delay: calc(var(--i) * 85ms + 120ms); filter: drop-shadow(0 .03em .05em rgba(0,0,0,.55)); }
@keyframes rtp-paste { from { transform: scale(1.7) rotate(-12deg); opacity: 0; } 30% { opacity: 1; } }
.rtp-cut {
  display: inline-block; position: relative; padding: .1em .12em .06em; margin: 0 -.03em; background: var(--ac); color: var(--ink);
  clip-path: var(--clip); rotate: var(--rz); translate: 0 var(--ty); text-transform: uppercase;
}
.rtp-cut[data-inv="true"] { background: #0c1530; color: var(--ac); box-shadow: inset 0 0 0 .05em var(--ac); }
.rtp-cut[data-dots="true"]::after {
  content: ""; position: absolute; left: 0; top: 0; width: 60%; height: 34%;
  background-image: radial-gradient(currentColor 28%, transparent 32%); background-size: .07em .09em; opacity: .9;
}
.rtp-bars { display: flex; gap: .06em; margin-left: .14em; align-self: stretch; padding: .06em 0; }
.rtp-bars i { width: .012em; min-width: 1px; background: var(--ac); opacity: .9; }
.rtp-bars i:nth-child(2) { width: .03em; }
.rtp-foot {
  position: absolute; left: 0; right: 0; top: calc(50% + min(calc(100cqw / var(--n1)), 28cqh) * .66); text-align: center; color: var(--ac);
}
.rtp-foot b { display: block; font-family: var(--rtp-heavy); font-weight: 400; font-size: clamp(11px, 2cqw, 26px); letter-spacing: .02em; text-transform: uppercase; }
.rtp-foot i { display: block; font-family: var(--rtp-mono); font-size: clamp(8px, 1.1cqw, 13px); letter-spacing: .2em; text-transform: uppercase; opacity: .7; margin-top: .7em; }
.rtp-foot.rtp-in { animation: rtp-fade-in 600ms ease both 1000ms; }

/* ---- fact sheets ---- */
.rtp-facts {
  position: absolute; left: 6cqw; right: 6cqw; z-index: 2; margin: 0; display: grid; text-align: left; color: var(--ink);
  grid-template-columns: repeat(auto-fit, minmax(max(132px, 12.5cqw), 1fr)); gap: 2cqh 2.4cqw;
}
.rtp-facts[data-at="bottom"] { bottom: 5cqh; }
.rtp-facts[data-at="top"] { top: 6cqh; }
.rtp-facts[data-at="band"] { left: 40cqw; right: 4cqw; bottom: 7cqh; color: #fff; }
.rtp-fact {
  border-top: 1px solid color-mix(in srgb, currentColor 34%, transparent); padding-top: .75em;
  animation: rtp-fade-in 600ms ease both; animation-delay: calc(var(--i) * 70ms + 650ms);
}
.rtp-fact dt { font-family: var(--rtp-mono); font-size: clamp(8px, .85cqw, 11px); letter-spacing: .16em; text-transform: uppercase; opacity: .72; }
.rtp-fact dd { margin: .4em 0 0; font-family: var(--rtp-heavy); font-size: clamp(11px, 1.2cqw, 16px); line-height: 1.18; letter-spacing: .01em; }
/* Each take dresses its facts in its own material. */
@keyframes rtp-fact-pop { from { opacity: 0; transform: translateY(1.2em) scale(.7) rotate(var(--r, 0deg)); } 60% { opacity: 1; } }
.rtp-fact:nth-child(4n+1) { --r: -2.4deg; } .rtp-fact:nth-child(4n+2) { --r: 1.8deg; }
.rtp-fact:nth-child(4n+3) { --r: -1.2deg; } .rtp-fact:nth-child(4n) { --r: 2.6deg; }
.rtp-fact:nth-child(5n+1) { --c: #f8fa55; --t: #17284f; } .rtp-fact:nth-child(5n+2) { --c: #e43468; --t: #fff; }
.rtp-fact:nth-child(5n+3) { --c: #fff; --t: #17284f; } .rtp-fact:nth-child(5n+4) { --c: #f3d061; --t: #17284f; }
.rtp-fact:nth-child(5n) { --c: #17284f; --t: #f8fa55; }

/* about: die-cut stickers */
.rtp-t-sticker .rtp-facts { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.6cqh 1.4cqw; }
.rtp-t-sticker .rtp-fact {
  border: 0; padding: .7em 1.1em .75em; border-radius: 1.1em; background: var(--c); color: var(--t);
  box-shadow: 0 0 0 4px #fff, 0 10px 22px rgba(0,0,0,.35); transform: rotate(var(--r)); text-align: center;
  animation-name: rtp-fact-pop; animation-timing-function: cubic-bezier(.2,1.5,.4,1);
}
.rtp-t-sticker .rtp-fact dd { margin-top: .25em; }
.rtp-t-sticker .rtp-facts[data-at="bottom"] { display: grid; grid-template-columns: 1fr 1fr; align-items: start; left: 46.5cqw; right: 15cqw; top: 49cqh; bottom: auto; gap: 1.4cqh 1.2cqw; }
.rtp-t-sticker .rtp-fact { padding: .5em .9em .55em; }
.rtp-t-sticker .rtp-fact dd { font-size: clamp(10px, 1.05cqw, 15px); }
.rtp-t-bubble:has(.rtp-facts) .rtp-pill-bot { display: none; }

/* experience: stitched felt patches, pegged up like name tags and numbered */
.rtp-t-felt .rtp-facts {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 3.4cqh 1.6cqw; padding-top: 1.4cqh;
  left: 4cqw; right: 4cqw;
  counter-reset: job;
}
.rtp-t-felt .rtp-fact {
  position: relative; flex: 0 1 max(140px, 15.4cqw); counter-increment: job;
  border: 0; padding: .8em 1em; border-radius: .9em; background: var(--c); color: var(--t);
  outline: 2px dashed color-mix(in srgb, var(--t) 55%, transparent); outline-offset: -6px;
  box-shadow: 0 4px 0 rgba(0,0,0,.18), 0 12px 20px -10px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.12);
  font-family: var(--rtp-felt); transform: rotate(var(--r));
  animation-name: rtp-fact-pop; animation-timing-function: cubic-bezier(.2,1.5,.4,1);
}
.rtp-t-felt .rtp-fact::before {
  content: ''; position: absolute; left: 50%; top: -.95em; width: .75em; height: 1.6em; border-radius: .28em;
  background: #fff; box-shadow: inset 0 0 0 2px #17284f, 0 2px 0 rgba(0,0,0,.2);
  transform: translateX(-50%) rotate(calc(var(--r) * -2.5));
}
.rtp-t-felt .rtp-fact::after {
  content: counter(job, decimal-leading-zero); position: absolute; right: -.7em; top: -.8em;
  display: grid; place-items: center; width: 2.3em; height: 2.3em; border-radius: 50%;
  background: #17284f; color: #f8fa55; font: 800 clamp(9px, .8cqw, 12px)/1 var(--rtp-felt);
  box-shadow: 0 0 0 2px #fff; transform: rotate(10deg);
}
.rtp-t-felt .rtp-fact:nth-child(5n) { --c: #fff; --t: #17284f; }
.rtp-t-felt .rtp-fact-icon {
  float: none; position: absolute; right: -1.1em; top: -1.25em; width: 3.4em; height: 3.4em; margin: 0;
  transform: rotate(calc(var(--r) * -3)); filter: drop-shadow(0 4px 6px rgba(0,0,0,.3));
}
.rtp-t-felt .rtp-fact:has(.rtp-fact-icon)::after { display: none; }
.rtp-t-felt .rtp-fact:has(.rtp-fact-icon) { padding-right: 2.2em; }
.rtp-t-felt .rtp-fact dt { font-family: var(--rtp-felt); font-weight: 700; opacity: .8; }
.rtp-t-felt .rtp-fact dd { font-family: var(--rtp-felt); font-weight: 800; }

/* services: inflated balloons */
.rtp-t-bubble .rtp-facts { gap: 2cqh 1.6cqw; }
.rtp-t-bubble .rtp-fact {
  border: 0; padding: 1em 1.2em 1.1em; border-radius: 2.2em; background: var(--c); color: var(--t);
  background-image: radial-gradient(120% 90% at 30% 15%, rgba(255,255,255,.55), transparent 55%);
  box-shadow: inset 0 -.5em .9em rgba(0,0,0,.18), 0 .5em 0 color-mix(in srgb, var(--c) 55%, #000), 0 1.1em 1.6em rgba(0,0,0,.35);
  animation-name: rtp-fact-pop; animation-timing-function: cubic-bezier(.3,1.7,.5,1);
}
.rtp-t-bubble .rtp-fact dt { font-family: var(--rtp-round); letter-spacing: .06em; opacity: .85; }
.rtp-t-bubble .rtp-fact dd { font-family: var(--rtp-round); font-weight: 400; }
/* Each service carries its proof: a count of shipped projects, and a badge when one is given. */
/* Six even balloons under a lifted title: count badge top-left, the service's
   badge popping off the top-right corner, then the name and the proof. */
.rtp-t-bubble:has(.rtp-facts) .rtp-word { font-size: min(calc(100cqw / var(--n2)), 23cqh); translate: 0 -10cqh; }
.rtp-t-bubble .rtp-facts { left: 5cqw; right: 5cqw; bottom: 6cqh; gap: 2cqh 1.3cqw; align-items: stretch; }
.rtp-t-bubble .rtp-fact { position: relative; display: flex; flex-direction: column; padding: 2em 1.1em 1.2em; border-radius: 1.6em; }
.rtp-t-bubble .rtp-fact .rtp-fact-icon {
  float: none; position: absolute; right: -.5em; top: -1.4em; width: 3.3em; height: 3.3em; margin: 0;
  transform: rotate(calc(var(--r) * -3)); filter: drop-shadow(0 4px 6px rgba(0,0,0,.3));
}
.rtp-t-bubble .rtp-fact dt { padding-right: 1.6em; font-size: clamp(8px, .78cqw, 11px); line-height: 1.25; }
.rtp-t-bubble .rtp-fact dd { margin-top: .5em; padding-top: .55em; border-top: 1.5px dashed color-mix(in srgb, currentColor 30%, transparent); font-size: clamp(11px, 1.05cqw, 15px); line-height: 1.25; }
.rtp-fact-n {
  position: absolute; left: 1em; top: 0; translate: 0 -55%; padding: .35em .8em .4em; border-radius: 99em;
  background: #17284f; color: #f8fa55; box-shadow: 0 0 0 2px #fff, 0 4px 10px rgba(0,0,0,.3);
  font: 400 clamp(10px, .95cqw, 14px)/1 var(--rtp-round); letter-spacing: .04em; white-space: nowrap;
  animation: rtp-fact-pop 520ms cubic-bezier(.3,1.7,.5,1) both; animation-delay: calc(var(--i) * 70ms + 900ms);
}
.rtp-t-bubble .rtp-fact:nth-child(5n) .rtp-fact-n { background: #f8fa55; color: #17284f; }

/* The last four sheets: die-cut paper slapped on each take's own ground. */
@keyframes rtp-slap-in {
  0% { opacity: 0; transform: translateY(1.8em) scale(.86) rotate(calc(var(--r, 0deg) * 3)); }
  55% { opacity: 1; }
  100% { opacity: 1; transform: rotate(var(--r, 0deg)); }
}
.rtp-t-script .rtp-fact, .rtp-t-stretch .rtp-fact, .rtp-t-vector .rtp-fact, .rtp-t-cutout .rtp-fact {
  position: relative; border: 0; transform: rotate(var(--r, 0deg));
  animation: rtp-slap-in 1100ms cubic-bezier(.22,1.2,.36,1) both; animation-delay: calc(var(--i) * 140ms + 700ms);
}
.rtp-t-script .rtp-fact dd, .rtp-t-stretch .rtp-fact dd, .rtp-t-vector .rtp-fact dd { font-family: var(--rtp-text); }

/* process: four numbered stickers on a stitched line, numbers in the title's outlined script */
.rtp-t-script .rtp-facts { grid-template-columns: repeat(4, 1fr); gap: 2.6cqw; counter-reset: step; align-items: stretch; }
.rtp-t-script .rtp-facts::before {
  content: ""; position: absolute; left: 3%; right: 3%; top: 55%; z-index: -1; border-top: 3px dashed rgba(255,255,255,.75);
}
.rtp-t-script .rtp-fact {
  counter-increment: step; padding: 2.5em 1.3em 1.35em; border-radius: 1.4em; background: var(--c); color: var(--t);
  box-shadow: 0 0 0 5px #fff, 0 1.3em 2.4em -.9em rgba(23,40,79,.6);
}
.rtp-t-script .rtp-fact::before {
  content: counter(step, decimal-leading-zero); position: absolute; left: .5em; top: -.6em; rotate: -8deg;
  font: 400 clamp(30px, 3.4cqw, 54px)/1 var(--rtp-script); color: #17284f;
  -webkit-text-stroke: .17em #fff; paint-order: stroke fill;
}
.rtp-t-script .rtp-fact dt { font: 400 clamp(15px, 1.65cqw, 24px)/1.05 var(--rtp-heavy); letter-spacing: -.01em; text-transform: none; opacity: 1; }
.rtp-t-script .rtp-fact dd { margin-top: .55em; font-size: clamp(12px, 1.05cqw, 16px); font-weight: 700; line-height: 1.35; opacity: .86; }

/* education: masking-tape labels with torn ends, laid across the navy band */
.rtp-t-stretch .rtp-facts { grid-template-columns: repeat(3, 1fr); gap: 2.4cqh 1.6cqw; align-items: start; }
.rtp-t-stretch .rtp-fact {
  padding: .75em 1.4em .8em; background: var(--c); color: var(--t);
  clip-path: polygon(0 0, 100% 0, 97% 18%, 100% 36%, 97% 54%, 100% 72%, 97% 88%, 100% 100%, 0 100%, 3% 84%, 0 66%, 3% 48%, 0 30%, 3% 14%);
}
.rtp-t-stretch .rtp-fact:nth-child(5n) { --c: #5b8dfb; --t: #fff; }
.rtp-t-stretch .rtp-fact dt { font: 400 clamp(9px, .8cqw, 12px)/1 var(--rtp-heavy); letter-spacing: .12em; text-transform: uppercase; opacity: .72; }
.rtp-t-stretch .rtp-fact dd { margin-top: .4em; font-size: clamp(13px, 1.35cqw, 20px); font-weight: 700; line-height: 1.2; }

/* certificates: white stickers with a star seal; one sits selected, like a layer in Figma */
.rtp-t-vector .rtp-facts { gap: 2.4cqh 1.8cqw; }
.rtp-t-vector .rtp-fact {
  padding: 1em 1.6em 1.05em 1.1em; border-radius: .9em; background: #fff; color: #17284f;
  box-shadow: 0 0 0 4px #fff, 0 1.2em 2.2em -.8em rgba(0,0,0,.65);
}
.rtp-t-vector .rtp-fact:nth-child(2) { outline: 1.5px solid #5b8dfb; outline-offset: 7px; }
.rtp-t-vector .rtp-fact:nth-child(2)::after {
  content: ""; position: absolute; inset: -11.5px; pointer-events: none;
  background:
    linear-gradient(#fff, #fff) left 2px top 2px / 5px 5px no-repeat, linear-gradient(#fff, #fff) right 2px top 2px / 5px 5px no-repeat,
    linear-gradient(#fff, #fff) left 2px bottom 2px / 5px 5px no-repeat, linear-gradient(#fff, #fff) right 2px bottom 2px / 5px 5px no-repeat,
    linear-gradient(#5b8dfb, #5b8dfb) left top / 9px 9px no-repeat, linear-gradient(#5b8dfb, #5b8dfb) right top / 9px 9px no-repeat,
    linear-gradient(#5b8dfb, #5b8dfb) left bottom / 9px 9px no-repeat, linear-gradient(#5b8dfb, #5b8dfb) right bottom / 9px 9px no-repeat;
}
.rtp-t-vector .rtp-fact::before {
  content: "✓"; position: absolute; right: -1em; top: -1.15em; z-index: 1; display: grid; place-items: center; width: 2.7em; height: 2.7em;
  background: var(--s, #f8fa55); color: #17284f; font: 400 clamp(11px, 1cqw, 15px)/1 var(--rtp-heavy); rotate: 12deg;
  clip-path: polygon(50% 0%, 59.8% 13.3%, 75% 6.7%, 76.9% 23.1%, 93.3% 25%, 86.7% 40.2%, 100% 50%, 86.7% 59.8%, 93.3% 75%, 76.9% 76.9%, 75% 93.3%, 59.8% 86.7%, 50% 100%, 40.2% 86.7%, 25% 93.3%, 23.1% 76.9%, 6.7% 75%, 13.3% 59.8%, 0% 50%, 13.3% 40.2%, 6.7% 25%, 23.1% 23.1%, 25% 6.7%, 40.2% 13.3%);
}
.rtp-t-vector .rtp-fact:nth-child(3n+2) { --s: #e43468; }
.rtp-t-vector .rtp-fact:nth-child(3n) { --s: #f3d061; }
.rtp-t-vector .rtp-fact:nth-child(3n+2)::before { color: #fff; }
.rtp-t-vector .rtp-fact dt { font: 400 clamp(9px, .78cqw, 12px)/1 var(--rtp-heavy); color: #5b8dfb; letter-spacing: .1em; text-transform: uppercase; opacity: 1; }
.rtp-t-vector .rtp-fact dd { margin-top: .45em; font-size: clamp(13px, 1.25cqw, 18px); font-weight: 700; line-height: 1.25; }

/* résumé: torn paper scraps taped down, tools cut out like ransom-note words */
.rtp-t-cutout .rtp-facts { grid-template-columns: repeat(4, 1fr); gap: 2.2cqw; align-items: start; }
.rtp-t-cutout .rtp-fact {
  padding: 1.7em 1.1em 1.25em; background: var(--c); color: var(--t);
  clip-path: polygon(1% 4%, 18% 0, 41% 3%, 63% 0, 86% 4%, 100% 1%, 98% 32%, 100% 64%, 99% 100%, 71% 96%, 45% 100%, 21% 96%, 0 100%, 2% 66%, 0 34%);
}
.rtp-t-cutout .rtp-fact::before {
  content: ""; position: absolute; left: 50%; top: .25em; width: 4.6em; height: 1.1em; translate: -50% 0; rotate: -4deg;
  background: rgba(255,255,255,.6); box-shadow: inset 0 0 0 1px rgba(23,40,79,.08);
}
.rtp-t-cutout .rtp-fact dt { font: 400 clamp(16px, 1.7cqw, 26px)/1 var(--rtp-cond); letter-spacing: .02em; text-transform: uppercase; opacity: 1; }
.rtp-t-cutout .rtp-fact dd { display: flex; flex-wrap: wrap; gap: .45em .35em; margin-top: .75em; }
.rtp-chip {
  padding: .4em .6em .45em; border-radius: .2em; background: #17284f; color: #fff; white-space: nowrap;
  font: 700 clamp(11px, 1cqw, 15px)/1 var(--rtp-text); rotate: -2deg;
}
.rtp-chip:nth-child(even) { background: #fff; color: #17284f; box-shadow: inset 0 0 0 1.5px #17284f; rotate: 2deg; font-family: var(--rtp-heavy); font-weight: 400; }
.rtp-chip:nth-child(3n) { rotate: -4deg; }

/* phones: the same materials, packed two to a row */
@container (max-width: 560px) {
  .rtp-t-sticker .rtp-facts[data-at="bottom"] { display: grid; grid-template-columns: 1fr 1fr; left: 5cqw; right: 5cqw; top: auto; bottom: 4cqh; gap: 2cqh 3cqw; }
  .rtp-t-felt .rtp-facts { display: grid; grid-template-columns: 1fr 1fr; left: 4cqw; right: 4cqw; top: 4cqh; gap: 1.6cqh 3cqw; }
  .rtp-t-felt .rtp-fact::before { display: none; }
  .rtp-t-felt .rtp-fact { padding: .45em .65em; }
  .rtp-t-felt .rtp-fact dd, .rtp-t-bubble .rtp-fact dd, .rtp-t-sticker .rtp-fact dd { font-size: 10px; }
  .rtp-t-felt .rtp-fact dt { font-size: 7.5px; }
  /* Clear of the page's bottom shortcut bar on phones. */
  .rtp-t-bubble .rtp-facts { gap: 2.2cqh 3cqw; bottom: calc(2cqh + 58px); }
  .rtp-t-bubble .rtp-fact { padding: 1.5em .8em .7em; border-radius: 1.2em; }
  .rtp-t-bubble .rtp-fact .rtp-fact-icon { width: 2.6em; height: 2.6em; top: -1.1em; }
  .rtp-t-bubble:has(.rtp-facts) .rtp-word { translate: 0 -16cqh; }
  .rtp-decal { left: var(--mx) !important; top: var(--my) !important; width: calc(min(11cqw, 17cqh) * var(--ds) * .9) !important; }
}


.rtp-take[data-still="true"] .rtp-facts { display: none; }
@container (max-width: 560px) { .rtp-facts[data-at="band"] { left: 4cqw; bottom: 3cqh; } .rtp-t-stretch .rtp-stretch-name { display: none; } }
/* Phones: the four sheets pack two to a row (after the base rules, so these win). */
@container (max-width: 560px) {
  .rtp-t-script .rtp-facts, .rtp-t-stretch .rtp-facts, .rtp-t-vector .rtp-facts, .rtp-t-cutout .rtp-facts { grid-template-columns: 1fr 1fr; gap: 2.4cqh 3.6cqw; bottom: calc(1.5cqh + 60px); }
  .rtp-t-stretch .rtp-facts { gap: 1.4cqh 3.6cqw; }
  .rtp-t-script .rtp-facts::before { display: none; }
  .rtp-t-script .rtp-fact { padding: 1.9em .9em .95em; box-shadow: 0 0 0 4px #fff, 0 1em 2em -.8em rgba(23,40,79,.6); }
  .rtp-t-script .rtp-fact::before { font-size: 26px; }
  .rtp-t-script .rtp-fact dt { font-size: 14px; }
  .rtp-t-script .rtp-fact dd { font-size: 11px; }
  .rtp-t-stretch .rtp-fact { padding: .6em 1em .65em; }
  .rtp-t-stretch .rtp-fact dt { font-size: 8px; }
  .rtp-t-stretch .rtp-fact dd { font-size: 12px; }
  .rtp-t-vector .rtp-fact { padding: .8em 1.2em .85em .8em; }
  .rtp-t-vector .rtp-fact:nth-child(2) { outline-offset: 5px; }
  .rtp-t-vector .rtp-fact:nth-child(2)::after { inset: -9.5px; }
  .rtp-t-vector .rtp-fact::before { font-size: 10px; }
  .rtp-t-vector .rtp-fact dd { font-size: 12px; }
  .rtp-t-cutout .rtp-fact { padding: 1.4em .8em .9em; }
  .rtp-t-cutout .rtp-fact dt { font-size: 15px; }
  .rtp-chip { font-size: 10px; }
}

/* ---- stickers you drop ---- */
.rtp-drops { position: absolute; inset: 0; z-index: 3; pointer-events: none; container-type: size; transition: opacity 400ms ease, transform 600ms cubic-bezier(.7,0,.3,1); }
.rtp-drops[data-gone="true"] { opacity: 0; transform: scale(.94); }
.rtp-drop { position: absolute; width: min(11cqw, 17cqh); translate: -50% -50%; }
.rtp-drop > svg { animation: rtp-slap 520ms cubic-bezier(.2,1.6,.4,1) both; animation-delay: var(--dl, 0ms); }
.rtp-decal-img {
  display: block; width: 100%; height: auto; filter: drop-shadow(0 8px 14px rgba(0,0,0,.28));
  animation: rtp-slap 520ms cubic-bezier(.2,1.6,.4,1) both; animation-delay: var(--dl, 0ms);
}
.rtp-fact-icon { float: right; width: 2.4em; height: 2.4em; margin: -.2em -.2em 0 .4em; }

/* ---- HUD ---- */
.rtp-hud {
  position: absolute; inset: 0; z-index: 4; pointer-events: none; color: #fff; mix-blend-mode: difference;
  font-family: var(--rtp-mono); font-size: clamp(8px, 1.4vmin, 11px); letter-spacing: .16em; text-transform: uppercase;
  transition: opacity 500ms ease;
}
.rtp-hud[data-gone="true"] { opacity: 0; }
.rtp-hud-top, .rtp-hud-bot { position: absolute; left: clamp(14px, 3vw, 36px); right: clamp(14px, 3vw, 36px); display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.rtp-hud-top { top: clamp(14px, 3vh, 28px); }
.rtp-hud-top span:nth-child(2) { text-align: center; }
.rtp-hud-bot { bottom: clamp(14px, 3vh, 28px); }
.rtp-hud-take { white-space: nowrap; }
.rtp-hud-hint { opacity: .6; transition: opacity 400ms ease; text-align: center; }
.rtp-hud-hint[data-off="true"] { opacity: 0; }
.rtp-count { font-family: var(--rtp-heavy); font-size: clamp(30px, 7vmin, 76px); letter-spacing: -.04em; line-height: .78; font-variant-numeric: tabular-nums; }
.rtp-count small { font-family: var(--rtp-mono); font-size: 11px; letter-spacing: .16em; vertical-align: top; margin-left: .3em; }
.rtp-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: #fff; transform-origin: 0 50%; }
@media (max-width: 560px) { .rtp-hud-top span:nth-child(2), .rtp-hud-hint { display: none; } }

/* ---- moodboard ---- */
.rtp-board {
  position: absolute; inset: 0; z-index: 2; display: grid; padding: var(--gap); gap: var(--gap);
  grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr));
}
.rtp-board[data-phase="zoom"] { animation: rtp-zoom 1300ms cubic-bezier(.76,0,.2,1) both; }
@keyframes rtp-zoom { from { transform: scale(var(--zs)); } }
.rtp-cell { position: relative; overflow: hidden; border-radius: var(--rad); contain: strict; }
.rtp-board[data-phase="zoom"] .rtp-cell { animation: rtp-round 1300ms cubic-bezier(.76,0,.2,1) both; }
@keyframes rtp-round { from { border-radius: 0; } }
.rtp-board[data-phase="scatter"] .rtp-cell { animation: rtp-fly 1000ms cubic-bezier(.55,0,.8,.25) both; animation-delay: var(--sd); }
@keyframes rtp-fly { to { transform: translate(var(--sx), var(--sy)) rotate(var(--sr)) scale(.9); opacity: 0; } }
.rtp-tile { position: absolute; inset: 0; container-type: size; padding: 7cqmin; display: flex; flex-direction: column; justify-content: space-between; }
.rtp-tile-index { background: #ffffff; color: #17284f; }
.rtp-tile-count { background: #f8fa55; color: #17284f; }
a.rtp-tile { text-decoration: none; cursor: pointer; transition: background-color 300ms ease; }
a.rtp-tile:hover { background: #ffffff; }
a.rtp-tile:focus-visible { outline: 3px solid #e43468; outline-offset: -6px; }
.rtp-tile-cta { font-family: var(--rtp-heavy); font-size: 9cqmin; letter-spacing: .02em; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
.rtp-tile-k { font-family: var(--rtp-mono); font-size: max(7px, 5cqmin); letter-spacing: .16em; text-transform: uppercase; display: flex; justify-content: space-between; }
.rtp-tile-name { font-family: var(--rtp-serif); font-size: 15cqmin; line-height: .95; letter-spacing: -.01em; }
.rtp-tile-roles { font-family: var(--rtp-mono); font-size: max(7px, 4.6cqmin); letter-spacing: .1em; text-transform: uppercase; line-height: 1.6; }
.rtp-tile-roles span { opacity: .45; margin-right: .8em; }
.rtp-tile-big { font-family: var(--rtp-heavy); font-size: 46cqmin; line-height: .8; letter-spacing: -.05em; }

.rtp-grain {
  position: absolute; inset: -50%; z-index: 5; pointer-events: none; opacity: .09; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
  animation: rtp-grain 900ms steps(4) infinite;
}
@keyframes rtp-grain { 25% { transform: translate(-3%, 2%); } 50% { transform: translate(2%, -3%); } 75% { transform: translate(-1%, -2%); } }
.rtp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .rtp-in, .rtp-loop, .rtp-slide, .rtp-grain { animation: none !important; }
  .rtp-board[data-phase="zoom"], .rtp-board[data-phase="zoom"] .rtp-cell { animation: none; }
  .rtp-board[data-phase="scatter"] .rtp-cell { animation: rtp-out 500ms ease both; }
  .rtp-par, .rtp-cursor-move { transition: none; translate: none; }
}
@keyframes rtp-out { to { opacity: 0; } }
`;

/* ------------------------------------------------------------------ art */

type Css = React.CSSProperties;
const css = (o: { [k: string]: string | number | undefined }) => o as Css;
const DARK = '#1b1717';

/** A die-cut sticker: the art drawn once as a fat white silhouette, then again on top. */
function Sticker({
  art,
  className = '',
  style,
  die = true,
  vb = '0 0 100 100',
}: {
  art: React.ReactNode;
  className?: string;
  style?: Css;
  die?: boolean;
  vb?: string;
}) {
  return (
    <svg
      viewBox={vb}
      className={'rtp-sticker ' + className}
      style={{ maxWidth: 'none', ...style }}
      aria-hidden="true"
    >
      {die ? <g className="rtp-die">{art}</g> : null}
      <g>{art}</g>
    </svg>
  );
}

function burst(cx: number, cy: number, r1: number, r2: number, n: number) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
  }
  return pts.join(' ');
}

function stampPath(x: number, y: number, w: number, h: number, r: number, nx: number, ny: number) {
  let d = 'M' + x + ' ' + y;
  const sx = w / nx;
  const sy = h / ny;
  const arc = (ex: number, ey: number) =>
    ' A' + r + ' ' + r + ' 0 0 0 ' + ex.toFixed(2) + ' ' + ey.toFixed(2);
  for (let i = 0; i < nx; i++) {
    const a = x + i * sx + sx / 2 - r;
    d += ' L' + a.toFixed(2) + ' ' + y + arc(a + 2 * r, y);
  }
  d += ' L' + (x + w) + ' ' + y;
  for (let i = 0; i < ny; i++) {
    const b = y + i * sy + sy / 2 - r;
    d += ' L' + (x + w) + ' ' + b.toFixed(2) + arc(x + w, b + 2 * r);
  }
  d += ' L' + (x + w) + ' ' + (y + h);
  for (let i = 0; i < nx; i++) {
    const a = x + w - i * sx - sx / 2 + r;
    d += ' L' + a.toFixed(2) + ' ' + (y + h) + arc(a - 2 * r, y + h);
  }
  d += ' L' + x + ' ' + (y + h);
  for (let i = 0; i < ny; i++) {
    const b = y + h - i * sy - sy / 2 + r;
    d += ' L' + x + ' ' + b.toFixed(2) + arc(x, b - 2 * r);
  }
  return d + ' Z';
}

function StampArt({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <clipPath id={uid + 'st'}>
          <rect x="17" y="15" width="66" height="70" />
        </clipPath>
      </defs>
      <path d={stampPath(8, 6, 84, 88, 2.6, 9, 9)} fill="#fbf6ea" />
      <g clipPath={'url(#' + uid + 'st)'}>
        <rect x="17" y="15" width="66" height="70" fill="#1f3f9e" />
        <circle cx="50" cy="104" r="34" fill="#f07a2b" />
        <circle cx="38" cy="78" r="3" fill="#c9561a" />
        <circle cx="60" cy="84" r="4.5" fill="#c9561a" />
        <path d="M41 46 L59 46 L72 86 L28 86 Z" fill="#ffd84d" opacity=".75" />
        <ellipse cx="50" cy="44" rx="19" ry="6.5" fill="#dfe3ea" stroke={DARK} strokeWidth="1.6" />
        <path d="M41 42 C41 30 59 30 59 42 Z" fill="#8fe0ff" stroke={DARK} strokeWidth="1.6" />
        <circle cx="38" cy="45" r="1.6" fill={DARK} />
        <circle cx="50" cy="47" r="1.6" fill={DARK} />
        <circle cx="62" cy="45" r="1.6" fill={DARK} />
        <circle cx="26" cy="24" r="1.1" fill="#fff" />
        <circle cx="72" cy="22" r="1.4" fill="#fff" />
        <circle cx="66" cy="32" r=".9" fill="#fff" />
        <circle cx="24" cy="38" r=".9" fill="#fff" />
      </g>
      <text
        x="20.5"
        y="22.5"
        fontSize="4.6"
        fill="#fbf6ea"
        letterSpacing=".6"
        style={{ fontFamily: 'var(--rtp-heavy)' }}
      >
        AIR MAIL
      </text>
    </>
  );
}

function BadgeArt({ uid, motto }: { uid: string; motto: string }) {
  const ring = (motto.trim() + ' ✿ ').repeat(2);
  return (
    <>
      <defs>
        <path id={uid + 'ring'} d="M50 15.5 a34.5 34.5 0 1 1 -0.01 0" />
      </defs>
      <circle cx="50" cy="50" r="45" fill="#1f2c69" stroke={DARK} strokeWidth="2" />
      <g className="rtp-spin rtp-loop">
        <text
          fontSize="9"
          fill="#f4f0e6"
          letterSpacing=".4"
          style={{ fontFamily: 'var(--rtp-heavy)' }}
        >
          <textPath href={'#' + uid + 'ring'} textLength="215" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="24" fill="#f4f0e6" stroke={DARK} strokeWidth="1.6" />
      <path
        d="M50 58 C49 66 47 70 44 74"
        stroke="#3f8f3a"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M48 66 C42 62 38 64 37 67 C41 69 45 68 48 66 Z" fill="#5fae4a" />
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="40.5"
          rx="3.6"
          ry="7.4"
          fill="#f6a02a"
          stroke="#7a3b1c"
          strokeWidth=".9"
          transform={'rotate(' + i * 36 + ' 50 49)'}
        />
      ))}
      <circle cx="50" cy="49" r="5.2" fill="#7a3b1c" />
      <circle cx="48.4" cy="47.6" r="1.4" fill="#c46a35" />
    </>
  );
}

const MUG = (
  <>
    <path d="M67 44 C86 42 86 72 66 70" stroke="#3a2a20" strokeWidth="6" fill="none" />
    <path d="M67 44 C86 42 86 72 66 70" stroke="#f4ead8" strokeWidth="2.6" fill="none" />
    <path
      d="M22 34 L70 34 L66 80 C65 86 61 90 55 90 L37 90 C31 90 27 86 26 80 Z"
      fill="#f4ead8"
      stroke="#3a2a20"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M27 50 L68 50" stroke="#e5c9a4" strokeWidth="5" />
    <ellipse cx="46" cy="34" rx="24" ry="5.5" fill="#8a4b23" stroke="#3a2a20" strokeWidth="2.6" />
    <path d="M56 34 C58 46 60 54 60 60" stroke="#3a2a20" strokeWidth="1.4" fill="none" />
    <rect
      x="54"
      y="60"
      width="12"
      height="14"
      rx="1.5"
      fill="#1f1f1f"
      transform="rotate(8 60 67)"
    />
    <rect x="57" y="63" width="6" height="2" fill="#f4ead8" transform="rotate(8 60 67)" />
  </>
);

const WAFFLE = (
  <g transform="rotate(-12 50 50)">
    <rect
      x="14"
      y="16"
      width="72"
      height="68"
      rx="13"
      fill="#e9a54c"
      stroke="#7a4416"
      strokeWidth="3"
    />
    {[0, 1, 2].map((i) =>
      [0, 1, 2].map((j) => (
        <rect
          key={i + '-' + j}
          x={23 + i * 19}
          y={25 + j * 18}
          width="14"
          height="13"
          rx="3"
          fill="#c6802f"
        />
      )),
    )}
    <path
      d="M24 22 C36 34 52 18 70 28 C76 34 68 42 63 37 C59 50 51 42 49 36 C40 44 31 34 24 22 Z"
      fill="#9a4b12"
      opacity=".92"
    />
    <rect
      x="40"
      y="36"
      width="20"
      height="15"
      rx="3"
      fill="#fff2a6"
      stroke="#7a4416"
      strokeWidth="2"
      transform="rotate(10 50 43)"
    />
  </g>
);

const FROG = (
  <>
    <circle cx="29" cy="34" r="14" fill="#62b04c" stroke="#1d3a19" strokeWidth="2.6" />
    <circle cx="71" cy="34" r="14" fill="#62b04c" stroke="#1d3a19" strokeWidth="2.6" />
    <ellipse cx="50" cy="60" rx="42" ry="29" fill="#62b04c" stroke="#1d3a19" strokeWidth="2.6" />
    <circle cx="29" cy="34" r="8" fill="#fff" stroke="#1d3a19" strokeWidth="1.6" />
    <circle cx="71" cy="34" r="8" fill="#fff" stroke="#1d3a19" strokeWidth="1.6" />
    <circle cx="31" cy="36" r="4" fill="#1d3a19" />
    <circle cx="69" cy="36" r="4" fill="#1d3a19" />
    <circle cx="32.4" cy="34.4" r="1.3" fill="#fff" />
    <circle cx="70.4" cy="34.4" r="1.3" fill="#fff" />
    <ellipse cx="24" cy="62" rx="7" ry="4" fill="#ff8fa3" opacity=".85" />
    <ellipse cx="76" cy="62" rx="7" ry="4" fill="#ff8fa3" opacity=".85" />
    <path
      d="M40 62 C44 68 48 68 50 63 C52 68 56 68 60 62"
      stroke="#1d3a19"
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
    />
  </>
);

const HAT = (
  <>
    <path
      d="M60 34 C66 16 80 6 96 2 C92 14 84 28 70 40 Z"
      fill="#9b4dff"
      stroke="#2a0f2f"
      strokeWidth="2"
    />
    <path d="M70 30 C78 20 86 12 94 6" stroke="#cfa8ff" strokeWidth="1.6" fill="none" />
    <path
      d="M4 70 C12 40 32 22 50 22 C68 22 88 40 96 70 C70 60 30 60 4 70 Z"
      fill="#ff4f5e"
      stroke="#2a0f2f"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M10 64 C36 55 64 55 90 64" stroke="#c22c3f" strokeWidth="5" fill="none" />
    <path d="M37 34 L63 54 M63 34 L37 54" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <circle cx="36" cy="33" r="2.6" fill="#fff" />
    <circle cx="64" cy="33" r="2.6" fill="#fff" />
    <circle cx="36" cy="55" r="2.6" fill="#fff" />
    <circle cx="64" cy="55" r="2.6" fill="#fff" />
    <circle cx="50" cy="41" r="10.5" fill="#fff" stroke="#2a0f2f" strokeWidth="1.6" />
    <rect
      x="44.5"
      y="46"
      width="11"
      height="8"
      rx="2.4"
      fill="#fff"
      stroke="#2a0f2f"
      strokeWidth="1.6"
    />
    <circle cx="46" cy="40.5" r="3" fill="#2a0f2f" />
    <circle cx="54" cy="40.5" r="3" fill="#2a0f2f" />
    <path d="M50 44 L48.6 47 L51.4 47 Z" fill="#2a0f2f" />
    <path d="M48 50 L48 54 M52 50 L52 54" stroke="#2a0f2f" strokeWidth="1.2" />
  </>
);

function WheelArt() {
  return (
    <g className="rtp-spin rtp-loop" style={{ animationDuration: '7s' }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <g key={i}>
            <line
              x1="50"
              y1="50"
              x2={50 + Math.cos(a) * 42}
              y2={50 + Math.sin(a) * 42}
              stroke="#2f6bff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx={50 + Math.cos(a) * 44} cy={50 + Math.sin(a) * 44} r="5.4" fill="#2f6bff" />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="29" fill="none" stroke="#ff8a1e" strokeWidth="8" />
      <circle
        cx="50"
        cy="50"
        r="29"
        fill="none"
        stroke="#ffb35c"
        strokeWidth="1.4"
        strokeDasharray="3 5"
      />
      <circle cx="50" cy="50" r="10" fill="#ff8a1e" stroke="#15135c" strokeWidth="2" />
      <circle cx="50" cy="50" r="3.4" fill="#15135c" />
    </g>
  );
}

const SPARK = (
  <path
    d="M50 4 C53 38 62 47 96 50 C62 53 53 62 50 96 C47 62 38 53 4 50 C38 47 47 38 50 4 Z"
    fill="#fff"
  />
);

const DROPS: { [k: string]: React.ReactNode } = {
  smile: (
    <>
      <circle cx="50" cy="50" r="41" fill="#ffd23f" stroke={DARK} strokeWidth="3" />
      <ellipse cx="37" cy="41" rx="4.4" ry="7" fill={DARK} />
      <ellipse cx="63" cy="41" rx="4.4" ry="7" fill={DARK} />
      <path
        d="M29 57 C38 76 62 76 71 57"
        stroke={DARK}
        strokeWidth="4.4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="25" cy="58" rx="6" ry="3.6" fill="#ff8f6b" opacity=".8" />
      <ellipse cx="75" cy="58" rx="6" ry="3.6" fill="#ff8f6b" opacity=".8" />
    </>
  ),
  heart: (
    <>
      <path
        d="M50 86 C18 66 8 46 16 31 C24 16 44 17 50 33 C56 17 76 16 84 31 C92 46 82 66 50 86 Z"
        fill="#ff4f5e"
        stroke={DARK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse
        cx="31"
        cy="35"
        rx="6"
        ry="4"
        fill="#fff"
        opacity=".7"
        transform="rotate(-30 31 35)"
      />
    </>
  ),
  bolt: (
    <polygon
      points="58,6 20,56 45,56 38,94 80,40 55,40 64,6"
      fill="#ffd23f"
      stroke={DARK}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  ),
  flower: (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <circle
            key={i}
            cx={50 + Math.cos(a) * 22}
            cy={50 + Math.sin(a) * 22}
            r="16"
            fill="#ff7fdc"
            stroke={DARK}
            strokeWidth="2.6"
          />
        );
      })}
      <circle cx="50" cy="50" r="14" fill="#ffd23f" stroke={DARK} strokeWidth="2.6" />
    </>
  ),
  star: (
    <>
      <polygon
        points={burst(50, 50, 46, 30, 12)}
        fill="#d8f03c"
        stroke={DARK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontSize="19"
        fill={DARK}
        style={{ fontFamily: 'var(--rtp-heavy)' }}
      >
        WOW
      </text>
    </>
  ),
  hi: (
    <>
      <path
        d="M12 18 H88 Q94 18 94 24 V64 Q94 70 88 70 H44 L26 86 L30 70 H12 Q6 70 6 64 V24 Q6 18 12 18 Z"
        fill="#3d5bff"
        stroke={DARK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="30"
        fill="#fff"
        style={{ fontFamily: 'var(--rtp-heavy)' }}
      >
        HI!
      </text>
    </>
  ),
  frog: FROG,
};
const DROP_KINDS = Object.keys(DROPS);

/* ------------------------------------------------------------------ takes */

interface Ctx {
  uid: string;
  facts: RemixFact[];
  word: string;
  l1: string;
  l2: string;
  name: string;
  discipline: string;
  year: string;
  roles: string[];
  kicker: string;
  tagline: string;
  handle: string;
  motto: string;
}

/** A slide's fact sheet, laid in the take's free band. */
function Facts({
  c,
  at,
  chips = false,
}: {
  c: Ctx;
  at: 'top' | 'bottom' | 'band';
  chips?: boolean;
}) {
  if (!c.facts.length) return null;
  return (
    <dl className="rtp-facts" data-at={at}>
      {c.facts.map((f, k) => (
        <div key={k} className="rtp-fact" style={css({ '--i': k })}>
          {f.icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- small static badge
            <img
              className="rtp-fact-icon"
              src={f.icon}
              alt=""
              width={96}
              height={96}
              decoding="async"
            />
          ) : null}
          <dt>{f.k}</dt>
          <dd>
            {chips
              ? f.v.split(' · ').map((part) => (
                  <span key={part} className="rtp-chip">
                    {part}
                  </span>
                ))
              : f.v}
          </dd>
          {f.n ? <span className="rtp-fact-n">{f.n}</span> : null}
        </div>
      ))}
    </dl>
  );
}

const chars = (s: string) => Array.from(s).map((c) => (c === ' ' ? ' ' : c));

function TakeSticker({ c, t }: { c: Ctx; t: RemixTheme }) {
  const o = rtpFindO(c.l1);
  const badgeAt = o >= 0 ? o : Math.min(1, c.l1.length - 1);
  let i = 0;
  const line = (s: string, first: boolean) => (
    <span className="rtp-line">
      {chars(s).map((ch, k) => (
        <span key={k} className="rtp-ch rtp-in" style={css({ '--i': i++ })}>
          {first && k === badgeAt ? <span style={{ visibility: 'hidden' }}>{ch}</span> : ch}
          {first && k === badgeAt ? (
            <span className="rtp-abs rtp-badge">
              <span className="rtp-par" style={css({ '--dp': -8, display: 'block' })}>
                <Sticker
                  art={<BadgeArt uid={c.uid} motto={c.motto} />}
                  className="rtp-slap rtp-in"
                  style={css({ '--dl': '620ms', rotate: '-8deg' })}
                />
              </span>
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
  const stk = (art: React.ReactNode, pos: Css, dp: number, dl: number, rot: number, die = true) => (
    <span className="rtp-abs rtp-par" style={{ ...pos, ...css({ '--dp': dp }) }}>
      <Sticker
        art={art}
        die={die}
        className="rtp-slap rtp-in"
        style={css({ '--dl': dl + 'ms', rotate: rot + 'deg', width: '100%' })}
      />
    </span>
  );
  return (
    <>
      <p className="rtp-word">
        <svg
          className="rtp-abs rtp-arc"
          viewBox="0 0 200 40"
          aria-hidden="true"
          style={{ maxWidth: 'none' }}
        >
          <path
            className="rtp-in"
            d="M8 30 C60 6 140 4 192 22"
            stroke={t.accent}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {line(c.l1, true)}
        {c.l2 ? line(c.l2, false) : null}
        {stk(
          <StampArt uid={c.uid} />,
          { left: '-21%', top: '-6%', width: '19%' },
          14,
          760,
          -8,
          false,
        )}
        {stk(WAFFLE, { right: '-21%', top: '-6%', width: '19%' }, -12, 880, 8)}
        {stk(MUG, { left: '-21%', top: '52%', width: '19%' }, 10, 1000, 6)}
        {stk(FROG, { right: '-21%', top: '52%', width: '19%' }, -16, 1120, -6)}
      </p>
      <div className="rtp-hand" aria-hidden="true">
        <span className="rtp-in">{c.year}</span>
      </div>
      <Facts c={c} at="bottom" />
    </>
  );
}

function TakeFelt({ c, t }: { c: Ctx; t: RemixTheme }) {
  const letters = chars(c.word.toUpperCase());
  const last = letters.length - 1;
  const swap = /[O0]/.test(letters[last] ?? '');
  const r = rtpRand(31);
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={c.uid + 'fz'} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <Facts c={c} at="top" />
      <div
        className="rtp-tags"
        aria-hidden="true"
        style={c.facts.length ? { display: 'none' } : undefined}
      >
        {c.roles.slice(0, 3).map((role, k) => (
          <React.Fragment key={k}>
            {k ? <b>●</b> : null}
            <i>{role}</i>
          </React.Fragment>
        ))}
      </div>
      <div className="rtp-col">
        <div className="rtp-par" style={css({ '--dp': -10 })}>
          <div className="rtp-bob rtp-loop">
            <Sticker
              art={HAT}
              className="rtp-hat rtp-slap rtp-in"
              style={css({ '--dl': '760ms' })}
            />
          </div>
        </div>
        <p className="rtp-word" style={{ filter: 'url(#' + c.uid + 'fz)' }}>
          {letters.map((ch, k) => {
            const col = (t.pop.length ? t.pop[k % t.pop.length] : t.ink) ?? t.ink;
            return (
              <span key={k} className="rtp-ch rtp-in" style={css({ '--i': k })}>
                {swap && k === last ? (
                  <svg
                    viewBox="0 0 100 100"
                    className="rtp-wheel"
                    aria-hidden="true"
                    style={{ maxWidth: 'none' }}
                  >
                    <WheelArt />
                  </svg>
                ) : (
                  <span
                    className="rtp-felt-ch"
                    style={css({
                      '--c': col,
                      '--sh': rtpShade(col, 0.45),
                      '--rz': (r() * 8 - 4).toFixed(1) + 'deg',
                    })}
                  >
                    {ch}
                  </span>
                )}
              </span>
            );
          })}
          {swap ? null : (
            <span className="rtp-ch rtp-in" style={css({ '--i': letters.length })}>
              <svg
                viewBox="0 0 100 100"
                className="rtp-wheel"
                aria-hidden="true"
                style={{ maxWidth: 'none', width: '.6em', height: '.6em' }}
              >
                <WheelArt />
              </svg>
            </span>
          )}
        </p>
        <div className="rtp-byline">{c.name}</div>
      </div>
      <svg
        className="rtp-wave"
        viewBox="0 0 400 40"
        aria-hidden="true"
        style={{ maxWidth: 'none' }}
      >
        <g className="rtp-loop">
          <path
            d={
              'M0 20' +
              Array.from({ length: 10 }, (_, k) => ' q25 ' + (k % 2 ? 16 : -16) + ' 50 0').join('')
            }
            stroke="#fff"
            strokeWidth="3.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </>
  );
}

function TakeBubble({ c, t }: { c: Ctx; t: RemixTheme }) {
  const r = rtpRand(7);
  let i = 0;
  const line = (s: string) => (
    <span className="rtp-line">
      {chars(s).map((ch, k) => {
        const n = i++;
        const col = (t.pop.length ? t.pop[n % t.pop.length] : t.accent) ?? t.accent;
        const sh = rtpShade(col, 0.42);
        const ts =
          Array.from(
            { length: 8 },
            (_, d) => (d + 1) * 0.011 + 'em ' + (d + 1) * 0.013 + 'em 0 ' + sh,
          ).join(', ') + ', .02em .16em .2em rgba(0,0,0,.55)';
        return (
          <span key={k} className="rtp-ch rtp-in" style={css({ '--i': n })}>
            <span className="rtp-float rtp-loop" style={css({ '--i': n })}>
              <span
                className="rtp-bub"
                data-ch={ch}
                style={css({ '--c': col, '--ts': ts, '--rz': (r() * 14 - 7).toFixed(1) + 'deg' })}
              >
                {ch}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
  return (
    <>
      <span className="rtp-rule" style={{ left: '6cqw', right: 'calc(50% + 11cqw)' }} />
      <span className="rtp-rule" style={{ right: '6cqw', left: 'calc(50% + 11cqw)' }} />
      <span className="rtp-pill rtp-pill-top">{c.discipline}</span>
      <p className="rtp-word">
        {line(c.l1)}
        {c.l2 ? line(c.l2) : null}
        <span className="rtp-abs rtp-par rtp-burst" style={css({ '--dp': 12 })}>
          <Sticker
            art={<polygon points={burst(50, 50, 48, 22, 6)} fill="#f3d061" />}
            die={false}
            className="rtp-slap rtp-in"
            style={css({ '--dl': '900ms', width: '100%' })}
          />
        </span>
        <span
          className="rtp-abs rtp-par"
          style={css({ '--dp': -14, right: '-.36em', top: c.l2 ? '36%' : '-10%' })}
        >
          <svg
            viewBox="0 0 100 100"
            className="rtp-spark"
            aria-hidden="true"
            style={{ maxWidth: 'none' }}
          >
            <g className="rtp-twinkle rtp-loop">{SPARK}</g>
          </svg>
        </span>
        <span
          className="rtp-abs rtp-par"
          style={css({ '--dp': -6, right: '-.62em', top: c.l2 ? '52%' : '20%' })}
        >
          <svg
            viewBox="0 0 100 100"
            className="rtp-spark"
            aria-hidden="true"
            style={{ maxWidth: 'none', width: '.12em' }}
          >
            <g className="rtp-twinkle rtp-loop" style={{ animationDelay: '-.9s' }}>
              {SPARK}
            </g>
          </svg>
        </span>
        <span className="rtp-abs rtp-par" style={css({ '--dp': 8, left: '33%', top: '-.22em' })}>
          <svg
            viewBox="0 0 40 60"
            className="rtp-drip"
            aria-hidden="true"
            style={{ maxWidth: 'none' }}
          >
            <path
              d="M20 2 C26 22 36 30 36 42 C36 52 28 58 20 58 C12 58 4 52 4 42 C4 30 14 22 20 2 Z"
              fill={t.accent}
              transform="rotate(24 20 30)"
            />
            <ellipse
              cx="14"
              cy="40"
              rx="3.4"
              ry="6"
              fill="#fff"
              opacity=".7"
              transform="rotate(24 20 30)"
            />
          </svg>
        </span>
      </p>
      <span className="rtp-pill rtp-pill-bot">
        {/^\d{4}$/.test(c.year) ? Number(c.year) - 1 + ' — ' + c.year : c.year}
      </span>
      <Facts c={c} at="bottom" />
    </>
  );
}

function TakeScript({ c }: { c: Ctx; t: RemixTheme }) {
  const word = rtpTitle(c.word);
  return (
    <>
      <p className="rtp-word">
        {chars(word).map((ch, k) => (
          <span key={k} className="rtp-ch rtp-in" style={css({ '--i': k })}>
            {ch}
          </span>
        ))}
        <span className="rtp-abs rtp-yr">{c.year}</span>
      </p>
      <div className="rtp-sub" aria-hidden="true">
        <span>{c.discipline}</span>
        <span>
          <small>by</small>
          {c.name}
        </span>
      </div>
      <Facts c={c} at="bottom" />
    </>
  );
}

function TakeStretch({ c }: { c: Ctx; t: RemixTheme }) {
  const r = rtpRand(c.word.length * 13 + 5);
  const parts = c.name.split(' ');
  return (
    <>
      <div className="rtp-meta-serif rtp-stretch-yr">{c.year}—</div>
      <div className="rtp-band" />
      <div className="rtp-stretch-row" aria-hidden="true">
        {chars(c.word.toUpperCase()).map((ch, k) => (
          <span key={k} className="rtp-ch rtp-in" style={css({ '--i': k })}>
            <span
              className="rtp-st rtp-loop"
              style={css({
                '--i': k,
                '--sy': (1.05 + r() * 0.95).toFixed(2),
                '--rz': (r() * 6 - 3).toFixed(1) + 'deg',
              })}
            >
              {ch}
            </span>
          </span>
        ))}
      </div>
      <div className="rtp-meta-serif rtp-stretch-name">
        {parts[0]}
        {parts.length > 1 ? <br /> : null}
        {parts.slice(1).join(' ')}
        <i>{c.discipline}</i>
      </div>
      <Facts c={c} at="band" />
    </>
  );
}

function TakeVector({ c, t }: { c: Ctx; t: RemixTheme }) {
  const o = rtpFindO(c.l1);
  const ring = (c.roles.join(' • ') + ' • ').toUpperCase();
  let i = 0;
  return (
    <>
      <div className="rtp-kicker rtp-in">{c.kicker}</div>
      <p className="rtp-word">
        <span className="rtp-line">
          {chars(c.l1).map((ch, k) => (
            <span key={k} className="rtp-ch rtp-in" style={css({ '--i': i++ })}>
              {ch}
              {k === o ? (
                <svg
                  viewBox="0 0 100 64"
                  className="rtp-abs rtp-eye"
                  aria-hidden="true"
                  style={{ maxWidth: 'none' }}
                >
                  <path
                    d="M4 32 C26 4 74 4 96 32 C74 60 26 60 4 32 Z"
                    stroke={t.accent}
                    strokeWidth="4"
                    fill={t.bg}
                    strokeLinejoin="round"
                  />
                  <circle cx="50" cy="32" r="15" stroke={t.accent} strokeWidth="4" fill="none" />
                  <circle cx="50" cy="32" r="6" fill={t.accent} />
                  <circle cx="55" cy="27" r="2.4" fill={t.accent} />
                </svg>
              ) : null}
            </span>
          ))}
        </span>
        {c.l2 ? (
          <span className="rtp-line">
            {chars(c.l2).map((ch, k) => (
              <span key={k} className="rtp-ch rtp-in" style={css({ '--i': i++ })}>
                {ch}
                {k === 0 ? (
                  <span className="rtp-abs rtp-bbox rtp-in" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        ) : null}
        <span className="rtp-abs rtp-par rtp-rings" style={css({ '--dp': -10 })}>
          <svg viewBox="0 0 40 100" aria-hidden="true" style={{ maxWidth: 'none', width: '100%' }}>
            {[22, 50, 78].map((y) => (
              <circle key={y} cx="20" cy={y} r="18" fill="none" stroke={t.accent} strokeWidth="2" />
            ))}
          </svg>
        </span>
        <span className="rtp-abs rtp-par rtp-pen" style={css({ '--dp': 12 })}>
          <svg viewBox="0 0 80 110" aria-hidden="true" style={{ maxWidth: 'none', width: '100%' }}>
            <path d="M4 14 L76 14" stroke={t.accent} strokeWidth="2.4" />
            <rect x="0" y="10" width="8" height="8" fill={t.accent} />
            <rect x="72" y="10" width="8" height="8" fill={t.accent} />
            <circle cx="40" cy="14" r="5" fill={t.bg} stroke={t.accent} strokeWidth="2.4" />
            <path
              d="M40 26 L58 58 L50 90 L30 90 L22 58 Z"
              fill={t.bg}
              stroke={t.accent}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path d="M40 26 L40 56" stroke={t.accent} strokeWidth="2.4" />
            <circle cx="40" cy="60" r="4.6" fill="none" stroke={t.accent} strokeWidth="2.4" />
            <rect
              x="26"
              y="90"
              width="28"
              height="12"
              fill={t.bg}
              stroke={t.accent}
              strokeWidth="3.2"
            />
          </svg>
        </span>
        <span className="rtp-abs rtp-par rtp-seal" style={css({ '--dp': -14 })}>
          <svg viewBox="0 0 100 100" aria-hidden="true" style={{ maxWidth: 'none', width: '100%' }}>
            <defs>
              <path id={c.uid + 'seal'} d="M50 12 a38 38 0 1 1 -0.01 0" />
            </defs>
            <circle cx="50" cy="50" r="47" fill={t.bg} />
            <g className="rtp-spin rtp-spin-r rtp-loop">
              <text
                fontSize="8.6"
                fill={t.accent}
                letterSpacing=".4"
                style={{ fontFamily: 'var(--rtp-heavy)' }}
              >
                <textPath href={'#' + c.uid + 'seal'} textLength="236" lengthAdjust="spacing">
                  {ring}
                </textPath>
              </text>
            </g>
            <circle cx="50" cy="50" r="5" fill={t.ink} />
          </svg>
        </span>
        <span className="rtp-abs rtp-cursor">
          <span className="rtp-cursor-move" style={{ display: 'block' }}>
            <span className="rtp-cursor-idle rtp-loop" style={{ display: 'block' }}>
              <svg
                viewBox="0 0 20 28"
                aria-hidden="true"
                style={{
                  maxWidth: 'none',
                  width: '100%',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))',
                }}
              >
                <path
                  d="M2 2 L2 23 L7.6 17.6 L11.4 26 L15.4 24.2 L11.6 16 L19 16 Z"
                  fill="#fff"
                  stroke="#111"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </span>
      </p>
      <Facts c={c} at="bottom" />
    </>
  );
}

const CUT_FONTS = [
  'var(--rtp-cond)',
  'var(--rtp-heavy)',
  'var(--rtp-fat)',
  'var(--rtp-serif)',
  'var(--rtp-heavy)',
  'var(--rtp-cond)',
  'var(--rtp-round)',
];

function TakeCutout({ c }: { c: Ctx; t: RemixTheme }) {
  const r = rtpRand(c.word.length * 7 + 3);
  return (
    <>
      <div className="rtp-cut-row" aria-hidden="true">
        {chars(c.word.toUpperCase()).map((ch, k) => {
          const f = CUT_FONTS[Math.floor(r() * CUT_FONTS.length)];
          const big = 0.86 + r() * 0.34;
          const inv = k % 4 === 2 || r() < 0.08;
          const dots = !inv && r() < 0.34;
          return (
            <span key={k} className="rtp-ch rtp-in" style={css({ '--i': k })}>
              <span
                className="rtp-cut"
                data-inv={inv}
                data-dots={dots}
                style={css({
                  '--clip': rtpJag(k + 1, 6),
                  '--rz': (r() * 9 - 4.5).toFixed(1) + 'deg',
                  '--ty': (r() * 0.16 - 0.08).toFixed(2) + 'em',
                  fontFamily: f,
                  fontSize: big.toFixed(2) + 'em',
                })}
              >
                {ch}
              </span>
            </span>
          );
        })}
        <span className="rtp-bars">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="rtp-foot rtp-in">
        <b>{c.tagline}</b>
        <i>{c.handle}</i>
      </div>
      <Facts c={c} at="bottom" chips />
    </>
  );
}

const SCENES: { [K in RemixTake]: (p: { c: Ctx; t: RemixTheme }) => React.ReactElement } = {
  sticker: TakeSticker,
  felt: TakeFelt,
  bubble: TakeBubble,
  script: TakeScript,
  stretch: TakeStretch,
  vector: TakeVector,
  cutout: TakeCutout,
};

function Take({
  id,
  c,
  t,
  still,
  n1,
  n2,
}: {
  id: RemixTake;
  c: Ctx;
  t: RemixTheme;
  still: boolean;
  n1: number;
  n2: number;
}) {
  const Scene = SCENES[id];
  return (
    <div
      className={'rtp-take rtp-t-' + id}
      data-still={still}
      style={css({ '--bg': t.bg, '--ink': t.ink, '--ac': t.accent, '--n1': n1, '--n2': n2 })}
      aria-hidden="true"
    >
      <Scene c={c} t={t} />
    </div>
  );
}

/* ------------------------------------------------------------------ component */

export default function TypeRemixPreloader({
  children,
  loop = false,
  progress,
  durationMs = 7000,
  word = 'PORTFOLIO',
  name = 'Ines Calder',
  discipline = 'Graphic Design',
  year = '2026',
  period = 'October 2025 — 2026',
  handle = 'inescalder.studio',
  roles = ['Motion Design', 'Illustration', 'Branding', 'Packaging'],
  kicker = 'A Design',
  tagline = 'Personal Project',
  motto = 'great day ahead',
  takes = ALL_TAKES,
  themes,
  moodboard = true,
  stickers = true,
  decals,
  hud = true,
  fontHref = FONT_HREF,
  height = '100svh',
  onComplete,
  className = '',
  scrub,
  slides,
  labels,
  cta,
  ground,
  label,
}: TypeRemixPreloaderProps) {
  const rawUid = React.useId();
  const uid = 'rtp' + rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const list = React.useMemo(() => {
    const seen: string[] = [];
    for (const id of takes) if (ALL_TAKES.indexOf(id) > -1 && seen.indexOf(id) < 0) seen.push(id);
    return (seen.length ? seen : ALL_TAKES) as RemixTake[];
  }, [takes]);
  const n = list.length;
  const theme = (id: RemixTake) =>
    ({ ...THEMES[id], ...((themes && themes[id]) || {}) }) as RemixTheme;

  const cleanWord = (word || 'PORTFOLIO').trim() || 'PORTFOLIO';
  // Each take reads the shared copy with its own slide merged over it.
  const scene = (id: RemixTake) => {
    const s = (slides && slides[id]) || {};
    const w = (s.word || cleanWord).trim() || cleanWord;
    const [l1, l2] = rtpSplit(w);
    const r = s.roles && s.roles.length ? s.roles : roles.length ? roles : ['Design'];
    const c: Ctx = {
      uid,
      facts: s.facts ?? [],
      word: w,
      l1,
      l2,
      name: s.name ?? name,
      discipline: s.discipline ?? discipline,
      year: s.year ?? year,
      roles: r,
      kicker: s.kicker ?? kicker,
      tagline: s.tagline ?? tagline,
      handle: s.handle ?? handle,
      motto: s.motto ?? motto,
    };
    return {
      c,
      n1: Math.max(4, Array.from(w).length),
      n2: Math.max(3, Array.from(l1).length, Array.from(l2).length),
    };
  };
  const labelOf = (id: RemixTake) => (labels && labels[id]) || LABELS[id];
  // The take at a list position (strict index access).
  const takeAt = (k: number): RemixTake => list[k] ?? 'sticker';

  const [phase, setPhase] = React.useState(fontHref ? 'fonts' : 'load');
  const [pct, setPct] = React.useState(0);
  const [take, setTake] = React.useState(0);
  const [run, setRun] = React.useState(0);
  const [zs, setZs] = React.useState(3);
  const [reduced, setReduced] = React.useState(false);
  const [drops, setDrops] = React.useState(
    [] as { id: number; x: number; y: number; kind: string; rot: number }[],
  );
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const dropId = React.useRef(0);
  const onCompleteRef = React.useRef(onComplete);
  const progressRef = React.useRef(progress);
  React.useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
    progressRef.current = progress;
  });

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // The faces: a <link>, once per document, never a CSS import. The count
  // holds at 000 until they land (or 1.6s pass) so take one never reflows.
  React.useEffect(() => {
    // Without a font link the phase starts at 'load' (see useState).
    if (!fontHref) return;
    if (!document.querySelector('link[data-rtp-fonts="' + fontHref + '"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      link.setAttribute('data-rtp-fonts', fontHref);
      document.head.appendChild(link);
    }
    let live = true;
    const go = () => {
      if (live) setPhase((p) => (p === 'fonts' ? 'load' : p));
    };
    const timer = setTimeout(go, 1600);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts && fonts.load) {
      Promise.all(FONT_PROBES.map((f) => fonts.load(f).catch(() => null)))
        .then(go)
        .catch(go);
    } else go();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [fontHref]);

  // Scroll mode: off screen, the gate is idle (CSS loops paused, no frames).
  const [idle, setIdle] = React.useState(Boolean(scrub));
  React.useEffect(() => {
    const el = rootRef.current;
    if (!scrub || !el) return;
    let seen = false;
    const sync = () => setIdle(!seen || document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      seen = Boolean(entry && entry.isIntersecting);
      sync();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [scrub]);

  // Scroll mode: the gate eases toward the scroll, and the count, the take and
  // the phase are read off the eased value, both ways. State is set only when
  // a shown value changes.
  const scrollPhase = React.useRef('load');
  const boardRef = React.useRef(null as HTMLDivElement | null);
  const fontsPending = phase === 'fonts';
  React.useEffect(() => {
    if (!scrub || fontsPending || idle) return;
    let raf = 0;
    let su = -1;
    let last = performance.now();
    let shownPct = -1;
    let shownTake = -1;
    let zoomFrom = 1;
    let shownBoard: HTMLElement | null = null;
    let shownScale = '';
    const tick = (now: number) => {
      const raw = rtpClamp01(scrub.current);
      const dt = Math.min(64, now - last);
      last = now;
      su =
        su < 0 || reduced || Math.abs(raw - su) > 0.3
          ? raw
          : su + (raw - su) * (1 - Math.exp(-dt / 110));
      const p = Math.min(100, Math.floor((su / RTP_SCROLL.takes) * 100));
      if (p !== shownPct) {
        shownPct = p;
        setPct(p);
      }
      const k = rtpTakeAt(p, n);
      if (k !== shownTake) {
        shownTake = k;
        setTake(k);
      }
      const want = su >= RTP_SCROLL.zoom ? 'board' : su >= RTP_SCROLL.takes ? 'hold' : 'load';
      if (want !== scrollPhase.current) {
        scrollPhase.current = want;
        if (want === 'board') {
          const el = rootRef.current;
          if (el) {
            const b = el.getBoundingClientRect();
            zoomFrom = rtpZoom(b.width, b.height, 10);
            setZs(zoomFrom);
          }
        }
        setPhase(want);
      }
      // The pull back onto the board is the scroll itself, so it reverses.
      const board = boardRef.current;
      if (want === 'board' && board) {
        const k = rtpClamp01((su - RTP_SCROLL.zoom) / (RTP_SCROLL.board - RTP_SCROLL.zoom));
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const scale = (zoomFrom + (1 - zoomFrom) * e).toFixed(4);
        if (board !== shownBoard || scale !== shownScale) {
          shownBoard = board;
          shownScale = scale;
          board.style.transform = 'scale(' + scale + ')';
          board.style.setProperty('--rad', (8 * e).toFixed(2) + 'px');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrub, fontsPending, idle, reduced, n]);

  // The count, and the take it is on: simulated or eased toward real progress,
  // never backwards, and never cutting faster than one take per MIN_TAKE_MS.
  React.useEffect(() => {
    if (phase !== 'load' || scrub) return;
    let raf = 0;
    let shown = 0;
    let cur = 0;
    let last = performance.now();
    const t0 = last;
    const dur = Math.max(1500, durationMs);
    const gap = reduced ? MIN_TAKE_MS * 1.6 : MIN_TAKE_MS;
    const tick = (now: number) => {
      const real = progressRef.current;
      const target =
        real === undefined
          ? rtpSimulated((now - t0) / dur)
          : Math.max(0, Math.min(100, Number(real) || 0));
      shown = Math.max(shown, shown + (target - shown) * 0.14);
      if (target >= 100 && shown > 99.5) shown = 100;
      setPct(shown);
      if (rtpTakeAt(shown, n) > cur && now - last >= gap) {
        cur += 1;
        last = now;
        setTake(cur);
      }
      if (shown >= 100 && cur >= n - 1 && now - last >= gap) {
        setPhase('hold');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, run, durationMs, reduced, n, scrub]);

  const restart = () => {
    setPct(0);
    setTake(0);
    setDrops([]);
    setRun((x) => x + 1);
    setPhase('load');
  };

  // hold → (zoom → board) → scatter → done, or round again in a loop. In
  // scroll mode only the zoom runs on a timer, and the board is the end.
  React.useEffect(() => {
    let t = 0;
    if (scrub) {
      // Scroll owns every phase.
    } else if (phase === 'hold') {
      t = window.setTimeout(() => {
        if (!moodboard) return setPhase('scatter');
        const el = rootRef.current;
        if (el) {
          const b = el.getBoundingClientRect();
          setZs(rtpZoom(b.width, b.height, Math.max(6, Math.min(14, b.width / 110))));
        }
        setPhase(reduced ? 'board' : 'zoom');
      }, HOLD_MS);
    } else if (phase === 'zoom') {
      t = window.setTimeout(() => setPhase('board'), ZOOM_MS);
    } else if (phase === 'board') {
      t = window.setTimeout(() => setPhase('scatter'), BOARD_MS + (loop ? 600 : 0));
    } else if (phase === 'scatter') {
      t = window.setTimeout(
        () => {
          if (loop) return restart();
          setPhase('done');
          onCompleteRef.current?.();
        },
        moodboard ? SCATTER_MS + 260 : 700,
      );
    }
    return () => {
      window.clearTimeout(t);
    };
  }, [phase, moodboard, reduced, loop, scrub]);

  // Pointer parallax: two custom properties on the root, no React render.
  const pointer = React.useRef({ raf: 0, x: 0, y: 0 });
  const onMove = (e: React.PointerEvent) => {
    const el = rootRef.current;
    if (!el || reduced) return;
    const b = el.getBoundingClientRect();
    pointer.current.x = ((e.clientX - b.left) / b.width) * 2 - 1;
    pointer.current.y = ((e.clientY - b.top) / b.height) * 2 - 1;
    if (pointer.current.raf) return;
    pointer.current.raf = requestAnimationFrame(() => {
      pointer.current.raf = 0;
      el.style.setProperty('--rtp-px', pointer.current.x.toFixed(3));
      el.style.setProperty('--rtp-py', pointer.current.y.toFixed(3));
    });
  };
  const onLeave = () => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty('--rtp-px', '0');
    el.style.setProperty('--rtp-py', '0');
  };
  React.useEffect(() => () => cancelAnimationFrame(pointer.current.raf), []);

  const loading = phase === 'load' || phase === 'hold';
  const canStick = stickers && loading;
  const onDown = (e: React.PointerEvent) => {
    if (!canStick) return;
    const el = rootRef.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const id = ++dropId.current;
    const kind = DROP_KINDS[(id - 1) % DROP_KINDS.length] ?? 'smile';
    const x = ((e.clientX - b.left) / b.width) * 100;
    const y = ((e.clientY - b.top) / b.height) * 100;
    setDrops((d) =>
      d.concat({ id, x, y, kind, rot: Math.round(Math.random() * 36 - 18) }).slice(-MAX_STICKERS),
    );
  };

  const done = phase === 'done';
  const showBoard = phase === 'zoom' || phase === 'board' || phase === 'scatter';
  const gap = 10;
  const slots = rtpBoard(n);
  const firstSlide = take === 0;
  // Every arrival on a take mounts it fresh on top of the one it left, so its
  // entrance plays whichever way the scroll moves.
  const [trail, setTrail] = React.useState({ take: 0, prev: -1, visit: 0 });
  if (trail.take !== take) setTrail({ take, prev: trail.take, visit: trail.visit + 1 });
  const shownSlides = [
    { k: trail.prev, key: trail.prev + '-' + (trail.visit - 1) },
    { k: take, key: take + '-' + trail.visit },
  ].filter((slide) => slide.k >= 0);

  return (
    <div
      ref={rootRef}
      className={'rtp-root ' + className}
      style={css({
        height,
        '--rtp-ground': ground,
        '--rtp-heavy': '"Archivo Black", "Arial Black", "Helvetica Neue", Impact, sans-serif',
        '--rtp-cond': 'Anton, Impact, "Arial Narrow", "Helvetica Neue Condensed Bold", sans-serif',
        '--rtp-round': '"Titan One", "Arial Rounded MT Bold", "Arial Black", sans-serif',
        '--rtp-script': 'Shrikhand, "Cooper Black", "Georgia", serif',
        '--rtp-felt': 'Rubik, "Arial Black", system-ui, sans-serif',
        '--rtp-text': 'var(--font-sans)',
        '--rtp-serif': '"DM Serif Display", "Bodoni 72", Didot, Georgia, serif',
        '--rtp-fat': '"Abril Fatface", "Bodoni 72", Didot, Georgia, serif',
        '--rtp-hand': 'var(--font-sans)',
        '--rtp-mono': 'var(--font-sans)',
      })}
    >
      <style>{RTP_CSS}</style>
      {loop || scrub ? null : children}
      {done && !loop ? null : (
        <div
          className="rtp-gate"
          data-phase={phase}
          data-stick={canStick}
          data-loop={loop}
          data-idle={idle}
          {...(scrub
            ? { role: 'group', 'aria-label': label || name + ' — ' + cleanWord.toLowerCase() }
            : {
                role: 'progressbar',
                'aria-label': 'Loading ' + name + ' — ' + cleanWord.toLowerCase(),
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': Math.floor(pct),
              })}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onPointerDown={onDown}
        >
          {phase === 'fonts' || showBoard ? null : (
            <div className="rtp-stage" key={'run' + run}>
              {shownSlides.map(({ k, key }) => (
                <div
                  key={key}
                  className="rtp-slide"
                  data-dir={k % 4}
                  data-first={k === 0 && firstSlide}
                >
                  <Take id={takeAt(k)} {...scene(takeAt(k))} t={theme(takeAt(k))} still={false} />
                </div>
              ))}
            </div>
          )}

          {showBoard ? (
            <div
              ref={boardRef}
              className="rtp-board"
              data-phase={phase}
              style={css(
                scrub
                  ? {
                      '--gap': gap + 'px',
                      transform: 'scale(' + zs.toFixed(4) + ')',
                      '--rad': '0px',
                    }
                  : { '--zs': zs.toFixed(4), '--gap': gap + 'px', '--rad': '8px' },
              )}
            >
              {slots.map((s, k) => {
                const col = k % 3;
                const row = Math.floor(k / 3);
                const centre = k === 4;
                const fly = css({
                  '--sx': centre ? '0px' : (col - 1) * 70 + (k % 2 ? 6 : -6) + 'vw',
                  '--sy': centre ? '70vh' : (row - 1) * 70 + 18 + 'vh',
                  '--sr': centre
                    ? '6deg'
                    : (col - 1) * 14 + (row - 1) * 6 + (k % 2 ? 5 : -5) + 'deg',
                  '--sd': (centre ? 180 : (Math.abs(col - 1) + Math.abs(row - 1)) * 50) + 'ms',
                });
                return (
                  <div key={k} className="rtp-cell" style={fly}>
                    {s.kind === 'take' ? (
                      <Take
                        id={takeAt(s.take)}
                        {...scene(takeAt(s.take))}
                        t={theme(takeAt(s.take))}
                        still={true}
                      />
                    ) : s.kind === 'index' ? (
                      <div className="rtp-tile rtp-tile-index" aria-hidden="true">
                        <div className="rtp-tile-k">
                          <span>Index</span>
                          <span>{year}</span>
                        </div>
                        <div className="rtp-tile-name">{name}</div>
                        <div className="rtp-tile-roles">
                          {roles.slice(0, 4).map((role, j) => (
                            <div key={j}>
                              <span>{rtpTwo(j + 1)}</span>
                              {role}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : cta ? (
                      <a
                        className="rtp-tile rtp-tile-count"
                        href={cta.href}
                        download={cta.download ? '' : undefined}
                      >
                        <div className="rtp-tile-k" aria-hidden="true">
                          <span>{cta.kicker}</span>
                          <span>{year}</span>
                        </div>
                        <div className="rtp-tile-big">CV</div>
                        <div className="rtp-tile-cta">
                          <span>{cta.label}</span>
                          <span aria-hidden="true">↓</span>
                        </div>
                        <div className="rtp-tile-k" aria-hidden="true">
                          <span>{cta.note}</span>
                        </div>
                      </a>
                    ) : (
                      <div className="rtp-tile rtp-tile-count" aria-hidden="true">
                        <div className="rtp-tile-k">
                          <span>{rtpTwo(n)} takes</span>
                          <span>Loaded</span>
                        </div>
                        <div className="rtp-tile-big">100</div>
                        <div className="rtp-tile-k">
                          <span>Enter</span>
                          <span>↗</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {decals ? (
            <div className="rtp-drops" data-gone={!loading} aria-hidden="true">
              {(decals[takeAt(take)] ?? []).map((d, k) => (
                <span
                  key={takeAt(take) + k}
                  className="rtp-drop rtp-decal"
                  style={css({
                    left: d.x + '%',
                    top: d.y + '%',
                    rotate: (d.rot ?? 0) + 'deg',
                    width: 'calc(min(11cqw, 17cqh) * ' + (d.size ?? 1) + ')',
                    '--ds': d.size ?? 1,
                    '--mx': (d.mx ?? d.x) + '%',
                    '--my': (d.my ?? d.y) + '%',
                    '--dl': 700 + k * 140 + 'ms',
                  })}
                >
                  {d.kind === 'image' ? (
                    d.src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- static sticker art
                      <img className="rtp-decal-img" src={d.src} alt="" decoding="async" />
                    ) : null
                  ) : (
                    <Sticker art={DROPS[d.kind]} style={{ width: '100%' }} />
                  )}
                </span>
              ))}
            </div>
          ) : null}

          {stickers ? (
            <div className="rtp-drops" data-gone={!loading} aria-hidden="true">
              {drops.map((d) => (
                <span
                  key={d.id}
                  className="rtp-drop"
                  style={{ left: d.x + '%', top: d.y + '%', rotate: d.rot + 'deg' }}
                >
                  <Sticker art={DROPS[d.kind]} style={{ width: '100%' }} />
                </span>
              ))}
            </div>
          ) : null}

          {hud ? (
            <div className="rtp-hud" data-gone={showBoard} aria-hidden="true">
              <div className="rtp-hud-top">
                <span>{period}</span>
                <span>{discipline}</span>
                <span>{handle}</span>
              </div>
              <div className="rtp-hud-bot">
                <span className="rtp-hud-take">
                  {rtpTwo(take + 1)} / {rtpTwo(n)} — {labelOf(takeAt(take))}
                </span>
                {stickers ? (
                  <span className="rtp-hud-hint" data-off={drops.length > 0 || !loading}>
                    Click anywhere — stick something
                  </span>
                ) : null}
                <span className="rtp-count">
                  {rtpPad(pct)}
                  <small>%</small>
                </span>
              </div>
              <div
                className="rtp-bar"
                style={{ transform: 'scaleX(' + (pct / 100).toFixed(4) + ')' }}
              />
            </div>
          ) : null}

          <div className="rtp-grain rtp-loop" aria-hidden="true" />
          <span className="rtp-sr" aria-live="polite">
            {loading || phase === 'fonts' ? '' : 'Loaded'}
          </span>
        </div>
      )}
    </div>
  );
}

// Declared after the JSX: the 21st CLI tokenizer hangs on mapped types before it.
export type RemixThemesInput = {
  [K in RemixTake]?: { bg?: string; ink?: string; accent?: string; pop?: string[] };
};
export type RemixLabelMap = { [K in RemixTake]: string };
export type RemixSlides = { [K in RemixTake]?: Partial<RemixSlide> };
type RemixThemeMap = { [K in RemixTake]: RemixTheme };
