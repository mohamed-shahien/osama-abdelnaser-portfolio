'use client';

import { useEffect, useRef } from 'react';

import { motionConfig } from '@/lib/motion/config';
import { gsap } from '@/lib/motion/gsap';

// The loader's pointer glyph (amour-sunrise-preloader, '➚'), tip at 22,10.
const ARROW = 'M22 10 L22 80 L39 64 L51 90 L63 85 L51 59 L75 59 Z';
const BOX = { x: 14, y: 4, w: 68, h: 94 };
const SIZE = 30;
const TIP = {
  x: ((22 - BOX.x) / BOX.w) * SIZE,
  y: ((10 - BOX.y) / BOX.h) * SIZE * (BOX.h / BOX.w),
};
const HIDE_NATIVE = ['[&_*]:!cursor-none', '!cursor-none'];
const INTERACTIVE =
  'a, button, [role="button"], label, select, summary, input, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The site's pointer: the loader's arrow. When the loader lifts, the arrow in
 * its sun lets go, shrinks and travels to the mouse, then follows it with a
 * short glide. Fine pointers only; touch screens keep their own behavior.
 * `handoff` is the loader lifting; without a loader it is active at once.
 */
export function SiteCursor({ waiting, handoff }: { waiting: boolean; handoff: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const live = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!root || !fine.matches) return;
    const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
    const glide = reduced ? 0.01 : 0.22;
    const toX = gsap.quickTo(root, 'x', { duration: glide, ease: 'power3.out' });
    const toY = gsap.quickTo(root, 'y', { duration: glide, ease: 'power3.out' });
    let hovering = false;

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (!live.current) return;
      toX(event.clientX - TIP.x);
      toY(event.clientY - TIP.y);
      const over = event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE));
      if (over !== hovering) {
        hovering = over;
        gsap.to(root.firstElementChild, {
          scale: over ? 1.28 : 1,
          rotate: over ? -10 : 0,
          duration: 0.35,
          ease: 'back.out(2.4)',
          overwrite: 'auto',
        });
      }
      if (root.style.opacity !== '1')
        gsap.to(root, { opacity: 1, duration: 0.25, overwrite: 'auto' });
    };
    const press = () =>
      live.current && gsap.to(root, { scale: 0.86, duration: 0.12, overwrite: 'auto' });
    const release = () =>
      live.current && gsap.to(root, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    const leave = () =>
      live.current && gsap.to(root, { opacity: 0, duration: 0.25, overwrite: 'auto' });

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove(...HIDE_NATIVE);
      live.current = false;
    };
  }, []);

  // Take over from the loader's arrow, or at once when there is no loader.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || waiting || live.current) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
    const mark = handoff ? document.querySelector<SVGGraphicsElement>('.amr-heart') : null;
    const rect = mark?.getBoundingClientRect();
    live.current = true;
    document.documentElement.classList.add(...HIDE_NATIVE);
    const target = pointer.current ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const end = { x: target.x - TIP.x, y: target.y - TIP.y, scale: 1, opacity: 1 };
    if (!rect || rect.width === 0 || reduced) {
      gsap.set(root, end);
      return;
    }
    // The arrow leaves the sun at its own size, then shrinks down to the mouse.
    const scale = rect.height / ((SIZE * BOX.h) / BOX.w);
    const start = { x: rect.left, y: rect.top, scale, opacity: 1, transformOrigin: '0 0' };
    if (mark) mark.style.visibility = 'hidden';
    const handover = gsap.fromTo(root, start, {
      ...end,
      x: () => (pointer.current ?? target).x - TIP.x,
      y: () => (pointer.current ?? target).y - TIP.y,
      duration: 1.3,
      delay: 0.15,
      ease: 'power3.inOut',
    });
    return () => {
      handover.kill();
    };
  }, [waiting, handoff]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] origin-top-left opacity-0 will-change-transform"
    >
      <svg
        viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`}
        width={SIZE}
        height={(SIZE * BOX.h) / BOX.w}
        className="block [transform-origin:12%_6%] overflow-visible"
      >
        <path
          d={ARROW}
          fill="#F8FA55"
          stroke="#17284f"
          strokeWidth={6}
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      </svg>
    </div>
  );
}
