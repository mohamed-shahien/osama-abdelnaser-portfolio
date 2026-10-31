import type { CSSProperties, ReactNode } from 'react';

import type { gsap } from '@/lib/motion/gsap';

/*
 * The avatar's set for each interest: the prop it holds or stands behind,
 * where its card lands, how the card is dressed, and a short choreography.
 * Props are drawn in the avatar's own line: near-black outline, pastel fills.
 * Positions are percentages of the avatar's box; the avatar faces left with
 * its hands near 14% / 31% and its face near 30% / 22%.
 */

const K = '#1d1d1f';
const SW = 3;
const BLUE = '#a9c1f7';
const YELLOW = '#fbf5b0';
const WARM = '#f3d061';
const ROSE = '#e43468';
const PINK = '#f6c5d3';

/** Where the card sits, relative to the avatar's box. */
export type CardSpot = 'hands' | 'above' | 'left-high' | 'left-low' | 'cart' | 'sign';
/** How the card is dressed. */
export type CardLook = 'sticker' | 'polaroid' | 'bubble' | 'screen' | 'onair' | 'block';

type Stage = { spot: CardSpot; look: CardLook; tilt: number };

const stages: Record<string, Stage> = {
  photography: { spot: 'left-high', look: 'polaroid', tilt: -6 },
  voiceover: { spot: 'above', look: 'onair', tilt: 3 },
  languages: { spot: 'above', look: 'bubble', tilt: -3 },
  chess: { spot: 'left-high', look: 'sticker', tilt: 4 },
  learning: { spot: 'left-low', look: 'sticker', tilt: -4 },
  writing: { spot: 'left-low', look: 'sticker', tilt: 3 },
  reading: { spot: 'above', look: 'sticker', tilt: -2 },
  playstation: { spot: 'left-high', look: 'screen', tilt: -3 },
  strategy: { spot: 'left-high', look: 'sticker', tilt: 5 },
  ai: { spot: 'left-low', look: 'sticker', tilt: -3 },
  'e-commerce': { spot: 'cart', look: 'sticker', tilt: -5 },
  interactions: { spot: 'hands', look: 'sticker', tilt: 0 },
  coffee: { spot: 'above', look: 'sticker', tilt: 4 },
  heritage: { spot: 'left-high', look: 'sticker', tilt: -4 },
  community: { spot: 'sign', look: 'sticker', tilt: -2 },
  discipline: { spot: 'hands', look: 'block', tilt: 0 },
};
const fallback: Stage = { spot: 'hands', look: 'sticker', tilt: -3 };
export const stageOf = (id: string | undefined) => (id ? (stages[id] ?? fallback) : fallback);

/** Card position classes per spot, written out for Tailwind. */
export const spotClass: Record<CardSpot, string> = {
  // No translate utilities here: GSAP folds CSS translate into its own transform.
  hands: 'top-[12%] right-[86%]',
  above: 'right-[18%] bottom-[96%] md:right-[22%]',
  'left-high': '-top-[8%] right-[92%]',
  'left-low': 'right-[94%] bottom-[6%]',
  cart: '-top-[6%] right-[78%] md:right-[74%]',
  sign: 'right-[34%] bottom-[92%]',
};

function Svg({ viewBox, children }: { viewBox: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className="block h-auto w-full overflow-visible"
      fill="none"
      stroke={K}
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Prop({
  at,
  children,
  part = 'prop',
}: {
  at: CSSProperties;
  children: ReactNode;
  part?: string;
}) {
  return (
    <div data-stage-part={part} className="absolute origin-center" style={at}>
      {children}
    </div>
  );
}

/** The props for one interest. Absolute, inside the avatar's box. */
export function StageProps({ id }: { id: string }) {
  switch (id) {
    case 'photography':
      return (
        <Prop at={{ left: '-8%', top: '19%', width: '30%' }} part="camera">
          <Svg viewBox="0 0 64 48">
            <rect x="18" y="5" width="18" height="10" rx="2" fill="#fff" />
            <rect x="3" y="12" width="58" height="32" rx="7" fill={BLUE} />
            <rect x="46" y="16" width="9" height="6" rx="1.5" fill={YELLOW} />
            <circle cx="30" cy="28" r="11" fill="#fff" />
            <circle cx="30" cy="28" r="5.5" fill={K} />
          </Svg>
        </Prop>
      );
    case 'voiceover':
      return (
        <>
          <Prop at={{ left: '20%', top: '1%', width: '36%' }} part="headphones">
            <Svg viewBox="0 0 60 40">
              <path d="M9 30 C9 2 51 2 51 30" strokeWidth={5} />
              <rect x="2" y="22" width="13" height="16" rx="5" fill={ROSE} />
              <rect x="45" y="22" width="13" height="16" rx="5" fill={ROSE} />
            </Svg>
          </Prop>
          <Prop at={{ left: '2%', top: '14%', width: '17%' }} part="mic">
            <Svg viewBox="0 0 30 110">
              <rect x="8" y="2" width="14" height="26" rx="7" fill="#eee" />
              <path d="M8 11 H22 M8 17 H22" strokeWidth={2} />
              <path d="M4 18 C4 34 26 34 26 18" />
              <path d="M15 33 V104 M5 106 H25" />
            </Svg>
          </Prop>
          <Prop at={{ left: '-10%', top: '50%', width: '104%' }} part="desk">
            <Svg viewBox="0 0 100 52">
              <rect x="1" y="2" width="98" height="8" rx="2" fill={WARM} />
              <rect x="7" y="10" width="86" height="40" fill={YELLOW} />
              <circle data-rec cx="20" cy="24" r="4" fill={ROSE} />
              <path d="M30 24 H62 M30 33 H50" strokeWidth={2.5} />
            </Svg>
          </Prop>
        </>
      );
    case 'languages':
      return (
        <Prop at={{ left: '-4%', top: '24%', width: '16%' }} part="flag">
          <Svg viewBox="0 0 30 60">
            <path d="M4 4 V58" />
            <path d="M4 6 C12 2 18 10 27 6 V24 C18 28 12 20 4 24 Z" fill={BLUE} />
          </Svg>
        </Prop>
      );
    case 'chess':
      return (
        <>
          <Prop at={{ left: '-26%', top: '48%', width: '86%' }} part="table">
            <Svg viewBox="0 0 100 60">
              <path d="M24 2 H76 L84 12 H16 Z" fill="#fff" />
              <path d="M37 2 L35 12 M50 2 V12 M63 2 L65 12 M20 7 H80" strokeWidth={2} />
              <rect x="2" y="12" width="96" height="7" rx="2" fill={WARM} />
              <path d="M12 19 V58 M88 19 V58" />
            </Svg>
          </Prop>
          <div
            data-stage-part="knight"
            className="absolute text-[28px] leading-none text-ink md:text-[42px]"
            style={{ left: '4%', top: '34%' }}
          >
            ♞
          </div>
        </>
      );
    case 'learning':
      return (
        <Prop at={{ left: '-10%', top: '20%', width: '30%' }} part="notebook">
          <Svg viewBox="0 0 60 44">
            <path d="M30 6 C20 0 8 2 3 6 V40 C8 36 20 36 30 42 Z" fill="#fff" />
            <path d="M30 6 C40 0 52 2 57 6 V40 C52 36 40 36 30 42 Z" fill="#fff" />
            <path d="M8 14 H24 M8 21 H22 M36 14 H52 M36 21 H50" strokeWidth={2} />
            <path
              d="M38 33 L42 25 L46 33 M39.5 30 H44.5 M50 26 V32 M47 29 H53"
              stroke={ROSE}
              strokeWidth={2.5}
            />
          </Svg>
        </Prop>
      );
    case 'writing':
      return (
        <Prop at={{ left: '-12%', top: '22%', width: '34%' }} part="pencil">
          <Svg viewBox="0 0 80 24">
            <g transform="rotate(28 40 12)">
              <rect x="14" y="6" width="56" height="12" fill={WARM} />
              <rect x="66" y="6" width="10" height="12" rx="3" fill={PINK} />
              <path d="M14 6 L2 12 L14 18 Z" fill="#fff" />
              <path d="M2 12 L6 10 V14 Z" fill={K} />
            </g>
          </Svg>
        </Prop>
      );
    case 'reading':
      return (
        <Prop at={{ left: '0%', top: '11%', width: '42%' }} part="book">
          <Svg viewBox="0 0 80 52">
            <path
              d="M40 8 C28 2 12 2 3 6 V48 C12 44 28 44 40 50 C52 44 68 44 77 48 V6 C68 2 52 2 40 8 Z"
              fill={BLUE}
            />
            <path
              d="M40 8 C30 4 16 4 8 7 V44 C16 41 30 41 40 46 C50 41 64 41 72 44 V7 C64 4 50 4 40 8 Z"
              fill="#fff"
            />
            <path
              d="M40 8 V46 M14 16 H32 M14 23 H30 M48 16 H66 M48 23 H64 M14 30 H28"
              strokeWidth={2}
            />
          </Svg>
        </Prop>
      );
    case 'playstation':
      return (
        <Prop at={{ left: '-10%', top: '24%', width: '30%' }} part="pad">
          <Svg viewBox="0 0 70 40">
            <path
              d="M14 6 H56 C64 6 68 14 68 24 C68 34 62 38 56 34 L48 26 H22 L14 34 C8 38 2 34 2 24 C2 14 6 6 14 6 Z"
              fill="#fff"
            />
            <path d="M14 14 V24 M9 19 H19" strokeWidth={2.5} />
            <circle cx="54" cy="13" r="2.6" fill="#5b8dfb" stroke="none" />
            <circle cx="60" cy="19" r="2.6" fill={ROSE} stroke="none" />
            <circle cx="48" cy="19" r="2.6" fill={WARM} stroke="none" />
            <circle cx="54" cy="25" r="2.6" fill="#38b26b" stroke="none" />
          </Svg>
        </Prop>
      );
    case 'strategy':
      return (
        <Prop at={{ left: '-34%', top: '-2%', width: '50%' }} part="pointer">
          <Svg viewBox="0 0 100 70">
            <path d="M96 66 L12 10" strokeWidth={3.5} />
            <circle cx="10" cy="9" r="5" fill={ROSE} />
          </Svg>
        </Prop>
      );
    case 'ai':
      return (
        <Prop at={{ left: '-20%', top: '6%', width: '24%' }} part="robot">
          <Svg viewBox="0 0 50 60">
            <path d="M25 14 V6" />
            <circle cx="25" cy="5" r="3.5" fill={ROSE} />
            <rect x="5" y="14" width="40" height="32" rx="11" fill="#fff" />
            <g data-eyes>
              <circle cx="18" cy="29" r="3.5" fill={K} stroke="none" />
              <circle cx="32" cy="29" r="3.5" fill={K} stroke="none" />
            </g>
            <path d="M19 38 C22 41 28 41 31 38" strokeWidth={2.5} />
            <path d="M14 52 C20 58 30 58 36 52" stroke={BLUE} strokeWidth={4} />
          </Svg>
        </Prop>
      );
    case 'e-commerce':
      return (
        <Prop at={{ left: '-44%', top: '26%', width: '60%' }} part="cart">
          <Svg viewBox="0 0 100 70">
            <path d="M98 4 H86 L76 44 H22" />
            <path d="M80 14 H10 L18 40 H74 Z" fill={BLUE} />
            <path d="M28 14 L32 40 M46 14 V40 M62 14 L60 40 M14 27 H77" strokeWidth={2} />
            <circle cx="30" cy="56" r="7" fill="#fff" />
            <circle cx="68" cy="56" r="7" fill="#fff" />
          </Svg>
        </Prop>
      );
    case 'interactions':
      return (
        <Prop at={{ left: '-6%', top: '20%', width: '20%' }} part="cursor">
          <Svg viewBox="0 0 40 50">
            <path d="M4 3 L4 40 L14 31 L21 46 L28 43 L21 28 L35 28 Z" fill="#fff" />
          </Svg>
        </Prop>
      );
    case 'coffee':
      return (
        <Prop at={{ left: '-4%', top: '25%', width: '20%' }} part="mug">
          <Svg viewBox="0 0 44 40">
            <path d="M32 12 C42 12 42 28 31 28" strokeWidth={3.5} />
            <path d="M4 6 H34 V30 C34 36 30 38 24 38 H14 C8 38 4 36 4 30 Z" fill="#fff" />
            <path d="M4 16 H34 V24 H4 Z" fill={ROSE} />
          </Svg>
        </Prop>
      );
    case 'heritage':
      return (
        <Prop at={{ left: '-2%', top: '27%', width: '18%' }} part="lantern">
          <Svg viewBox="0 0 36 70">
            <path d="M18 2 V10" />
            <path d="M8 18 L18 10 L28 18 Z" fill={WARM} />
            <path d="M8 18 H28 L32 30 L26 52 H10 L4 30 Z" fill={YELLOW} />
            <path d="M18 18 V52 M6 30 H30" strokeWidth={2} />
            <path d="M10 52 H26 L22 60 H14 Z" fill={WARM} />
            <path d="M18 60 V68" />
          </Svg>
        </Prop>
      );
    case 'community':
      return (
        <Prop at={{ left: '8%', top: '-22%', width: '6%' }} part="stick">
          <Svg viewBox="0 0 10 100">
            <path d="M5 2 V98" strokeWidth={4} />
          </Svg>
        </Prop>
      );
    default:
      return null;
  }
}

type Select = (selector: string) => Element[];

/**
 * The interest's own choreography, added to the shared timeline after the
 * card lands. Everything is finite; the actor is the avatar's moving box.
 */
export function playStage(
  tl: gsap.core.Timeline,
  q: Select,
  id: string,
  actor: HTMLElement,
  push: { v: number },
  seek: () => void,
) {
  const parts = q('[data-stage-part]');
  if (parts.length) {
    tl.fromTo(
      parts,
      { scale: 0.4, opacity: 0, rotate: -14 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.07 },
      0,
    );
  }
  const walk = (amount: number, duration: number) =>
    tl
      .to(push, { v: push.v + amount, duration, ease: 'sine.inOut', onUpdate: seek }, 0)
      .fromTo(actor, { x: 34 }, { x: 0, duration, ease: 'sine.inOut', immediateRender: false }, 0);
  const sway = (deg: number, repeat: number, at = 0.5) =>
    tl
      .to(actor, { rotate: deg, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat }, at)
      .set(actor, { rotate: 0 });
  const bob = (y: number, repeat: number, at = 0.4, duration = 0.32) =>
    tl.to(actor, { y, duration, ease: 'sine.inOut', yoyo: true, repeat }, at).set(actor, { y: 0 });

  switch (id) {
    case 'photography': {
      // Aim, a recoil at the shutter, and the print slides out of the camera.
      tl.to(actor, { rotate: -4, duration: 0.5, ease: 'sine.inOut' }, 0)
        .to(q('[data-stage-part="camera"]'), { x: 5, duration: 0.08, yoyo: true, repeat: 1 }, 0.62)
        .to(actor, { rotate: 0, duration: 0.7, ease: 'sine.inOut' }, 0.9);
      break;
    }
    case 'voiceover':
      bob(-4, 7, 0.4, 0.22);
      tl.fromTo(
        q('[data-rec]'),
        { opacity: 1 },
        { opacity: 0.15, duration: 0.4, yoyo: true, repeat: 5 },
        0.3,
      );
      break;
    case 'languages':
      sway(-4, 5);
      tl.fromTo(
        q('[data-stage-part="flag"]'),
        { rotate: -12 },
        { rotate: 12, duration: 0.4, yoyo: true, repeat: 5, ease: 'sine.inOut' },
        0.4,
      );
      break;
    case 'chess': {
      tl.to(actor, { rotate: -5, duration: 0.6, ease: 'sine.inOut' }, 0);
      const knight = q('[data-stage-part="knight"]');
      tl.to(knight, { y: -26, duration: 0.3, ease: 'power2.out' }, 0.8)
        .to(knight, { x: -38, duration: 0.45, ease: 'sine.inOut' }, 0.95)
        .to(knight, { y: 0, duration: 0.3, ease: 'bounce.out' }, 1.3)
        .to(actor, { rotate: 0, duration: 0.6, ease: 'sine.inOut' }, 1.5);
      break;
    }
    case 'learning':
      sway(3, 3, 0.4);
      break;
    case 'writing':
      tl.to(
        q('[data-stage-part="pencil"]'),
        { rotate: 10, x: -6, duration: 0.18, yoyo: true, repeat: 9, ease: 'sine.inOut' },
        0.35,
      ).fromTo(
        q('[data-scribble]'),
        { strokeDashoffset: 240 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'none' },
        0.35,
      );
      break;
    case 'reading':
      sway(2, 3, 0.5);
      tl.fromTo(
        q('[data-stage-part="book"]'),
        { y: 0 },
        { y: -4, duration: 0.9, yoyo: true, repeat: 1 },
        0.5,
      );
      break;
    case 'playstation':
      bob(-12, 5, 0.4, 0.2);
      tl.to(
        q('[data-stage-part="pad"]'),
        { rotate: 8, duration: 0.1, yoyo: true, repeat: 11 },
        0.4,
      );
      break;
    case 'strategy':
      tl.fromTo(
        q('[data-stage-part="pointer"]'),
        { rotate: 6 },
        { rotate: -6, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' },
        0.4,
      ).fromTo(
        q('[data-plan]'),
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' },
        0.5,
      );
      break;
    case 'ai':
      tl.to(
        q('[data-stage-part="robot"]'),
        { y: -10, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' },
        0.3,
      ).to(
        q('[data-eyes]'),
        { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: 3 },
        0.9,
      );
      break;
    case 'e-commerce':
      walk(0.9, 1.6);
      break;
    case 'interactions':
      tl.to(
        q('[data-stage-part="cursor"]'),
        { scale: 0.82, duration: 0.12, yoyo: true, repeat: 3 },
        0.55,
      )
        .to(q('[data-interest-card]'), { scale: 0.94, duration: 0.12, yoyo: true, repeat: 3 }, 0.55)
        .fromTo(
          q('[data-ripple]'),
          { scale: 0.3, opacity: 0.9 },
          { scale: 1.8, opacity: 0, duration: 0.7, stagger: 0.25 },
          0.55,
        );
      break;
    case 'coffee':
      // A sip: the mug rises to the face and back down.
      tl.to(
        q('[data-stage-part="mug"]'),
        { x: 16, y: -22, rotate: 24, duration: 0.6, ease: 'sine.inOut' },
        0.6,
      )
        .to(actor, { rotate: 4, duration: 0.6, ease: 'sine.inOut' }, 0.6)
        .to(
          q('[data-stage-part="mug"]'),
          { x: 0, y: 0, rotate: 0, duration: 0.6, ease: 'sine.inOut' },
          1.6,
        )
        .to(actor, { rotate: 0, duration: 0.6, ease: 'sine.inOut' }, 1.6);
      break;
    case 'heritage':
      tl.fromTo(
        q('[data-stage-part="lantern"]'),
        { rotate: -14, transformOrigin: '50% 0%' },
        { rotate: 14, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' },
        0.3,
      );
      break;
    case 'community':
      bob(-10, 5, 0.4, 0.25);
      break;
    case 'discipline':
      walk(1.4, 2.2);
      break;
  }
}

/**
 * The drawn poses in `public/interests/poses`: trimmed to the figure and all
 * scaled alike, so `h / POSE_TALL` keeps the avatar one size across poses.
 * `card` is where the card sits beside the figure; `fx` is the point (as a
 * fraction of the drawing) that the act's effect comes from: the flash, the
 * mic, the mouth, the cup.
 */
export type Pose = {
  w: number;
  h: number;
  card: 'left-top' | 'left-mid' | 'left-low' | 'above';
  fx?: readonly [number, number];
};
export const POSE_TALL = 860;
export const poses: Record<string, Pose> = {
  photography: { w: 592, h: 738, card: 'left-top', fx: [0.08, 0.17] },
  voiceover: { w: 534, h: 815, card: 'left-mid', fx: [0.31, 0.17] },
  languages: { w: 441, h: 821, card: 'left-low', fx: [0.3, 0.06] },
  chess: { w: 619, h: 788, card: 'above' },
  learning: { w: 512, h: 817, card: 'left-mid' },
  writing: { w: 588, h: 709, card: 'above' },
  reading: { w: 336, h: 827, card: 'left-top' },
  playstation: { w: 755, h: 780, card: 'above' },
  strategy: { w: 701, h: 828, card: 'above' },
  ai: { w: 591, h: 805, card: 'left-low' },
  'e-commerce': { w: 726, h: 814, card: 'above' },
  interactions: { w: 661, h: 803, card: 'left-low' },
  coffee: { w: 325, h: 810, card: 'left-low', fx: [0.16, 0.2] },
  heritage: { w: 554, h: 839, card: 'left-low' },
  community: { w: 645, h: 860, card: 'left-low' },
  discipline: { w: 562, h: 844, card: 'above' },
};
export const poseSrc = (id: string) => `/interests/poses/${id}.webp`;
// Cards sit beside the drawing (--pw is its width) or above it (--ph, its height).
// On short screens there is no room above, so those move beside it, top left.
export const poseCardClass: Record<Pose['card'], string> = {
  'left-top': 'right-[calc(var(--pw)+16px)] -top-[4%]',
  'left-mid': 'right-[calc(var(--pw)+16px)] top-[24%]',
  'left-low': 'right-[calc(var(--pw)+16px)] bottom-[4%]',
  above:
    'right-0 bottom-[calc(var(--ph)+18px)] ' +
    'max-md:[@media(max-height:740px)]:right-[calc(var(--pw)+16px)] max-md:[@media(max-height:740px)]:bottom-auto max-md:[@media(max-height:740px)]:-top-[4%] ' +
    'md:[@media(max-height:860px)]:right-[calc(var(--pw)+16px)] md:[@media(max-height:860px)]:bottom-auto md:[@media(max-height:860px)]:-top-[4%]',
};
/** The card's tail: toward the drawing, below the card when it sits above. */
export const poseTailClass: Record<'side' | 'above', string> = {
  side: 'top-1/2 -right-[9px] -translate-y-1/2 border-t-[2.5px] border-r-[2.5px]',
  above:
    'right-[28%] -bottom-[9px] border-r-[2.5px] border-b-[2.5px] ' +
    'max-md:[@media(max-height:740px)]:top-1/2 max-md:[@media(max-height:740px)]:right-[-9px] max-md:[@media(max-height:740px)]:bottom-auto max-md:[@media(max-height:740px)]:-translate-y-1/2 max-md:[@media(max-height:740px)]:border-b-0 max-md:[@media(max-height:740px)]:border-t-[2.5px] ' +
    'md:[@media(max-height:860px)]:top-1/2 md:[@media(max-height:860px)]:right-[-9px] md:[@media(max-height:860px)]:bottom-auto md:[@media(max-height:860px)]:-translate-y-1/2 md:[@media(max-height:860px)]:border-b-0 md:[@media(max-height:860px)]:border-t-[2.5px]',
};

/**
 * A drawn pose acting its interest out: the figure (anchored at its feet)
 * sways, hops or leans, and the card's own pieces play. Everything is finite.
 */
export function playPose(tl: gsap.core.Timeline, q: Select, id: string, figure: Element) {
  tl.fromTo(
    figure,
    { opacity: 0, y: 26, scale: 0.86, rotate: -5 },
    { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(1.8)' },
    0,
  ).to(figure, { scaleY: 0.95, scaleX: 1.03, duration: 0.12, yoyo: true, repeat: 1 }, 0.62);
  const sway = (deg: number, repeat: number, at = 0.9) =>
    tl
      .to(figure, { rotate: deg, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat }, at)
      .set(figure, { rotate: 0 });
  const hop = (y: number, repeat: number, at = 0.9, duration = 0.26) =>
    tl
      .to(figure, { y, duration, ease: 'power1.out', yoyo: true, repeat }, at)
      .set(figure, { y: 0 });

  switch (id) {
    case 'photography':
      // Aim, then the shutter's kick.
      tl.to(figure, { rotate: -3, duration: 0.3, ease: 'sine.inOut' }, 0.3)
        .to(figure, { x: 6, duration: 0.07, yoyo: true, repeat: 1 }, 0.4)
        .to(figure, { rotate: 0, duration: 0.6, ease: 'sine.inOut' }, 0.9);
      break;
    case 'voiceover':
      hop(-3, 7, 0.8, 0.2);
      tl.fromTo(
        q('[data-rec]'),
        { opacity: 1 },
        { opacity: 0.15, duration: 0.4, yoyo: true, repeat: 5 },
        0.3,
      );
      break;
    case 'languages':
    case 'heritage':
      sway(-3, 3);
      break;
    case 'reading':
    case 'coffee':
      sway(2, 3);
      break;
    case 'chess':
      tl.to(figure, { rotate: -2, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.8);
      break;
    case 'learning':
      hop(-14, 3, 0.8, 0.22);
      break;
    case 'ai':
      hop(-22, 3, 0.8, 0.28);
      break;
    case 'writing':
      hop(-2, 9, 0.6, 0.16);
      tl.fromTo(
        q('[data-scribble]'),
        { strokeDashoffset: 240 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'none' },
        0.6,
      );
      break;
    case 'playstation':
    case 'community':
      hop(-8, 5, 0.8, 0.2);
      break;
    case 'strategy':
      tl.to(
        figure,
        { rotate: 2, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        0.7,
      ).fromTo(
        q('[data-plan]'),
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' },
        0.6,
      );
      break;
    case 'e-commerce':
      // Rolls the cart in.
      tl.fromTo(
        figure,
        { x: 60 },
        { x: 0, duration: 1.4, ease: 'power2.out', immediateRender: false },
        0,
      );
      hop(-4, 5, 0.1, 0.14);
      break;
    case 'interactions':
      tl.to(figure, { rotate: -3, duration: 0.2, yoyo: true, repeat: 1 }, 0.55)
        .to(q('[data-interest-card]'), { scale: 0.94, duration: 0.12, yoyo: true, repeat: 3 }, 0.55)
        .fromTo(
          q('[data-ripple]'),
          { scale: 0.3, opacity: 0.9 },
          { scale: 1.8, opacity: 0, duration: 0.7, stagger: 0.25 },
          0.55,
        );
      break;
    case 'discipline':
      // Reps.
      tl.to(
        figure,
        { scaleY: 0.96, scaleX: 1.02, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 7 },
        0.8,
      ).set(figure, { scaleX: 1, scaleY: 1 });
      break;
  }
}
