'use client';

import * as React from 'react';

/**
 * Sticker Slap Footer — a loud, friendly studio footer: a cream frame, a
 * cobalt panel with three columns (jobs, office, contact), and a giant fat
 * script wordmark sinking into the bottom edge with die-cut stickers slapped
 * all over it.
 *
 * The storyboard: as the footer scrolls in, the panel grows out of the frame
 * and its corners settle. Then the column tags pop, the lines rise out of
 * their masks, the wordmark writes itself in one continuous marker stroke
 * (t-crosses and i-dots last), and every sticker slaps down the moment the
 * pen passes under it. After that it is a toy: drag the stickers anywhere
 * (they tilt with your throw and thwack back down), double-click one to send
 * it home, click the wordmark to write it again, copy the email, open the
 * credits.
 *
 * No dependencies and nothing fetched. React is the only import, the script
 * is a built-in single-stroke alphabet drawn as SVG, and every sticker is
 * drawn in code.
 */

// #region slap
// Pure script alphabet, layout, stars and sticker spots from the supplied component.

/** A small deterministic hash to [0, 1), so every render places things the same way. */
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const round = (v: number): number => Math.round(v * 100) / 100;

export const clamp = (v: number, lo: number, hi: number): number =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;

/**
 * A fat single-stroke script: [advance, main stroke, pen-lift strokes, lifts
 * after?]. x-height 10, baseline 0, y runs down. Every main stroke starts at
 * (0, -1) and, unless it lifts, ends at (advance, -1), so letters chain into
 * one continuous path. Absolute M / L / C only, so x and y simply alternate.
 */
export const SCRIPT: Record<string, [number, string, string?, number?]> = {
  a: [
    10.2,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1',
  ],
  b: [
    9.4,
    'M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -6C2.4 -9 3.4 -10 4.8 -10C6.8 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.4 -1',
  ],
  c: [
    8.8,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C5.6 -10 6.6 -9.6 7 -8.6C6.6 -9.6 5.6 -10 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6 0 7 -1 8.8 -1',
  ],
  d: [
    10.2,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -19L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1',
  ],
  e: [
    9.4,
    'M0 -1C3.4 -2.4 8 -4.4 8 -7.6C8 -9.4 6.6 -10.4 4.8 -10.4C2.2 -10.4 0.8 -7.8 0.8 -5C0.8 -1.8 2.6 0 5 0C6.8 0 8 -1 9.4 -1',
  ],
  f: [
    7,
    'M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 7.2C1.8 9.6 3.2 9.6 3.8 7.6C4.4 5 4.8 -1 7 -1',
    'M-0.4 -9.4L5.4 -9.4',
  ],
  g: [
    9.6,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 4C7.8 8.6 5.8 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.4 9.6 -1',
  ],
  h: [
    10,
    'M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -5.6C2.6 -8.6 4 -10 5.6 -10C7.2 -10 7.8 -8.8 7.8 -7L7.8 -3C7.8 -0.8 8.8 -1 10 -1',
  ],
  i: [5, 'M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 -3C2.2 -0.8 3.4 -1 5 -1', 'M2.4 -15.2L2.5 -15.3'],
  j: [
    5.4,
    'M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 4.6C2.2 9.6 -0.6 9.8 -0.2 7.4C0.2 5 3.4 1.4 5.4 -1',
    'M2.4 -15.2L2.5 -15.3',
  ],
  k: [
    9.6,
    'M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -4.6C3 -8 5.6 -10.4 7 -9.6C8.4 -8.6 7 -5.6 3.6 -5C5.6 -4.6 6.6 -1 9.6 -1',
  ],
  l: [
    6.4,
    'M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -3.2C1.8 -0.6 4 -1 6.4 -1',
  ],
  m: [
    14.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.2 -10 7 -9 7 -7L7 -1L7 -5.6C7.6 -8.6 8.6 -10 10 -10C11.4 -10 12.2 -9 12.2 -7L12.2 -3C12.2 -0.8 13.2 -1 14.6 -1',
  ],
  n: [
    9.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.4 -10 7.2 -9 7.2 -7L7.2 -3C7.2 -0.8 8.2 -1 9.6 -1',
  ],
  o: [
    9,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5C7.6 -7.8 6.1 -10 4.3 -10C6 -10 7.4 -9.2 9 -9',
    '',
    1,
  ],
  p: [
    9.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 9L1.8 -5.6C2.4 -8.6 3.4 -10 5 -10C7 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.6 -1',
  ],
  q: [
    10.4,
    'M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 9C8.8 6 9 0 10.4 -1',
  ],
  r: [
    8.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.6 -8.6 4.2 -10 5.8 -10C6.8 -10 7.6 -9.6 8.2 -8.8',
    '',
    1,
  ],
  // A printed s from the top, so it reads as an s after a lifting letter.
  s: [
    9,
    'M7.2 -8.8C6.6 -9.8 5.2 -10.3 3.8 -10.1C2.2 -9.9 1.5 -8.7 2 -7.5C2.7 -5.9 7 -5.7 7.2 -3C7.4 -0.9 5.6 0.1 3.6 0C2.2 0 1.2 -0.5 0.6 -1.3M3.6 0C5.4 0 7.2 -0.4 9 -1',
  ],
  t: [6.6, 'M0 -1C1 -1.4 2.2 -8 2.4 -15L2.4 -3.2C2.4 -0.8 4 -1 6.6 -1', 'M-0.8 -9.6L6.2 -9.6'],
  u: [
    10,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 -3C7.6 -0.8 8.6 -1 10 -1',
  ],
  v: [
    9,
    'M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6C1.6 -6 2.6 0 4.4 0C6.4 0 7.6 -6 7.6 -9.6C8 -9 8.4 -8.8 9 -8.8',
    '',
    1,
  ],
  w: [
    12.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6L1.6 -3.6C1.6 -1 2.6 0 4 0C5.4 0 6.2 -1 6.2 -3.6L6.2 -8L6.2 -3.6C6.2 -1 7 0 8.4 0C9.8 0 10.8 -1 10.8 -3.6L10.8 -9.6C11.2 -9 11.8 -8.8 12.6 -8.8',
    '',
    1,
  ],
  x: [9, 'M0 -1C1.6 -2 2 -8.6 3 -9.6L7 -1C7.6 -0.4 8.4 -1 9 -1', 'M7.4 -9.6L2.4 -0.4'],
  y: [
    9.6,
    'M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 4.4C7.6 9 5.6 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.6 9.6 -1',
  ],
  z: [8.8, 'M0 -1C1 -2 1.4 -9.6 2.6 -9.6L7.4 -9.6L1.6 -0.2L6 -0.2C7 -0.2 7.8 -1 8.8 -1'],
  '!': [4, 'M2 -16L2 -4.4', 'M2 -0.6L2.1 -0.7', 1],
  '.': [3.6, 'M1.8 -0.6L1.9 -0.7', '', 1],
};

/** Horizontal stretch and the gap between letters, in script units. */
export const SX = 1.22;
export const TRACK = 1;
export const WORD_GAP = 6;

/** Shifts and stretches every x in an absolute M/L/C path. */
export const place = (d: string, dx: number, sx: number = SX): string => {
  let k = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => (k++ % 2 === 0 ? String(round(+n * sx + dx)) : n));
};

export type ScriptBox = { x0: number; x1: number; top: number };
export type ScriptWord = {
  main: string;
  extra: string[];
  width: number;
  top: number;
  bottom: number;
  boxes: ScriptBox[];
};

const extent = (d: string): number[] => {
  const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  return n.filter((_, i) => i % 2 === 1);
};

/**
 * Lays text out in the script: one continuous main stroke (moves only where a
 * letter lifts or a space falls) plus the pen-lift strokes, drawn after.
 * Case is ignored, accents are stripped, anything unknown is a space.
 */
export const layoutScript = (text: string): ScriptWord => {
  const clean = String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  let x = 0;
  let main = '';
  const extra: string[] = [];
  const boxes: ScriptBox[] = [];
  let lift = true;
  let top = 0;
  let bottom = 0;
  for (const ch of clean) {
    const g = SCRIPT[ch];
    if (!g) {
      if (main) x += WORD_GAP;
      lift = true;
      continue;
    }
    const d = place(g[1], x);
    main += lift ? d : 'L' + d.slice(1);
    if (g[2]) extra.push(place(g[2], x));
    const ys = extent(g[1] + (g[2] ?? ''));
    const t = Math.min(...ys);
    top = Math.min(top, t);
    bottom = Math.max(bottom, ...ys);
    boxes.push({ x0: round(x), x1: round(x + g[0] * SX), top: t });
    lift = !!g[3];
    x += g[0] * SX + TRACK;
  }
  return { main, extra, width: boxes.length ? round(x - TRACK) : 0, top, bottom, boxes };
};

/** A closed star: `points` spikes, alternating radii. `wobble` makes the spikes uneven, like a hand-cut sticker. */
export const starPath = (
  points: number,
  outer: number,
  inner: number,
  cx: number = 0,
  cy: number = 0,
  wobble: number = 0,
  seed: number = 0,
): string => {
  const n = Math.max(3, Math.floor(points) || 3);
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? inner : outer * (1 + (hash(i * 9.7 + seed) - 0.5) * wobble);
    pts.push(round(cx + Math.cos(a) * r) + ' ' + round(cy + Math.sin(a) * r));
  }
  return 'M' + pts.join('L') + 'Z';
};

export type Spot = { x: number; y: number; size: number; rotate: number; depth: number };

/**
 * Where n stickers land on a word, in script units: spread evenly along it,
 * each riding the top of the letter underneath (some perched above it, some
 * slapped across the stroke), with a seeded tilt and a parallax depth.
 */
export const stickerSpots = (word: ScriptWord, n: number, seed: number = 0): Spot[] => {
  const count = Math.max(0, Math.floor(n) || 0);
  if (!count || !word.width) return [];
  return Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * word.width;
    const box = word.boxes.find((b) => x >= b.x0 && x <= b.x1 + TRACK) ??
      word.boxes[word.boxes.length - 1] ?? { x0: 0, x1: word.width, top: word.top };
    const lift = [1.5, -5, -1, -7, 0.5, -4, -2][i % 7] ?? 0;
    return {
      x: round(x + (hash(i * 4.1 + seed) - 0.5) * 3),
      y: round(clamp(box.top + 2.5 + lift, word.top - 4, -4)),
      size: round(6.4 + hash(i * 2.3 + seed + 1) * 2.4),
      rotate: round((hash(i * 7.7 + seed + 2) - 0.5) * 34),
      depth: round(0.4 + hash(i * 5.5 + seed + 3) * 0.8),
    };
  });
};
// #endregion

export type StickerKind = 'burst' | 'smiley' | 'heart' | 'bubble' | 'daisy' | 'camera' | 'bolt';

export type StickerSpec =
  | StickerKind
  | {
      kind?: StickerKind;
      /** Your own sticker art (an <img>, an <svg>, etc.). Replaces `kind`. */
      node?: React.ReactNode;
      /** Accessible name, e.g. "Smiley sticker". */
      label?: string;
      /** Text on the burst / bubble stickers. */
      text?: string;
      /** Position in % of the wordmark box; omit to let it find a letter. */
      x?: number;
      y?: number;
      /** Width in % of the wordmark box. */
      size?: number;
      rotate?: number;
    };

export type SocialKind =
  | 'linkedin'
  | 'behance'
  | 'whatsapp'
  | 'x'
  | 'figma'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'email'
  | 'upwork'
  | 'medium'
  | 'youtube'
  | 'dribbble';
export type Social = { kind: SocialKind; href: string; label?: string };
export type Job = { title: string; href?: string };
export type Credit = { role: string; name: string };

export interface StickerSlapFooterProps {
  /** The giant script wordmark. Letters a-z, `!` and `.`; anything else is a space. */
  wordmark?: string;
  /** Where the small wordmark in the top bar points. */
  homeHref?: string;
  /** The starburst link in the top-left corner. `""` hides it. */
  navLabel?: string;
  navHref?: string;
  /** Messaging link: the top-right bubble and the contact line. `""` hides both. */
  chatHref?: string;
  chatLabel?: string;
  jobsLabel?: string;
  /** `[]` hides the column. */
  jobs?: Job[];
  officeLabel?: string;
  /** One entry per line. `[]` hides the column. */
  address?: string[];
  mapLabel?: string;
  mapHref?: string;
  contactLabel?: string;
  /** Click copies it (falls back to `mailto:`). `""` hides it. */
  email?: string;
  copiedLabel?: string;
  /** Small print under the contact lines. `""` hides it. */
  note?: string;
  socials?: Social[];
  stickers?: StickerSpec[];
  /** `[]` hides the credits pill. */
  credits?: Credit[];
  /** Minimum height. Any definite CSS length. */
  height?: string;
  /** Caps the wordmark's height so short words don't get enormous. */
  wordmarkMaxHeight?: string;
  /** The frame. */
  paper?: string;
  /** The panel. */
  panel?: string;
  /** Text on the frame and the tags. */
  ink?: string;
  /** The wordmark and the panel text. Defaults to `paper`. */
  cream?: string;
  /** The nav starburst. */
  accent?: string;
  fontSans?: string;
  onStickerMove?: (index: number, x: number, y: number) => void;
  /** Optional header slot rendered inside the footer directly above `.ssf-panel`. */
  topSlot?: React.ReactNode;
  className?: string;
}

const DEFAULT_JOBS: Job[] = [{ title: 'Product Design' }, { title: 'UI/UX & Design Systems' }];
const DEFAULT_SOCIALS: Social[] = [
  {
    kind: 'linkedin',
    href: 'https://www.linkedin.com/in/osama-abdelnaser/',
    label: 'Osama on LinkedIn',
  },
  {
    kind: 'behance',
    href: 'https://www.behance.net/osamaabdelnaser1',
    label: 'Osama on Behance',
  },
  {
    kind: 'whatsapp',
    href: 'https://api.whatsapp.com/send/?phone=%2B201223165082&text&type=phone_number&app_absent=0',
    label: 'Message Osama on WhatsApp',
  },
  {
    kind: 'x',
    href: 'https://x.com/OsAAA98',
    label: 'Osama on X',
  },
  {
    kind: 'figma',
    href: 'https://www.figma.com/@osamaabdelnaser',
    label: 'Osama on Figma',
  },
  {
    kind: 'instagram',
    href: 'https://www.instagram.com/osamaabdelnaser.official/',
    label: 'Osama on Instagram',
  },
  {
    kind: 'tiktok',
    href: 'https://www.tiktok.com/@osamaabdelnaser.official',
    label: 'Osama on TikTok',
  },
  {
    kind: 'facebook',
    href: 'https://www.facebook.com/osamaabdelnaser.official',
    label: 'Osama on Facebook',
  },
  {
    kind: 'upwork',
    href: 'https://www.upwork.com/freelancers/~01bb3b2ee27ac86af8?mp_source=share',
    label: 'Osama on Upwork',
  },
  {
    kind: 'medium',
    href: 'https://medium.com/@osamaabdelnaser',
    label: 'Osama on Medium',
  },
];
const DEFAULT_STICKERS: StickerSpec[] = ['burst', 'smiley', 'heart', 'daisy', 'bubble', 'camera'];
const DEFAULT_CREDITS: Credit[] = [];

const LABELS: Record<StickerKind, string> = {
  burst: 'UX burst sticker',
  smiley: 'Smiley sticker',
  heart: 'Heart sticker',
  bubble: 'Speech bubble sticker',
  daisy: 'Daisy sticker',
  camera: 'Camera sticker',
  bolt: 'Lightning bolt sticker',
};

/** How far below the baseline the panel edge cuts the wordmark, in script units. */
const CUT = -1.2;
const STROKE = 3.3;
/** The script leans: tan(9 degrees). */
const SLANT = 0.1584;

const SQUIGGLE = 'M1 5C7 1 11 1 15 4S24 8 29 4S38 0 43 4S52 8 57 4S66 1 71 4S80 7 87 3';

const ICONS: Record<SocialKind, React.ReactNode> = {
  linkedin: (
    <path
      fillRule="evenodd"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"
    />
  ),
  behance: (
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
  ),
  whatsapp: (
    <path
      fillRule="evenodd"
      d="M17.472 14.382c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347Zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.847 9.847 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
    />
  ),
  x: (
    <path
      fillRule="evenodd"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
    />
  ),
  figma: (
    <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
  ),
  instagram: (
    <path
      fillRule="evenodd"
      d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03Zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"
    />
  ),
  tiktok: (
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.34-3.23-3.67-5.52-.33-2.3.36-4.66 1.87-6.42 1.51-1.76 3.79-2.78 6.1-2.73.47 0 .94.04 1.4.12v4.33c-.47-.11-.95-.17-1.44-.17-1.34.03-2.61.64-3.45 1.67-.84 1.03-1.12 2.4-.76 3.68.36 1.28 1.34 2.29 2.62 2.65 1.28.36 2.65.02 3.63-.91.73-.68 1.16-1.64 1.18-2.65.03-3.07-.01-6.14.02-9.21V.02Z" />
  ),
  facebook: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
  ),
  email: (
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.818V11.734L12 16.636l-6.546-4.902v9.268H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.279 24 3.434 24 5.457Z" />
  ),
  upwork: (
    <path
      fillRule="evenodd"
      d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06a2.705 2.705 0 0 1 2.703 2.703 2.707 2.707 0 0 1-2.704 2.702Zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112a2.55 2.55 0 0 1-2.547 2.548 2.55 2.55 0 0 1-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439Z"
    />
  ),
  medium: (
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" />
  ),
  youtube: (
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
  dribbble: (
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
  ),
};

const CSS =
  // Not inherited: the scroll value is written on the three layers that use it,
  // so a scroll frame restyles them and not the whole footer.
  "@property --ssf-sp{syntax:'<number>';inherits:false;initial-value:1}" +
  '.ssf{position:relative;isolation:isolate;overflow:hidden;overflow:clip;container-type:inline-size;display:flex;flex-direction:column;width:100%;box-sizing:border-box;padding:0 clamp(6px,.9cqw,12px) clamp(6px,.9cqw,12px);background:var(--ssf-paper);color:var(--ssf-ink);font-family:var(--ssf-sans);font-weight:500;-webkit-font-smoothing:antialiased}' +
  ':where(.ssf) *,:where(.ssf) *::before,:where(.ssf) *::after{box-sizing:border-box}' +
  ':where(.ssf) button{appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer}' +
  ':where(.ssf) a{color:inherit;text-decoration:none}' +
  ':where(.ssf) ul,:where(.ssf) p,:where(.ssf) h2,:where(.ssf) h3{margin:0;padding:0;list-style:none;font:inherit}' +
  '.ssf svg{display:block;max-width:none;overflow:visible}' +
  '.ssf :focus-visible{outline:2.5px solid var(--ssf-accent);outline-offset:3px;border-radius:6px}' +
  '.ssf-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}' +
  // top bar
  '.ssf-top{position:relative;z-index:2;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:clamp(14px,2cqw,26px) clamp(10px,1.6cqw,22px) clamp(24px,5cqw,80px)}' +
  '.ssf-nav{justify-self:start;position:relative;display:grid;place-items:center;width:clamp(58px,6.2cqw,80px);height:clamp(42px,4.4cqw,56px);font-weight:800;font-size:clamp(15px,1.6cqw,20px);letter-spacing:-.02em;color:var(--ssf-ink)}' +
  '.ssf-nav svg{position:absolute;left:-6%;top:-14%;width:72%;height:auto;color:var(--ssf-accent);transition:transform .7s cubic-bezier(.2,1.4,.3,1)}' +
  '.ssf-nav span{position:relative;transition:transform .4s cubic-bezier(.2,1.6,.3,1)}' +
  '.ssf-nav:hover svg{transform:rotate(72deg) scale(1.12)}' +
  '.ssf-nav:hover span{transform:rotate(-6deg) scale(1.06)}' +
  '.ssf-logo{display:block;color:var(--ssf-ink)}' +
  '.ssf-logo svg{height:clamp(24px,2.5cqw,34px);width:auto}' +
  '.ssf-logo path{fill:none;stroke:currentColor;stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round}' +
  '.ssf-chat{justify-self:end;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:var(--ssf-ink);transition:transform .45s cubic-bezier(.2,1.6,.3,1)}' +
  '.ssf-chat svg{width:24px;height:24px}' +
  '.ssf-chat:hover{transform:rotate(-14deg) scale(1.12)}' +
  // panel
  '.ssf [data-slot="tangle-footer"]{transform-origin:50% 100%}' +
  '.ssf-panel{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;overflow:hidden;overflow:clip;border-radius:clamp(14px,1.8cqw,24px);background:var(--ssf-panel);color:var(--ssf-ink);transform-origin:50% 100%}' +
  '.ssf [data-slot="tangle-footer"]+.ssf-panel{transform-origin:50% 0%}' +
  '.ssf-cols{position:relative;z-index:2;display:grid;grid-template-columns:repeat(var(--ssf-n,3),minmax(0,1fr));gap:clamp(22px,3cqw,44px) clamp(16px,2.4cqw,36px);padding:clamp(26px,5.4cqw,72px) clamp(18px,1.8cqw,26px) clamp(20px,3cqw,40px)}' +
  '.ssf-col{display:flex;flex-direction:column;align-items:flex-start;min-width:0}' +
  '.ssf-tag{display:inline-block;margin-bottom:clamp(14px,1.6cqw,22px);padding:.28em .72em .32em;border-radius:999px;background:var(--ssf-cream);color:var(--ssf-ink);font-size:clamp(12px,1.05cqw,14px);font-weight:600;line-height:1.2;letter-spacing:-.005em}' +
  '.ssf-big{font-size:clamp(19px,2.1cqw,30px);font-weight:800;line-height:1.16;letter-spacing:-.022em}' +
  '.ssf-line{display:block;overflow:hidden;overflow:clip;padding:0 .08em .06em;margin:0 -.08em -.06em}' +
  '.ssf-line>*{display:inline-block}' +
  '.ssf-big a,.ssf-big button{position:relative;text-align:left;transition:color .2s}' +
  ".ssf-big a::after,.ssf-big button::after{content:'';position:absolute;left:0;right:0;bottom:-.02em;height:.09em;border-radius:1em;background:currentColor;transform:scaleX(0);transform-origin:100% 50%;transition:transform .45s cubic-bezier(.6,0,.2,1)}" +
  '.ssf-big a:hover::after,.ssf-big button:hover::after,.ssf-big a:focus-visible::after,.ssf-big button:focus-visible::after{transform:scaleX(1);transform-origin:0 50%}' +
  '.ssf-copy{display:inline-grid !important}' +
  '.ssf-copy>span{grid-area:1/1;transition:transform .5s cubic-bezier(.2,1.2,.3,1),opacity .3s}' +
  '.ssf-copy .ssf-done{transform:translateY(105%);opacity:0}' +
  '.ssf-copy.is-copied .ssf-addr{transform:translateY(-105%);opacity:0}' +
  '.ssf-copy.is-copied .ssf-done{transform:none;opacity:1}' +
  '.ssf-ast{display:inline-block;margin-left:.04em;transition:transform .6s cubic-bezier(.2,1.6,.3,1)}' +
  '.ssf-big a:hover .ssf-ast{transform:rotate(180deg) scale(1.2)}' +
  '.ssf-map{position:relative;display:inline-block;margin-top:clamp(16px,1.8cqw,24px);font-size:clamp(14px,1.25cqw,17px);font-weight:700;letter-spacing:-.01em;padding-bottom:.55em}' +
  '.ssf-map svg{position:absolute;left:-2%;bottom:0;width:104%;height:.5em}' +
  '.ssf-map path{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:var(--l,120px) var(--l,120px);stroke-dashoffset:0}' +
  '.ssf-map:hover path,.ssf-map:focus-visible path{animation:ssf-rewrite .7s cubic-bezier(.6,0,.3,1)}' +
  '.ssf-note{margin-top:clamp(12px,1.3cqw,18px);max-width:34ch;font-size:clamp(11px,.92cqw,13px);line-height:1.45;opacity:.82}' +
  '.ssf-socials{display:flex;flex-wrap:wrap;gap:clamp(8px,.9cqw,12px);margin-top:clamp(16px,2cqw,26px)}' +
  '.ssf-soc{display:grid;place-items:center;width:clamp(34px,2.9cqw,40px);height:clamp(34px,2.9cqw,40px);border-radius:12px;color:var(--ssf-cream);box-shadow:inset 0 0 0 1.5px color-mix(in oklab,var(--ssf-cream) 45%,transparent);transition:background .25s,color .25s,box-shadow .25s,transform .45s cubic-bezier(.2,1.6,.3,1)}' +
  '.ssf-soc svg{width:54%;height:54%;fill:currentColor}' +
  '.ssf-soc svg [data-stroke]{fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round}' +
  '.ssf-soc:hover,.ssf-soc:focus-visible{background:var(--ssf-cream);color:var(--ssf-panel);box-shadow:inset 0 0 0 1.5px var(--ssf-cream);transform:translateY(-3px) rotate(-8deg)}' +
  // the wordmark stage
  '.ssf-stage{position:relative;z-index:1;margin-top:auto;width:min(100%,calc(var(--ssf-wmh) * var(--ssf-ar)));align-self:center;padding:0 clamp(6px,.8cqw,12px)}' +
  '.ssf-stage-in{position:relative;container-type:inline-size}' +
  '.ssf-wm-btn{display:block;width:100%;border-radius:0 !important;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
  '.ssf-wm{width:100%;height:auto;color:var(--ssf-cream)}' +
  '.ssf-wm path{fill:none;stroke:currentColor;stroke-width:' +
  STROKE +
  ';stroke-linecap:round;stroke-linejoin:round}' +
  // stickers
  '.ssf-st{position:absolute;z-index:3;translate:-50% -50%;touch-action:none;user-select:none;-webkit-user-select:none}' +
  '.ssf-st-btn{display:block;width:100%;cursor:grab;rotate:calc(var(--r) + var(--tilt,0deg));transition:rotate .5s cubic-bezier(.2,1.4,.3,1)}' +
  '.ssf-st.is-drag{z-index:9}' +
  '.ssf-st.is-drag .ssf-st-btn{cursor:grabbing;transition:rotate .12s linear}' +
  '.ssf-st-lift{display:block;transition:transform .35s cubic-bezier(.2,1.5,.3,1),filter .35s}' +
  '.ssf-st-lift{filter:drop-shadow(0 1px .5px rgba(23,40,79,.28)) drop-shadow(0 4px 6px rgba(23,40,79,.18))}' +
  '.ssf-st-btn:hover .ssf-st-lift,.ssf-st-btn:focus-visible .ssf-st-lift{transform:translateY(-4%) scale(1.06);filter:drop-shadow(0 2px 1px rgba(23,40,79,.2)) drop-shadow(0 14px 16px rgba(23,40,79,.3))}' +
  '.ssf-st.is-drag .ssf-st-lift{transform:translateY(-7%) scale(1.12);filter:drop-shadow(0 2px 1px rgba(23,40,79,.16)) drop-shadow(0 22px 22px rgba(23,40,79,.34))}' +
  '.ssf-st-slap{display:block}' +
  '.ssf-st svg{width:100%;height:auto}' +
  '.ssf-sheen{transform:translateX(-130%);transition:transform 0s}' +
  '.ssf-st-btn:hover .ssf-sheen{transform:translateX(130%);transition:transform .9s cubic-bezier(.4,0,.2,1)}' +
  '.ssf-ring{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;border:2px solid var(--ssf-cream);opacity:0;pointer-events:none}' +
  // credits
  '.ssf-credits{position:absolute;z-index:6;right:clamp(10px,1.2cqw,16px);bottom:clamp(10px,1.2cqw,16px)}' +
  '.ssf-pill{display:block;padding:.3em .8em .34em;border-radius:999px;background:var(--ssf-ink);color:var(--ssf-paper);font-size:clamp(12px,1cqw,14px);font-weight:600;transition:transform .4s cubic-bezier(.2,1.6,.3,1),background .2s}' +
  '.ssf-pill:hover{transform:rotate(-5deg) scale(1.06)}' +
  // The custom cursor hides "grab", so a small note says the stickers move.
  '.ssf-hint{position:absolute;z-index:6;left:clamp(10px,1.2cqw,16px);bottom:clamp(10px,1.2cqw,16px);display:flex;align-items:center;gap:.45em;margin:0;padding:.3em .8em .34em .6em;border:1.5px solid var(--ssf-ink);border-radius:999px;background:var(--ssf-paper);color:var(--ssf-ink);font-size:clamp(12px,1cqw,14px);font-weight:600;pointer-events:none;transition:opacity .4s,translate .4s}' +
  '.ssf-hint svg{width:1.15em;height:1.15em;flex:none}' +
  '.ssf-hint.is-gone{opacity:0;translate:0 8px}' +
  '.ssf-pop{position:absolute;right:0;bottom:calc(100% + 10px);width:max-content;max-width:min(300px,80cqw);padding:14px 16px;border-radius:16px;background:var(--ssf-paper);color:var(--ssf-ink);box-shadow:0 0 0 4px #fff,0 18px 40px rgba(23,40,79,.35);transform-origin:90% 100%;animation:ssf-popin .45s cubic-bezier(.2,1.5,.3,1)}' +
  '.ssf-pop li{display:flex;flex-direction:column;padding:6px 0;font-size:13px;line-height:1.3}' +
  '.ssf-pop li+li{border-top:1.5px dashed color-mix(in oklab,var(--ssf-ink) 22%,transparent)}' +
  '.ssf-pop b{font-size:11px;font-weight:600;opacity:.6;text-transform:lowercase}' +
  '.ssf-pop strong{font-weight:800;letter-spacing:-.01em}' +
  '@container (max-width: 760px){.ssf-cols{grid-template-columns:minmax(0,1fr)}.ssf-top{padding-bottom:24px}.ssf-stage{width:min(165%,calc(var(--ssf-wmh) * var(--ssf-ar)));max-width:none;margin-left:-6%}}' +
  '@keyframes ssf-rewrite{0%{stroke-dashoffset:var(--l,120px)}100%{stroke-dashoffset:0}}' +
  '@keyframes ssf-popin{from{opacity:0;transform:translateY(10px) scale(.7) rotate(4deg)}}' +
  // the storyboard: everything above is the finished state; motion only adds the way in
  '@media (prefers-reduced-motion: no-preference){' +
  '.ssf [data-slot="tangle-footer"]{scale:calc(.82 + .1 * var(--ssf-sp,1));will-change:scale}' +
  '.ssf-panel{will-change:scale;scale:calc(.9 + .1 * var(--ssf-sp,1));border-radius:calc(clamp(14px,1.8cqw,24px) + (1 - var(--ssf-sp,1)) * 60px)}' +
  '.ssf-stage-in{transform:translateY(calc((1 - var(--ssf-sp,1)) * 18%))}' +
  '.ssf-st{transform:translate(calc(var(--ssf-px,0) * var(--d) * 9px),calc(var(--ssf-py,0) * var(--d) * 6px));transition:transform .7s cubic-bezier(.2,.8,.2,1)}' +
  '.ssf-st.is-drag{transition:none}' +
  '.ssf:not(.is-in) .ssf-top>*,.ssf:not(.is-in) .ssf-tag,.ssf:not(.is-in) .ssf-line>*,.ssf:not(.is-in) .ssf-map,.ssf:not(.is-in) .ssf-note,.ssf:not(.is-in) .ssf-soc,.ssf:not(.is-in) .ssf-pill,.ssf:not(.is-in) .ssf-hint{opacity:0}' +
  '.ssf.is-in .ssf-top>*{animation:ssf-fall .8s cubic-bezier(.2,1.3,.3,1) both}' +
  '.ssf.is-in .ssf-top>:nth-child(2){animation-delay:.08s}.ssf.is-in .ssf-top>:nth-child(3){animation-delay:.16s}' +
  '.ssf.is-in .ssf-panel{animation:ssf-grow 1.1s cubic-bezier(.7,0,.2,1) both}' +
  '.ssf.is-in .ssf-tag{animation:ssf-pop .7s cubic-bezier(.2,1.7,.3,1) both;animation-delay:calc(.45s + var(--c) * .1s)}' +
  '.ssf.is-in .ssf-line>*{animation:ssf-rise .8s cubic-bezier(.2,.9,.2,1) both;animation-delay:calc(.55s + var(--c) * .1s + var(--i) * .07s)}' +
  '.ssf.is-in .ssf-map,.ssf.is-in .ssf-note{animation:ssf-fade .7s ease both;animation-delay:calc(.85s + var(--c) * .1s)}' +
  '.ssf.is-in .ssf-soc{animation:ssf-pop .6s cubic-bezier(.2,1.7,.3,1) both;animation-delay:calc(1s + var(--i) * .05s)}' +
  '.ssf.is-in .ssf-pill,.ssf.is-in .ssf-hint:not(.is-gone){animation:ssf-pop .6s cubic-bezier(.2,1.7,.3,1) both;animation-delay:var(--end)}' +
  '.ssf .ssf-wm path{stroke-dasharray:var(--l,3000px) calc(var(--l,3000px) + 8px);stroke-dashoffset:calc(var(--l,3000px) + 4px)}' +
  '.ssf:not(.is-in) .ssf-wm path{visibility:hidden}' +
  '.ssf.is-in .ssf-wm path{animation:ssf-write var(--dur) var(--at) cubic-bezier(.55,.1,.35,1) both}' +
  '.ssf:not(.is-in) .ssf-st-slap{opacity:0}' +
  '.ssf.is-in .ssf-st-slap{animation:ssf-slap .62s var(--at) cubic-bezier(.3,1.5,.4,1) both}' +
  '.ssf.is-in .ssf-ring{animation:ssf-ring .7s var(--at) cubic-bezier(.2,.8,.2,1) both}' +
  '.ssf-logo:hover path{animation:ssf-rewrite 1.1s cubic-bezier(.55,.1,.35,1)}' +
  '.ssf-logo path{stroke-dasharray:var(--l,3000px) calc(var(--l,3000px) + 8px)}' +
  '.ssf-st-btn:active .ssf-st-lift{transform:translateY(-6%) scale(1.1)}' +
  '}' +
  '@keyframes ssf-write{0%{stroke-dashoffset:calc(var(--l,3000px) + 4px);visibility:visible}100%{stroke-dashoffset:0;visibility:visible}}' +
  '@keyframes ssf-fall{from{opacity:0;transform:translateY(-14px) rotate(-6deg)}}' +
  '@keyframes ssf-grow{0%{clip-path:inset(30% 12% 0 12% round 80px);transform:translateY(40px)}100%{clip-path:inset(0 0 0 0 round 0);transform:none}}' +
  '@keyframes ssf-pop{0%{opacity:0;transform:scale(.4) rotate(-12deg)}100%{opacity:1;transform:none}}' +
  '@keyframes ssf-rise{from{opacity:1;transform:translateY(110%)}to{opacity:1;transform:none}}' +
  '@keyframes ssf-fade{from{opacity:0;transform:translateY(8px)}}' +
  '@keyframes ssf-slap{0%{opacity:0;transform:scale(2.1) rotate(24deg) translateY(-30%);filter:blur(1.5px)}55%{opacity:1;transform:scale(.9) rotate(-3deg);filter:none}78%{transform:scale(1.05) rotate(1deg)}100%{opacity:1;transform:none}}' +
  '@keyframes ssf-ring{0%{opacity:0;transform:scale(.3)}40%{opacity:.75}100%{opacity:0;transform:scale(1)}}';

/** Stamps each path's real length into --l, for the draw-in. */
const useStrokeLengths = (ref: React.RefObject<Element | null>, key: string) =>
  React.useEffect(() => {
    ref.current?.querySelectorAll<SVGPathElement>('path[data-draw]').forEach((p) => {
      p.style.setProperty('--l', Math.ceil(p.getTotalLength()) + 1 + 'px');
    });
  }, [ref, key]);

/** A word in the script, scaled to fit a box: for sticker captions. */
function ScriptText({
  text,
  cx,
  cy,
  w,
  color,
  stroke = STROKE,
}: {
  text: string;
  cx: number;
  cy: number;
  w: number;
  color: string;
  stroke?: number;
}) {
  const { main, extra, width, top } = React.useMemo(() => layoutScript(text), [text]);
  if (!width) return null;
  const s = w / (width + stroke);
  const h = (-top + 1) * s;
  return (
    <g
      transform={
        'translate(' +
        round(cx - (width * s) / 2) +
        ' ' +
        round(cy + h / 2 - s) +
        ') scale(' +
        round(s) +
        ')'
      }
    >
      <path
        d={main + extra.join('')}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

const sparkle = (cx: number, cy: number, r: number) =>
  'M' +
  cx +
  ' ' +
  (cy - r) +
  'Q' +
  cx +
  ' ' +
  cy +
  ' ' +
  (cx + r) +
  ' ' +
  cy +
  'Q' +
  cx +
  ' ' +
  cy +
  ' ' +
  cx +
  ' ' +
  (cy + r) +
  'Q' +
  cx +
  ' ' +
  cy +
  ' ' +
  (cx - r) +
  ' ' +
  cy +
  'Q' +
  cx +
  ' ' +
  cy +
  ' ' +
  cx +
  ' ' +
  (cy - r) +
  'Z';

const BURST = starPath(13, 54, 39, 60, 60, 0.2, 4);
const BOLT = 'M70 8L26 66H55L44 112L94 48H64Z';
const HEART = 'M60 100C22 76 10 56 18 38C26 20 50 18 60 38C70 18 94 20 102 38C110 56 98 76 60 100Z';
const BUBBLE =
  'M24 22H96A14 14 0 0 1 110 36V70A14 14 0 0 1 96 84H56L34 102L38 84H24A14 14 0 0 1 10 70V36A14 14 0 0 1 24 22Z';

/** The silhouette (die-cut in white) and the art on top, in a 120 x 120 box. */
const stickerArt = (
  kind: StickerKind,
  text?: string,
): { shape: React.ReactNode; art: React.ReactNode } => {
  switch (kind) {
    case 'burst':
      return {
        shape: <path d={BURST} />,
        art: (
          <>
            <path d={BURST} fill="#E43468" />
            <path d={starPath(13, 44, 33, 60, 60, 0.2, 4)} fill="#F3D061" />
            <ScriptText text={text ?? 'ux'} cx={60} cy={58} w={62} color="#17284F" stroke={3.4} />
          </>
        ),
      };
    case 'smiley':
      return {
        shape: <circle cx="60" cy="60" r="50" />,
        art: (
          <>
            <circle cx="60" cy="60" r="50" fill="#5B8DFB" />
            <circle cx="60" cy="60" r="40" fill="none" stroke="#fff" strokeWidth="3" opacity=".9" />
            <ellipse cx="47" cy="50" rx="4" ry="7.5" fill="#fff" />
            <ellipse cx="73" cy="50" rx="4" ry="7.5" fill="#fff" />
            <path
              d="M36 66Q60 92 84 66M32 63L39 69M88 63L81 69"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        ),
      };
    case 'heart':
      return {
        shape: (
          <>
            <path d={HEART} />
            <path d={sparkle(100, 20, 14)} />
            <path d={sparkle(18, 92, 10)} />
          </>
        ),
        art: (
          <>
            <path d={HEART} fill="#E43468" />
            <path
              d="M30 42Q32 30 45 29"
              fill="none"
              stroke="#fff"
              strokeWidth="5.5"
              strokeLinecap="round"
              opacity=".9"
            />
            <path d={sparkle(100, 20, 14)} fill="#F8FA55" />
            <path d={sparkle(18, 92, 10)} fill="#F8FA55" />
          </>
        ),
      };
    case 'bubble':
      return {
        shape: <path d={BUBBLE} />,
        art: (
          <>
            <path d={BUBBLE} fill="#F3D061" />
            <ScriptText
              text={text ?? 'ui!'}
              cx={60}
              cy={53}
              w={text ? 76 : 44}
              color="#17284F"
              stroke={3.6}
            />
          </>
        ),
      };
    case 'daisy': {
      const petals = Array.from({ length: 9 }, (_, i) => (
        <ellipse
          key={i}
          cx="60"
          cy="31"
          rx="13"
          ry="22"
          transform={'rotate(' + i * 40 + ' 60 60)'}
        />
      ));
      return {
        shape: <>{petals}</>,
        art: (
          <>
            <g fill="#F8FA55">{petals}</g>
            <circle cx="60" cy="60" r="19" fill="#E43468" />
            <circle cx="53.5" cy="57" r="2.6" fill="#17284F" />
            <circle cx="66.5" cy="57" r="2.6" fill="#17284F" />
            <path
              d="M53 65Q60 71 67 65"
              fill="none"
              stroke="#17284F"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ),
      };
    }
    case 'camera':
      return {
        shape: (
          <>
            <rect x="12" y="36" width="96" height="66" rx="16" />
            <rect x="38" y="24" width="36" height="20" rx="6" />
          </>
        ),
        art: (
          <>
            <rect x="12" y="36" width="96" height="66" rx="16" fill="#17284F" />
            <rect x="38" y="24" width="36" height="20" rx="6" fill="#17284F" />
            <circle cx="60" cy="70" r="24" fill="#fff" />
            <circle cx="60" cy="70" r="17" fill="#17284F" />
            <circle cx="60" cy="70" r="11" fill="#5B8DFB" />
            <circle cx="55" cy="65" r="4" fill="#fff" />
            <rect x="86" y="46" width="12" height="7" rx="3" fill="#F8FA55" />
            <path d="M22 50H30" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".5" />
          </>
        ),
      };
    case 'bolt':
    default:
      return {
        shape: <path d={BOLT} />,
        art: (
          <>
            <path d={BOLT} fill="#F8FA55" />
            <path
              d="M66 20L38 58"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              opacity=".75"
            />
          </>
        ),
      };
  }
};

function StickerSvg({ kind, text }: { kind: StickerKind; text?: string }) {
  const id = 'ssf' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const { shape, art } = stickerArt(kind, text);
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id + 'c'}>{shape}</clipPath>
        <linearGradient id={id + 'g'} x1="0" x2="1" y1="0" y2="0">
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="#fff" stroke="#fff" strokeWidth="11" strokeLinejoin="round">
        {shape}
      </g>
      {art}
      <g clipPath={'url(#' + id + 'c)'}>
        <g transform="rotate(20 60 60)">
          <rect
            className="ssf-sheen"
            x="-30"
            y="-30"
            width="180"
            height="180"
            fill={'url(#' + id + 'g)'}
          />
        </g>
      </g>
    </svg>
  );
}

const isExternal = (href?: string) => !!href && /^https?:/.test(href);
const linkProps = (href?: string) => ({
  href: href || '#',
  target: isExternal(href) ? '_blank' : undefined,
  rel: isExternal(href) ? 'noopener noreferrer' : undefined,
  onClick: (e: React.MouseEvent) => {
    if (!href || href === '#') e.preventDefault();
  },
});

type Placed = { x: number; y: number };

export default function StickerSlapFooter({
  wordmark = 'osama',
  chatHref = 'https://api.whatsapp.com/send/?phone=%2B201223165082&text&type=phone_number&app_absent=0',
  chatLabel = 'Let’s connect',
  jobsLabel = 'expertise',
  jobs = DEFAULT_JOBS,
  officeLabel = 'location & reach',
  address = ['Egypt', 'Cairo · Riyadh · Remote'],
  mapLabel = '',
  mapHref = '',
  contactLabel = 'contact',
  email = 'osamaabdelnaser18@gmail.com',
  copiedLabel = 'copied, talk soon!',
  note = '',
  socials = DEFAULT_SOCIALS,
  stickers = DEFAULT_STICKERS,
  credits = DEFAULT_CREDITS,
  height = 'auto',
  wordmarkMaxHeight = '50svh',
  paper = '#F8FA55',
  panel = '#5B8DFB',
  ink = '#17284F',
  cream = '#F8FA55',
  accent = '#E43468',
  fontSans = "'DM Sans', 'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  onStickerMove,
  topSlot,
  className = '',
}: StickerSlapFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const [copied, setCopied] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [moved, setMoved] = React.useState<Record<number, Placed>>({});
  const [order, setOrder] = React.useState<number[]>([]);
  const drag = React.useRef<{
    i: number;
    id: number;
    sx: number;
    sy: number;
    px: number;
    py: number;
    lx: number;
    t: number;
    tilt: number;
    w: number;
    h: number;
    went: boolean;
  } | null>(null);

  const word = React.useMemo(() => layoutScript(wordmark), [wordmark]);
  const pad = STROKE / 2 + 0.6;
  const vbX = -1.4 - pad;
  const vbY = word.top - pad;
  const vbW = Math.max(word.width, 1) + 2.8 + pad * 2 - word.top * SLANT;
  const vbH = word.bottom + pad - vbY;
  const cutH = CUT - vbY;

  const spots = React.useMemo(
    () => stickerSpots(word, stickers.length, 3),
    [word, stickers.length],
  );
  const drawDur = clamp(0.7 + word.width / 45, 1.1, 2.6);
  const writeAt = 1.05;
  const toPct = (s: Spot) => ({
    x: ((s.x - s.y * SLANT - vbX) / vbW) * 100,
    y: ((s.y - vbY) / vbH) * 100,
  });

  const items = stickers.map((spec, i) => {
    const o = typeof spec === 'string' ? { kind: spec } : spec;
    const spot = spots[i] ?? { x: 0, y: 0, size: 11, rotate: 0, depth: 1 };
    const auto = toPct(spot);
    const home = { x: o.x ?? auto.x, y: o.y ?? auto.y };
    const xf = clamp((home.x / 100) * vbW + vbX, 0, word.width) / Math.max(word.width, 1);
    return {
      i,
      kind: (o.kind ?? 'burst') as StickerKind,
      node: o.node,
      text: o.text,
      label: o.label ?? LABELS[(o.kind ?? 'burst') as StickerKind],
      home,
      at: moved[i] ?? home,
      size: o.size ?? (spot.size / vbW) * 100,
      rotate: o.rotate ?? spot.rotate,
      depth: spot.depth,
      // slaps down the moment the pen passes under it
      delay: writeAt + drawDur * Math.pow(xf, 0.92) + 0.08,
    };
  });
  const endAt = writeAt + drawDur + word.extra.length * 0.16 + 0.5;

  useStrokeLengths(rootRef, wordmark + run);

  // The storyboard plays once, the first time a fifth of it is on screen.
  React.useEffect(() => {
    const el = panelRef.current ?? rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll-linked: 0 while the footer is still below the fold, 1 once it fills
  // the screen (or is entirely in view), eased into --ssf-sp.
  React.useEffect(() => {
    const el = rootRef.current;
    const target = panelRef.current ?? el;
    if (!el || !target) return;
    let raf = 0;
    let shown = '';
    const update = () => {
      raf = 0;
      const r = target.getBoundingClientRect();
      const vh = document.documentElement.clientHeight || r.height;
      const span = Math.min(r.height, vh) || 1;
      const p = clamp((vh - r.top) / span, 0, 1);
      // Skip identical writes: while the footer is off screen the value sits at 0.
      const next = (1 - Math.pow(1 - p, 2)).toFixed(4);
      if (next === shown) return;
      shown = next;
      // Looked up per change: the home page's tangle band mounts later.
      el.querySelectorAll<HTMLElement>(
        '[data-slot="tangle-footer"], .ssf-panel, .ssf-stage-in',
      ).forEach((layer) => layer.style.setProperty('--ssf-sp', next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true, capture: true });
    addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll, { capture: true });
      removeEventListener('resize', onScroll);
    };
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(0), 2200);
    return () => clearTimeout(id);
  }, [copied]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const reduced = () =>
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied((c) => c + 1);
    } catch {
      window.location.href = 'mailto:' + email;
    }
  };

  const raise = (i: number) => setOrder((o) => [...o.filter((k) => k !== i), i]);

  const putAt = (i: number, p: Placed, announce: boolean = true) => {
    setMoved((m) => ({ ...m, [i]: p }));
    if (announce) onStickerMove?.(i, round(p.x), round(p.y));
  };

  const wiggle = (el: Element | null, frames: Keyframe[], duration: number) => {
    if (!reduced())
      (el as HTMLElement | null)?.animate?.(frames, {
        duration,
        easing: 'cubic-bezier(.3,1.4,.4,1)',
      });
  };
  const slapFrames: Keyframe[] = [
    { transform: 'scale(1.14)' },
    { transform: 'scale(.93,1.04)', offset: 0.4 },
    { transform: 'scale(1.02,.98)', offset: 0.7 },
    { transform: 'none' },
  ];
  const shakeFrames: Keyframe[] = [
    { transform: 'none' },
    { transform: 'rotate(-14deg) scale(1.1)', offset: 0.3 },
    { transform: 'rotate(9deg)', offset: 0.6 },
    { transform: 'none' },
  ];

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (e.button !== 0 || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const item = items[i];
    if (!item) return;
    const at = item.at;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      i,
      id: e.pointerId,
      sx: at.x,
      sy: at.y,
      px: e.clientX,
      py: e.clientY,
      lx: e.clientX,
      // eslint-disable-next-line react-hooks/purity -- Event-time pointer velocity, never called during render.
      t: performance.now(),
      tilt: 0,
      w: r.width,
      h: r.height,
      went: false,
    };
    raise(i);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.went && Math.hypot(dx, dy) < 4) return;
    const host = e.currentTarget.parentElement;
    if (!host) return;
    if (!d.went) host.classList.add('is-drag');
    d.went = true;
    const x = clamp(d.sx + (dx / d.w) * 100, 1, 99);
    const y = clamp(d.sy + (dy / d.h) * 100, -70, 96);
    host.style.left = x + '%';
    host.style.top = y + '%';
    // tilt with the throw: velocity, smoothed
    // eslint-disable-next-line react-hooks/purity -- This pointer event handler measures drag velocity.
    const now = performance.now();
    const v = (e.clientX - d.lx) / Math.max(1, now - d.t);
    d.tilt = d.tilt * 0.75 + clamp(v * 22, -24, 24) * 0.25;
    d.lx = e.clientX;
    d.t = now;
    host.style.setProperty('--tilt', d.tilt.toFixed(2) + 'deg');
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const host = e.currentTarget.parentElement;
    host?.classList.remove('is-drag');
    host?.style.setProperty('--tilt', '0deg');
    const lift = e.currentTarget.querySelector('.ssf-st-lift');
    if (d.went && host) {
      putAt(d.i, { x: parseFloat(host.style.left), y: parseFloat(host.style.top) });
      wiggle(lift, slapFrames, 420);
    } else wiggle(lift, shakeFrames, 520);
  };
  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.shiftKey ? 6 : 2;
    const item = items[i];
    if (!item) return;
    const at = item.at;
    const go: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const direction = go[e.key];
    if (direction) {
      e.preventDefault();
      raise(i);
      putAt(i, { x: clamp(at.x + direction[0], 1, 99), y: clamp(at.y + direction[1], -70, 96) });
    } else if (e.key === 'Home' || e.key === 'Escape') {
      e.preventDefault();
      goHome(i, e.currentTarget);
    }
  };
  const goHome = (i: number, btn: HTMLElement) => {
    setMoved((m) => {
      const next = { ...m };
      delete next[i];
      return next;
    });
    const item = items[i];
    if (item) onStickerMove?.(i, round(item.home.x), round(item.home.y));
    wiggle(btn.querySelector('.ssf-st-lift'), slapFrames, 420);
  };

  // Write it again: the wordmark redraws and every sticker slaps back home.
  const replay = () => {
    setMoved({});
    setRun((r) => r + 1);
  };

  const style = {
    '--ssf-paper': paper,
    '--ssf-panel': panel,
    '--ssf-ink': ink,
    '--ssf-cream': cream ?? paper,
    '--ssf-accent': accent,
    '--ssf-sans': fontSans,
    '--ssf-wmh': wordmarkMaxHeight,
    '--ssf-ar': String(round(vbW / cutH)),
    minHeight: height,
  } as React.CSSProperties;

  // The parallax is written on the stage (the stickers' parent), not the root.
  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    const root = rootRef.current;
    const el = stageRef.current;
    if (!root || !el || e.pointerType !== 'mouse') return;
    const r = root.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty('--ssf-px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty('--ssf-py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const onLeave = () => {
    stageRef.current?.style.setProperty('--ssf-px', '0');
    stageRef.current?.style.setProperty('--ssf-py', '0');
  };

  const cols: React.ReactNode[] = [];
  if (jobs.length)
    cols.push(
      <div className="ssf-col" key="jobs">
        <h2 className="ssf-tag">{jobsLabel}</h2>
        <ul className="ssf-big">
          {jobs.map((j, i) => (
            <li key={i} className="ssf-line" style={{ '--i': i } as React.CSSProperties}>
              {j.href ? <a {...linkProps(j.href)}>{j.title}</a> : <span>{j.title}</span>}
            </li>
          ))}
        </ul>
      </div>,
    );
  if (address.length)
    cols.push(
      <div className="ssf-col" key="office">
        <h2 className="ssf-tag">{officeLabel}</h2>
        <address className="ssf-big" style={{ fontStyle: 'normal' }}>
          {address.map((l, i) => (
            <span key={i} className="ssf-line" style={{ '--i': i } as React.CSSProperties}>
              <span>{l}</span>
            </span>
          ))}
        </address>
        {mapLabel && (
          <a className="ssf-map" {...linkProps(mapHref)}>
            {mapLabel}
            <svg viewBox="0 0 88 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d={SQUIGGLE} data-draw="" />
            </svg>
          </a>
        )}
      </div>,
    );
  if (email || chatHref || socials.length)
    cols.push(
      <div className="ssf-col" key="contact">
        <h2 className="ssf-tag">{contactLabel}</h2>
        <ul className="ssf-big">
          {email && (
            <li className="ssf-line" style={{ '--i': 0 } as React.CSSProperties}>
              <button
                type="button"
                className={'ssf-copy' + (copied ? ' is-copied' : '')}
                onClick={copy}
                title="Copy email address"
              >
                <span className="ssf-addr">{email}</span>
                <span className="ssf-done" aria-hidden="true">
                  {copiedLabel}
                </span>
              </button>
            </li>
          )}
          {chatHref && chatLabel && (
            <li className="ssf-line" style={{ '--i': 1 } as React.CSSProperties}>
              <a {...linkProps(chatHref)}>
                {chatLabel}
                {note && <span className="ssf-ast">*</span>}
              </a>
            </li>
          )}
        </ul>
        {note && <p className="ssf-note">{note}</p>}
        {socials.length > 0 && (
          <ul className="ssf-socials">
            {socials.map((s, i) => (
              <li key={i}>
                <a
                  className="ssf-soc"
                  {...linkProps(s.href)}
                  aria-label={s.label ?? s.kind}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {ICONS[s.kind]}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
        <span className="ssf-sr" role="status">
          {copied ? 'Email address copied' : ''}
        </span>
      </div>,
    );

  return (
    <footer
      ref={rootRef}
      data-site-footer=""
      className={'ssf' + (seen ? ' is-in' : '') + (className ? ' ' + className : '')}
      style={style}
      onPointerMove={onPointer}
      onPointerLeave={onLeave}
    >
      <style>{CSS}</style>

      {topSlot}

      <div ref={panelRef} className="ssf-panel">
        {cols.length > 0 && (
          <div className="ssf-cols" style={{ '--ssf-n': cols.length } as React.CSSProperties}>
            {cols.map((c, k) => (
              <React.Fragment key={k}>
                {React.cloneElement(c as React.ReactElement<{ style?: React.CSSProperties }>, {
                  style: { '--c': k } as React.CSSProperties,
                })}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="ssf-stage">
          <div
            className="ssf-stage-in"
            ref={stageRef}
            style={{ marginBottom: round(-((vbH - cutH) / vbW) * 100) + '%' }}
          >
            <button
              type="button"
              className="ssf-wm-btn"
              onClick={replay}
              aria-label={'Write ' + wordmark + ' again'}
            >
              <svg
                key={run}
                className="ssf-wm"
                viewBox={[vbX, vbY, vbW, vbH].map(round).join(' ')}
                aria-hidden="true"
                focusable="false"
              >
                <g transform={'skewX(-9)'}>
                  <path
                    d={word.main}
                    data-draw=""
                    style={{ '--dur': drawDur + 's', '--at': writeAt + 's' } as React.CSSProperties}
                  />
                  {word.extra.map((d, k) => (
                    <path
                      key={k}
                      d={d}
                      data-draw=""
                      style={
                        {
                          '--dur': '.28s',
                          '--at': round(writeAt + drawDur + k * 0.16) + 's',
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </g>
              </svg>
            </button>

            {items.map((s) => (
              <div
                key={s.i}
                className="ssf-st"
                style={
                  {
                    left: s.at.x + '%',
                    top: s.at.y + '%',
                    width: 'max(' + round(s.size) + 'cqw, 46px)',
                    zIndex: 3 + Math.max(0, order.indexOf(s.i) + 1),
                    '--r': s.rotate + 'deg',
                    '--d': s.depth,
                    '--at': round(s.delay) + 's',
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  className="ssf-st-btn"
                  aria-label={
                    s.label + '. Drag, or use the arrow keys, to move it. Escape puts it back.'
                  }
                  onPointerDown={(e) => onDown(e, s.i)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onDoubleClick={(e) => goHome(s.i, e.currentTarget)}
                  onKeyDown={(e) => onKey(e, s.i)}
                >
                  <span key={run} className="ssf-st-slap">
                    <span className="ssf-st-lift">
                      {s.node ?? <StickerSvg kind={s.kind} text={s.text} />}
                    </span>
                  </span>
                </button>
                <span key={'r' + run} className="ssf-ring" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <p
            className={Object.keys(moved).length ? 'ssf-hint is-gone' : 'ssf-hint'}
            aria-hidden="true"
            style={{ '--end': round(endAt) + 's' } as React.CSSProperties}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
            </svg>
            drag the stickers
          </p>
        )}

        {credits.length > 0 && (
          <div className="ssf-credits" ref={popRef}>
            {open && (
              <ul className="ssf-pop">
                {credits.map((c, i) => (
                  <li key={i}>
                    <b>{c.role}</b>
                    <strong>{c.name}</strong>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="ssf-pill"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              style={{ '--end': round(endAt) + 's' } as React.CSSProperties}
            >
              credits
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
