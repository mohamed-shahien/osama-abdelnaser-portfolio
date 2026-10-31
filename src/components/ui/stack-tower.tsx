'use client';

/**
 * Supplied Stack Tower, ported from framer-motion to the site's GSAP ticker so
 * it needs no new dependency. Same motion: every row runs one cosine cycle,
 * squashing, sliding and skewing a little behind the row above, with its color
 * following the squash; a hovered row eases up in scale toward the accent.
 * Additions for the site: the words come from props, rows are buttons that
 * report hover, focus and clicks, the rows rise in when `entered` turns on,
 * and the ticker stops off screen, in hidden tabs and under reduced motion.
 */

import { useEffect, useRef } from 'react';

import { motionConfig } from '@/lib/motion/config';
import { gsap } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';

// tune: raise to slow the tower cycle
const SECONDS_PER_CYCLE = 5;
// tune: raise to increase horizontal row travel
const AMPLITUDE_PX = 22;
// tune: raise to enlarge the hovered row further
const HOVER_SCALE_BOOST = 0.1;
const HOVER_EASE_RATE = 10;
const ROW_OFFSET = 0.35;

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 0xff;
  const ag = (pa >> 8) & 0xff;
  const ab = pa & 0xff;
  const br = (pb >> 16) & 0xff;
  const bg = (pb >> 8) & 0xff;
  const bb = pb & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

export type StackTowerProps = {
  words: readonly string[];
  /** A pinned row that stays raised, e.g. the selected one. */
  active?: number | null;
  /** Rows stay hidden until this turns on, then rise in one after another. */
  entered?: boolean;
  fg?: string;
  dim?: string;
  accent?: string;
  label?: string;
  className?: string;
  wordClassName?: string;
  onHover?: (index: number | null) => void;
  onSelect?: (index: number) => void;
};

export function StackTower({
  words,
  active = null,
  entered = true,
  fg = '#17284f',
  dim = '#c7cfe2',
  accent = '#e43468',
  label,
  className,
  wordClassName,
  onHover,
  onSelect,
}: StackTowerProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(active);
  const callbacks = useRef({ onHover, onSelect });
  const introRef = useRef<{ v: number }[]>([]);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    activeRef.current = active;
    wakeRef.current();
  }, [active]);
  useEffect(() => {
    callbacks.current = { onHover, onSelect };
  }, [onHover, onSelect]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('[data-tower-word]')];
    const count = rows.length;
    const phases = rows.map(() => 0);
    const eased = rows.map(() => 0);
    const intro = rows.map(() => ({ v: entered ? 1 : 0 }));
    introRef.current = intro;
    const still = window.matchMedia(motionConfig.queries.reduced);
    let hovered: number | null = null;
    let onScreen = false;
    let running = false;

    const paint = () => {
      for (let i = 0; i < count; i++) {
        const row = rows[i];
        if (!row) continue;
        const local = (phases[i] ?? 0) * Math.PI * 2 + i * ROW_OFFSET;
        const h = eased[i] ?? 0;
        const e = intro[i]?.v ?? 1;
        const scaleX = 0.55 + 0.45 * Math.cos(local);
        const shiftX = Math.sin(local) * AMPLITUDE_PX;
        const skewX = Math.sin(local) * 6;
        const boost = 1 + h * HOVER_SCALE_BOOST;
        row.style.transform = `translate3d(${shiftX.toFixed(2)}px,${((1 - e) * 0.9).toFixed(3)}em,0) skewX(${skewX.toFixed(2)}deg) scale(${(Math.max(0.08, scaleX) * boost).toFixed(4)}, ${(boost * (0.35 + 0.65 * e)).toFixed(4)})`;
        const base = mix(dim, fg, (Math.cos(local) + 1) / 2);
        row.style.color = h < 0.002 ? base : mix(base, accent, h);
        row.style.opacity = e >= 1 ? '' : e.toFixed(3);
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(0.05, deltaMs / 1000);
      const alpha = 1 - Math.exp(-HOVER_EASE_RATE * dt);
      const pinned = activeRef.current;
      for (let i = 0; i < count; i++) {
        phases[i] = (phases[i] ?? 0) + dt / SECONDS_PER_CYCLE;
        const target = i === hovered || i === pinned ? 1 : 0;
        const cur = eased[i] ?? 0;
        eased[i] = cur + (target - cur) * alpha;
      }
      paint();
    };

    const settle = () => {
      // Reduced motion: the rows hold their spread pose and change color only.
      const pinned = activeRef.current;
      for (let i = 0; i < count; i++) {
        phases[i] = 0.2 + i * 0.03;
        eased[i] = i === hovered || i === pinned ? 1 : 0;
      }
      paint();
    };

    const sync = () => {
      const run = onScreen && !document.hidden && !still.matches;
      if (run === running) return;
      running = run;
      if (run) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    const wake = () => {
      if (still.matches) settle();
      sync();
    };
    wakeRef.current = wake;

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    still.addEventListener('change', wake);

    const enter = (index: number) => {
      hovered = index;
      callbacks.current.onHover?.(index);
      wake();
    };
    const leave = (index: number) => {
      if (hovered !== index) return;
      hovered = null;
      callbacks.current.onHover?.(null);
      wake();
    };
    const cleanups = rows.map((row, index) => {
      const button = row.closest('button');
      if (!button) return () => {};
      const on = () => enter(index);
      const off = () => leave(index);
      const click = () => callbacks.current.onSelect?.(index);
      button.addEventListener('pointerenter', on);
      button.addEventListener('pointerleave', off);
      button.addEventListener('focus', on);
      button.addEventListener('blur', off);
      button.addEventListener('click', click);
      return () => {
        button.removeEventListener('pointerenter', on);
        button.removeEventListener('pointerleave', off);
        button.removeEventListener('focus', on);
        button.removeEventListener('blur', off);
        button.removeEventListener('click', click);
      };
    });

    if (still.matches) settle();
    else paint();
    return () => {
      wakeRef.current = () => {};
      gsap.ticker.remove(tick);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      still.removeEventListener('change', wake);
      cleanups.forEach((cleanup) => cleanup());
      gsap.killTweensOf(intro);
      rows.forEach((row) => {
        row.style.removeProperty('transform');
        row.style.removeProperty('color');
        row.style.removeProperty('opacity');
      });
    };
    // `entered` only seeds the first pose; the effect below animates changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, fg, dim, accent]);

  useEffect(() => {
    const intro = introRef.current;
    if (!entered || !intro.length || intro.every((row) => row.v >= 1)) return;
    const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
    const tween = gsap.to(intro, {
      v: 1,
      duration: reduced ? 0 : 1.3,
      ease: 'power3.out',
      stagger: reduced ? 0 : 0.07,
      onUpdate: () => wakeRef.current(),
    });
    return () => {
      tween.kill();
    };
  }, [entered]);

  return (
    <ul
      ref={rootRef}
      aria-label={label}
      className={cn('flex w-full flex-col items-center leading-[0.92]', className)}
    >
      {words.map((word, index) => (
        <li key={word} className="flex w-full justify-center">
          <button
            type="button"
            aria-pressed={active === index}
            className="flex w-full cursor-pointer touch-pan-y justify-center rounded-md outline-offset-4 select-none focus-visible:outline-2 focus-visible:outline-current"
          >
            <span
              data-tower-word
              className={cn(
                'block text-center leading-[0.92] tracking-[-0.03em] whitespace-nowrap will-change-transform',
                wordClassName,
              )}
            >
              {word}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
