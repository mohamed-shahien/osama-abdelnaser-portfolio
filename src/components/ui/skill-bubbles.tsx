'use client';

import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

import type { Skill, SkillShape, SkillSize, SkillTone } from '@/content/skills';
import { gsap } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';

// Skill bubbles — adapted from the supplied Marketing Badges: the same hover
// and press response and inner highlight, recast as glassy bubbles. They rain
// down across the whole stage, one after another, and settle on its floor,
// keeping a halo of clear space round the title and the glasses. The fall is
// a paused timeline the parent scrubs, so it plays forward and back with
// scroll. Once landed, any bubble can be dragged; let go, it springs home.

/** Scrubbed by the parent with `set` (0 above the stage, 1 landed); the bubbles listen. */
export class BubbleDriver {
  progress = 0;
  private listener: ((progress: number) => void) | undefined;
  set(progress: number) {
    if (progress === this.progress) return;
    this.progress = progress;
    this.listener?.(progress);
  }
  listen(listener: (progress: number) => void) {
    this.listener = listener;
    return () => {
      if (this.listener === listener) this.listener = undefined;
    };
  }
}

/** A box the heap keeps clear of, in px from the bubbles' top-left corner. */
export type BubbleKeepOut = { left: number; top: number; right: number; bottom: number };

const tones: Record<SkillTone, string> = {
  blue: 'bg-[radial-gradient(120%_120%_at_30%_20%,rgba(91,141,251,0.34),rgba(91,141,251,0.07))] text-[#c9d8ff] [--bubble-rim:rgba(91,141,251,0.55)]',
  yellow:
    'bg-[radial-gradient(120%_120%_at_30%_20%,rgba(248,250,85,0.26),rgba(248,250,85,0.05))] text-[#f8fa55] [--bubble-rim:rgba(248,250,85,0.45)]',
  warm: 'bg-[radial-gradient(120%_120%_at_30%_20%,rgba(243,208,97,0.28),rgba(243,208,97,0.05))] text-[#f6dd92] [--bubble-rim:rgba(243,208,97,0.45)]',
  rose: 'bg-[radial-gradient(120%_120%_at_30%_20%,rgba(228,52,104,0.34),rgba(228,52,104,0.07))] text-[#ffb0c7] [--bubble-rim:rgba(228,52,104,0.55)]',
  white:
    'bg-[radial-gradient(120%_120%_at_30%_20%,rgba(255,255,255,0.2),rgba(255,255,255,0.04))] text-white/90 [--bubble-rim:rgba(255,255,255,0.35)]',
};

const shapes: Record<SkillShape, string> = {
  pill: 'rounded-full',
  soft: 'rounded-[22px]',
  circle: 'grid aspect-square place-items-center rounded-full text-center whitespace-normal',
};

const sizeClasses: Record<SkillSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs md:px-5 md:py-2.5 md:text-[15px]',
  md: 'px-4 py-2 text-sm md:px-6 md:py-3 md:text-base',
};
const circleSize = 'size-[72px] p-2 text-xs leading-tight md:size-[96px] md:text-[15px]';

// Clear space kept round the title and the glasses, and the heap's overlap.
const HALO = 22;
const OVERLAP = 0.94;

function random(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rest = { x: number; y: number; r: number; order: number };
type Box = { x: number; y: number; w: number; h: number };

/**
 * Where every bubble comes to rest. Each one, in a seeded order, drops at
 * the column across the stage where it lands lowest: on the floor, or on
 * the bubbles already there. Over the glasses they can only rest on its
 * halo, and a landing that would reach into the title's halo is refused while any lower
 * one is left, so the heap fills the floor first and keeps clear of both.
 */
function heap(
  sizes: { w: number; h: number }[],
  width: number,
  floor: number,
  keepOut: BubbleKeepOut[],
  seed: number,
) {
  const rand = random(seed);
  const order = sizes.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j] ?? 0, order[i] ?? 0];
  }
  // A keep-out that reaches the floor is a pillar: bubbles land on its halo,
  // never on what it keeps out; the side columns are lower, so they fill first.
  const pillars = keepOut.filter((k) => k.bottom >= floor - HALO * 2);
  const ceilings = keepOut.filter((k) => k.bottom < floor - HALO * 2);
  const placed: Box[] = [];
  const rest: Rest[] = sizes.map(() => ({ x: 0, y: 0, r: 0, order: 0 }));
  const margin = 10;
  const step = 6;
  order.forEach((index, landed) => {
    const { w, h } = sizes[index] ?? { w: 0, h: 0 };
    let best: { x: number; y: number; score: number } | undefined;
    for (let x = margin; x <= width - w - margin; x += step) {
      // The highest top under this column: the floor, a halo or a bubble's overlapped top.
      let top = floor;
      for (const k of pillars)
        if (x < k.right + HALO && x + w > k.left - HALO) top = Math.min(top, k.top - HALO);
      for (const box of placed) {
        const inset = box.w * (1 - OVERLAP) * 0.5;
        if (x < box.x + box.w - inset && x + w > box.x + inset)
          top = Math.min(top, box.y + box.h * (1 - OVERLAP));
      }
      const y = top - h;
      const clash = ceilings.some(
        (k) =>
          x < k.right + HALO &&
          x + w > k.left - HALO &&
          y < k.bottom + HALO &&
          y + h > k.top - HALO,
      );
      // Lowest wins; a little noise keeps equal columns from lining up.
      const score = y - (clash ? 100000 : 0) + rand() * 10;
      if (!best || score > best.score) best = { x, y, score };
    }
    const spot = best ?? { x: (width - w) / 2, y: floor - h };
    placed.push({ x: spot.x, y: spot.y, w, h });
    rest[index] = { x: spot.x, y: spot.y, r: (rand() - 0.5) * 14, order: landed };
  });
  return rest;
}

export function SkillBubbles({
  skills,
  driver,
  keepOut,
  label = 'Skills',
  seed = 7,
  className,
}: {
  skills: readonly Skill[];
  driver: BubbleDriver;
  /** Boxes to keep clear of, measured from the bubbles' own box. */
  keepOut: (root: HTMLElement) => BubbleKeepOut[];
  label?: string;
  seed?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<{ el: HTMLElement; dx: number; dy: number; moved: boolean } | null>(null);
  const draggedRef = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-bubble]'));
    let timeline: gsap.core.Timeline | undefined;
    let shown = -1;
    const build = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (!width || !height) return;
      const sizes = items.map((item) => ({ w: item.offsetWidth, h: item.offsetHeight }));
      const floor = height - Math.min(28, Math.max(10, height * 0.02));
      const rest = heap(sizes, width, floor, keepOut(root), seed);
      const rand = random(seed + 1);
      timeline?.kill();
      timeline = gsap.timeline({ paused: true });
      const count = items.length;
      items.forEach((item, index) => {
        const to = rest[index] ?? { x: 0, y: 0, r: 0, order: 0 };
        const size = sizes[index] ?? { w: 0, h: 0 };
        // Out of sight above the stage, over its own column, drifting a little.
        const from = {
          x: to.x + (rand() - 0.5) * Math.min(160, width * 0.2),
          y: -size.h - 30 - rand() * height * 0.4,
          rotation: to.r + (rand() - 0.5) * 120,
        };
        const at = (to.order / count) * 0.72;
        timeline
          ?.fromTo(
            item,
            { x: from.x },
            { x: to.x, duration: 0.28, ease: 'sine.out', immediateRender: true },
            at,
          )
          .fromTo(
            item,
            { y: from.y },
            { y: to.y, duration: 0.28, ease: 'bounce.out', immediateRender: true },
            at,
          )
          .fromTo(
            item,
            { rotation: from.rotation },
            { rotation: to.r, duration: 0.28, ease: 'power3.out', immediateRender: true },
            at,
          );
      });
      timeline.progress(driver.progress);
      shown = driver.progress;
    };
    const land = (progress: number) => {
      const landed = progress >= 0.999;
      if (root.dataset.landed !== String(landed)) root.dataset.landed = String(landed);
    };
    build();
    land(driver.progress);
    const stop = driver.listen((progress) => {
      if (progress === shown) return;
      shown = progress;
      timeline?.progress(progress);
      land(progress);
    });
    const resize = new ResizeObserver(build);
    resize.observe(root);
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) build();
    });
    const drags = Array.from(root.querySelectorAll<HTMLElement>('[data-bubble-drag]'));
    return () => {
      alive = false;
      resize.disconnect();
      timeline?.kill();
      stop();
      gsap.killTweensOf(drags);
      gsap.set([...items, ...drags], { clearProps: 'transform' });
    };
  }, [skills, driver, keepOut, seed]);

  const toggle = (id: string) => setClickedId(clickedId === id ? null : id);

  const grab = (event: PointerEvent<HTMLElement>, id: string) => {
    if (rootRef.current?.dataset.landed !== 'true' || event.button !== 0) return;
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    gsap.killTweensOf(el);
    const x = Number(gsap.getProperty(el, 'x')) || 0;
    const y = Number(gsap.getProperty(el, 'y')) || 0;
    dragRef.current = { el, dx: event.clientX - x, dy: event.clientY - y, moved: false };
    setHoveredId(id);
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.el !== event.currentTarget) return;
    const x = event.clientX - drag.dx;
    const y = event.clientY - drag.dy;
    if (!drag.moved && Math.hypot(x, y) < 5) return;
    drag.moved = true;
    gsap.set(drag.el, { x, y });
  };
  const release = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.el !== event.currentTarget) return;
    dragRef.current = null;
    if (event.type === 'pointercancel') setHoveredId(null);
    if (!drag.moved) return;
    // A drag is not a press: swallow the click that follows it.
    draggedRef.current = true;
    gsap.to(drag.el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
  };

  return (
    <ul
      ref={rootRef}
      aria-label={label}
      data-landed="false"
      className={cn('group/bubbles absolute inset-0', className)}
    >
      {skills.map((skill, index) => {
        const id = skill.label;
        const isHovered = hoveredId === id;
        const isClicked = clickedId === id;
        const isOtherHovered = hoveredId !== null && hoveredId !== id;
        const circle = skill.shape === 'circle';
        return (
          <li
            key={id}
            data-bubble
            className="absolute start-0 top-0 will-change-transform"
            style={{ zIndex: isHovered || isClicked ? 100 : index + 1 }}
          >
            <div
              data-bubble-drag
              className="pointer-events-none cursor-grab touch-none group-data-[landed=true]/bubbles:pointer-events-auto active:cursor-grabbing"
              onPointerDown={(event) => grab(event, id)}
              onPointerMove={move}
              onPointerUp={release}
              onPointerCancel={release}
            >
              <button
                type="button"
                aria-pressed={isClicked}
                className={cn(
                  'relative block font-medium tracking-[-0.01em] whitespace-nowrap select-none',
                  'shadow-[inset_0_0_0_1px_var(--bubble-rim),0_10px_24px_-14px_rgba(0,0,0,0.9)] transition-[transform,box-shadow] duration-500 ease-out',
                  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
                  tones[skill.tone],
                  shapes[skill.shape],
                  circle ? circleSize : sizeClasses[skill.size],
                )}
                style={{
                  transform: `
                    scale(${isClicked ? 1.12 : isHovered ? 1.06 : isOtherHovered ? 0.97 : 1})
                    translateY(${isHovered ? -6 : 0}px)
                  `,
                }}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => {
                  if (draggedRef.current) {
                    draggedRef.current = false;
                    return;
                  }
                  toggle(id);
                }}
              >
                <span className="relative block">{skill.label}</span>
                {/* Inner highlight effect: the bubble's sheen. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-0 opacity-60',
                    shapes[skill.shape],
                  )}
                  style={{
                    background:
                      'radial-gradient(40% 30% at 28% 22%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
