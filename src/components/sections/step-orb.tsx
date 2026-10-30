'use client';

import { useEffect, useRef } from 'react';

import { motionConfig } from '@/lib/motion/config';
import { gsap } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';

/*
 * The agent state of the workspace, drawn as a dotted object in the header's
 * spare corner: one cloud of points that every state reshapes (a breathing
 * sphere, a rippling one, a torus, an atom, a scan, two linked bodies, a
 * helix, a cube melting to a sphere). On a state change the cloud morphs into
 * the next shape with a GSAP tween. Idle sleeps with Zs rising, thinking is a
 * thought bubble, waiting for approval is an hourglass and done is a tick. Drawn on a canvas in brand colours; the
 * loop runs only while the canvas is on screen and the page is visible.
 */

export type StepOrbState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'reasoning'
  | 'tool-call'
  | 'tool-result'
  | 'streaming'
  | 'waiting-approval'
  | 'error'
  | 'done';

type Vec3 = readonly [number, number, number];
type Rgb = Vec3;
type Look = {
  /** Dot colour nearest the viewer, and at the back. */
  front: Rgb;
  back: Rgb;
  /** Turn about the vertical axis, rad/s, and a fixed tilt toward the viewer. */
  spin: number;
  tilt: number;
  /** When set, the shape sways this far either way instead of turning round. */
  sway?: number;
};

const INK: Rgb = [23, 40, 79];
const BLUE: Rgb = [91, 141, 251];
const ROSE: Rgb = [228, 52, 104];
const WARM: Rgb = [214, 160, 20];

const LOOKS: Record<StepOrbState, Look> = {
  idle: { front: INK, back: BLUE, spin: 0.7, tilt: 0.2, sway: 0.45 },
  listening: { front: BLUE, back: INK, spin: 0.35, tilt: 0.2 },
  thinking: { front: INK, back: BLUE, spin: 0.8, tilt: 0.15, sway: 0.5 },
  reasoning: { front: BLUE, back: ROSE, spin: 0.55, tilt: 0.45 },
  'tool-call': { front: INK, back: ROSE, spin: 0.6, tilt: 0.3 },
  'tool-result': { front: BLUE, back: INK, spin: 0.2, tilt: 0.5 },
  streaming: { front: ROSE, back: BLUE, spin: 0.7, tilt: 0.25 },
  'waiting-approval': { front: INK, back: WARM, spin: 0.5, tilt: 0.25 },
  error: { front: ROSE, back: ROSE, spin: 0.08, tilt: 0.3 },
  done: { front: BLUE, back: INK, spin: 0.9, tilt: 0.12, sway: 0.5 },
};

const COUNT = 480;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
// Depth bands: each frame draws one path per band, not one fill per dot.
const BANDS = 8;

// A unit Fibonacci sphere, shared by every shape that starts from one.
const SPHERE = Array.from({ length: COUNT }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / COUNT;
  const r = Math.sqrt(1 - y * y);
  return [Math.cos(i * GOLDEN) * r, y, Math.sin(i * GOLDEN) * r] as const;
});

const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/** Point m of an even n-point sphere. */
const fib = (m: number, n: number): Vec3 => {
  const y = 1 - (2 * (m + 0.5)) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return [Math.cos(m * GOLDEN) * r, y, Math.sin(m * GOLDEN) * r];
};

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

// The tick: a short stroke down, a long one up (screen y grows downward).
const TICK: [number, number][] = [
  [-0.52, -0.02],
  [-0.16, 0.36],
  [0.56, -0.44],
];
const TICK_SHORT = Math.hypot(0.36, 0.38);
const TICK_LONG = Math.hypot(0.72, 0.8);

// The hourglass: a bulb's radius at height y (0 at the neck, 0.8 at a cap).
const bulb = (y: number) => 0.07 + (0.5 * Math.min(0.8, Math.abs(y))) / 0.8;
const SAND = 150;
const STREAM = 22;
/** Where grain g rests on the pile in the lower bulb when `fill` of the sand is down. */
const pile = (g: number, fill: number, out: Float32Array) => {
  const h = 0.12 + 0.46 * fill;
  const y = 0.78 - h * Math.sqrt(hash(g * 1.7));
  const r = bulb(y) * Math.sqrt(hash(g * 2.3)) * 0.92;
  const a = hash(g * 3.9) * Math.PI * 2;
  out[0] = Math.cos(a) * r;
  out[1] = y;
  out[2] = Math.sin(a) * r;
};
const grain = new Float32Array(3);

// The thought bubble's trail: first point, count, centre x, centre y, radius.
const THOUGHTS: [number, number, number, number, number][] = [
  [300, 90, -0.4, 0.44, 0.15],
  [390, 55, -0.62, 0.68, 0.1],
  [445, 35, -0.78, 0.86, 0.065],
];

/** Point i of the state's shape at time t, in a unit box, plus its emphasis 0–1. */
function shape(state: StepOrbState, i: number, t: number, out: Float32Array) {
  const [sx, sy, sz] = SPHERE[i] ?? [0, 0, 0];
  let x = sx;
  let y = sy;
  let z = sz;
  let w = 0;
  switch (state) {
    case 'idle': {
      // A resting body, breathing, with three Zs drifting up off it.
      const zs = 90;
      if (i >= zs) {
        const [bx, by, bz] = fib(i - zs, COUNT - zs);
        const k = 1 + 0.035 * Math.sin(t * 1.3);
        x = bx * 0.6 * k - 0.12;
        y = by * 0.4 * k + 0.32;
        z = bz * 0.6 * k;
        break;
      }
      const j = Math.floor(i / 30);
      const u = (i % 30) / 30;
      const f = (t * 0.22 + j / 3) % 1;
      const grow = Math.min(1, f / 0.12) * (1 - Math.max(0, (f - 0.82) / 0.18));
      const size = (0.09 + f * 0.13) * grow;
      // Z: along the top, down the diagonal, along the bottom.
      const seg = u * 3;
      const lx = seg < 1 ? -1 + 2 * seg : seg < 2 ? 1 - 2 * (seg - 1) : -1 + 2 * (seg - 2);
      const ly = seg < 1 ? -1 : seg < 2 ? -1 + 2 * (seg - 1) : 1;
      x = 0.22 + f * 0.5 + lx * size;
      y = -0.02 - f * 0.78 + ly * size;
      z = 0;
      w = 0.5 * grow;
      break;
    }
    case 'done': {
      // A thick tick, with a ring turning round it.
      const ring = 170;
      if (i < ring) {
        const a = (i / ring) * Math.PI * 2 + t * 0.6;
        x = Math.cos(a) * 0.9;
        y = Math.sin(a) * 0.9;
        z = 0;
        w = Math.max(0, Math.sin(a * 2 - t * 3)) * 0.4;
        break;
      }
      const j = i - ring;
      const rings = 6;
      const along = Math.floor(j / rings) / Math.floor((COUNT - ring) / rings);
      const turn = ((j % rings) / rings) * Math.PI * 2;
      const at = along * (TICK_SHORT + TICK_LONG);
      const short = at < TICK_SHORT;
      const [ax, ay] = (short ? TICK[0] : TICK[1]) ?? [0, 0];
      const [cx, cy] = (short ? TICK[1] : TICK[2]) ?? [0, 0];
      const k = short ? at / TICK_SHORT : (at - TICK_SHORT) / TICK_LONG;
      const r = 0.085;
      x = ax + (cx - ax) * k + Math.cos(turn) * r * 0.7;
      y = ay + (cy - ay) * k + Math.sin(turn) * r * 0.7;
      z = Math.sin(turn) * r;
      w = Math.exp(-(((along - ((t * 0.45) % 1.5)) * 7) ** 2)) * 0.8;
      break;
    }
    case 'listening': {
      const wave = Math.sin(sy * 7 - t * 5);
      const k = 0.76 + 0.1 * wave;
      x *= k;
      y *= k;
      z *= k;
      w = Math.max(0, wave) * 0.6;
      break;
    }
    case 'thinking': {
      // A thought bubble: a lumpy cloud and three bubbles trailing off it,
      // lighting up in turn.
      const cloud = 300;
      if (i < cloud) {
        const [bx, by, bz] = fib(i, cloud);
        const lump = 1 + 0.11 * Math.sin(Math.atan2(by, bx) * 6 + t * 1.6) * Math.sqrt(1 - by * by);
        x = bx * 0.56 * lump + 0.14;
        y = by * 0.42 * lump - 0.22;
        z = bz * 0.4;
        break;
      }
      const b = i < cloud + 90 ? 0 : i < cloud + 145 ? 1 : 2;
      const [start, n, cx, cy, r] = THOUGHTS[b] ?? [cloud, 1, 0, 0, 0];
      const pulse = Math.max(0, Math.sin(t * 3 - b * 1.1));
      const [bx, by, bz] = fib(i - start, n);
      const k = r * (1 + 0.28 * pulse);
      x = cx + bx * k;
      y = cy + by * k;
      z = bz * k;
      w = pulse * 0.6;
      break;
    }
    case 'reasoning': {
      const core = 48;
      if (i < core) {
        x = sx * 0.2;
        y = sy * 0.2;
        z = sz * 0.2;
        w = 0.5;
        break;
      }
      const j = i - core;
      const per = Math.ceil((COUNT - core) / 3);
      const ring = Math.floor(j / per);
      const a = ((j % per) / per) * Math.PI * 2 + t * (ring === 1 ? -1.3 : 1.1);
      const cx = Math.cos(a) * 0.86;
      const cy = Math.sin(a) * 0.86;
      // Each ring tilted a third of a turn from the last.
      const tilt = (ring * Math.PI) / 3;
      x = cx * Math.cos(tilt);
      y = cy;
      z = cx * Math.sin(tilt);
      w = Math.max(0, Math.sin(a * 3 - t * 4)) * 0.5;
      break;
    }
    case 'tool-call': {
      const band = Math.sin(t * 1.8) * 0.8;
      const near = Math.exp(-((sy - band) ** 2) * 40);
      const k = 0.78 + 0.16 * near;
      x *= k;
      y *= k;
      z *= k;
      w = near;
      break;
    }
    case 'tool-result': {
      const bridge = Math.floor(COUNT * 0.2);
      const c: Vec3 = [Math.cos(t * 0.9) * 0.5, Math.sin(t * 0.9) * 0.14, Math.sin(t * 0.9) * 0.5];
      if (i < bridge) {
        const f = (i / bridge + t * 0.35) % 1;
        x = c[0] * (1 - 2 * f);
        y = c[1] * (1 - 2 * f) + Math.sin(f * Math.PI) * 0.08;
        z = c[2] * (1 - 2 * f);
        w = Math.sin(f * Math.PI) * 0.7;
      } else {
        const side = i % 2 ? 1 : -1;
        x = sx * 0.34 + side * c[0];
        y = sy * 0.34 + side * c[1];
        z = sz * 0.34 + side * c[2];
      }
      break;
    }
    case 'streaming': {
      const strand = i % 2;
      const f = Math.floor(i / 2) / (COUNT / 2);
      const yy = -0.95 + 1.9 * f;
      const a = yy * 5 + t * 2.2 + strand * Math.PI;
      x = Math.cos(a) * 0.44;
      y = yy;
      z = Math.sin(a) * 0.44;
      w = Math.exp(-(((f - ((t * 0.4) % 1)) * 6) ** 2));
      break;
    }
    case 'waiting-approval': {
      // An hourglass: sand runs down for six seconds, then the glass turns.
      const cycle = t % 7.2;
      const fill = Math.min(1, cycle / 6);
      const flip = cycle > 6 ? ease((cycle - 6) / 1.2) * Math.PI : 0;
      const caps = 120;
      const glass = COUNT - caps - SAND - STREAM;
      if (i < caps) {
        const a = ((i % 60) / 60) * Math.PI * 2;
        x = Math.cos(a) * 0.58;
        y = i < 60 ? -0.86 : 0.86;
        z = Math.sin(a) * 0.58;
      } else if (i < caps + glass) {
        const m = i - caps;
        const yy = -0.8 + (1.6 * (m + 0.5)) / glass;
        const a = m * GOLDEN;
        x = Math.cos(a) * bulb(yy);
        y = yy;
        z = Math.sin(a) * bulb(yy);
      } else if (i < caps + glass + SAND) {
        const g = i - caps - glass;
        if (g / SAND >= 1 - fill) {
          // Fallen: on the pile in the lower bulb.
          pile(g, fill, grain);
          x = grain[0] ?? 0;
          y = grain[1] ?? 0;
          z = grain[2] ?? 0;
        } else {
          // Still up, on the neck of the upper bulb; just after the turn it
          // first drops there from the far end, where the old pile was.
          const h = 0.08 + 0.5 * (1 - fill);
          const yy = -0.06 - h * Math.sqrt(hash(g * 5.3));
          const r = bulb(yy) * Math.sqrt(hash(g * 6.1)) * 0.92;
          const a = hash(g * 7.7) * Math.PI * 2;
          pile(g, 1, grain);
          const from = -(grain[1] ?? 0);
          x = Math.cos(a) * r;
          y = from + (yy - from) * ease(Math.min(1, cycle / 0.6));
          z = Math.sin(a) * r;
        }
        w = 0.35;
      } else {
        const g = i - caps - glass - SAND;
        const f = (g / STREAM + t * 1.6) % 1;
        const on = fill < 1 ? 1 : 0;
        x = 0;
        y = (-0.06 + f * 0.8) * on;
        z = 0;
        w = 0.5 * on;
      }
      if (flip) {
        const c = Math.cos(flip);
        const sn = Math.sin(flip);
        const fx = x * c - y * sn;
        y = x * sn + y * c;
        x = fx;
      }
      break;
    }
    case 'error': {
      // Still, with a few points knocked out of place on a stuttering clock.
      const tick = Math.floor(t * 5);
      const broken = hash(i + tick * 0.37) > 0.9 ? 1 : 0;
      x = sx * 0.8 + broken * (hash(i * 3.1 + tick) - 0.5) * 0.3;
      y = sy * 0.8 + broken * (hash(i * 7.7 + tick) - 0.5) * 0.3;
      z = sz * 0.8;
      w = broken;
      break;
    }
  }
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
}

/** The state's point, turned to face the viewer, written into `out`. */
function place(state: StepOrbState, i: number, t: number, out: Float32Array) {
  shape(state, i, t, out);
  const look = LOOKS[state];
  const a = look.sway ? Math.sin(t * look.spin) * look.sway : t * look.spin;
  const x = (out[0] ?? 0) * Math.cos(a) - (out[2] ?? 0) * Math.sin(a);
  const z = (out[0] ?? 0) * Math.sin(a) + (out[2] ?? 0) * Math.cos(a);
  const y = out[1] ?? 0;
  out[0] = x;
  out[1] = y * Math.cos(look.tilt) - z * Math.sin(look.tilt);
  out[2] = y * Math.sin(look.tilt) + z * Math.cos(look.tilt);
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mixRgb = (a: Rgb, b: Rgb, k: number): Rgb => [
  Math.round(lerp(a[0], b[0], k)),
  Math.round(lerp(a[1], b[1], k)),
  Math.round(lerp(a[2], b[2], k)),
];

export function StepOrb({ state, className }: { state: StepOrbState; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The drawing loop reads the state from here; a change starts a morph.
  const morphRef = useRef<((next: StepOrbState) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
    let from: StepOrbState = state;
    let to: StepOrbState = state;
    const mix = { value: 1, scale: 1 };
    let size = 0;
    let dpr = 1;
    let time = 0;
    let running = false;
    let onScreen = false;
    const a = new Float32Array(4);
    const b = new Float32Array(4);
    const bands = Array.from({ length: BANDS }, () => [] as number[]);

    const draw = () => {
      if (!size) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      for (const band of bands) band.length = 0;
      const k = mix.value;
      const lookA = LOOKS[from];
      const lookB = LOOKS[to];
      const half = size / 2;
      const radius = half * 0.78 * mix.scale;
      const dot = Math.max(1.1, size / 105);
      for (let i = 0; i < COUNT; i++) {
        place(to, i, time, b);
        if (k < 1) place(from, i, time, a);
        const x = k < 1 ? (a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * k : (b[0] ?? 0);
        const y = k < 1 ? (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * k : (b[1] ?? 0);
        const z = k < 1 ? (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * k : (b[2] ?? 0);
        const w = k < 1 ? (a[3] ?? 0) + ((b[3] ?? 0) - (a[3] ?? 0)) * k : (b[3] ?? 0);
        const p = 2.8 / (2.8 + z);
        const depth = Math.max(0, Math.min(BANDS - 1, Math.floor(((z + 1) / 2) * BANDS)));
        bands[depth]?.push(half + x * radius * p, half + y * radius * p, dot * p * (1 + w * 0.9));
      }
      // Back to front, so near dots sit over far ones.
      for (let band = BANDS - 1; band >= 0; band--) {
        const list = bands[band];
        if (!list?.length) continue;
        const depth = band / (BANDS - 1);
        const front = mixRgb(lookA.front, lookB.front, k);
        const back = mixRgb(lookA.back, lookB.back, k);
        const rgb = mixRgb(front, back, depth);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1 - depth * 0.5).toFixed(2)})`;
        ctx.beginPath();
        for (let j = 0; j < list.length; j += 3) {
          const px = list[j] ?? 0;
          const py = list[j + 1] ?? 0;
          const r = list[j + 2] ?? 0;
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    const tick = (_time: number, delta: number) => {
      time += Math.min(delta, 64) / 1000;
      draw();
    };
    const sync = () => {
      const run = onScreen && !document.hidden && !reduced;
      if (run === running) return;
      running = run;
      if (run) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };

    const resize = () => {
      const next = Math.round(canvas.clientWidth);
      const nextDpr = Math.min(2, window.devicePixelRatio || 1);
      if (next === size && nextDpr === dpr) return;
      size = next;
      dpr = nextDpr;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      draw();
    };

    morphRef.current = (next) => {
      if (next === to) return;
      // Morph from wherever the cloud is now: freeze the old blend as the start.
      from = mix.value < 0.5 ? from : to;
      to = next;
      gsap.killTweensOf(mix);
      if (reduced) {
        mix.value = 1;
        draw();
        return;
      }
      mix.value = 0;
      gsap.to(mix, { value: 1, duration: 1.1, ease: 'power3.inOut', onUpdate: draw });
      gsap.fromTo(
        mix,
        { scale: 0.82 },
        { scale: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)', overwrite: false },
      );
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(canvas);
    const sizer = new ResizeObserver(resize);
    sizer.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    resize();
    return () => {
      morphRef.current = null;
      observer.disconnect();
      sizer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      gsap.ticker.remove(tick);
      gsap.killTweensOf(mix);
    };
    // The state is handed over through morphRef, so the loop is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    morphRef.current?.(state);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-step-orb={state}
      className={cn('block aspect-square', className)}
    />
  );
}
