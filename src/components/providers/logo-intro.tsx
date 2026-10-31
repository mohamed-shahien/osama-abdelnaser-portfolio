'use client';

import { useEffect, useRef } from 'react';

import { gsap } from '@/lib/motion/gsap';

const SEEN = 'logo-intro-seen';

/**
 * Whether a visit that lands on an inner page should open on the logo video:
 * once per browser session, and never under reduced motion.
 */
export function shouldPlayLogoIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !sessionStorage.getItem(SEEN);
  } catch {
    // Storage can be blocked; then it plays on each landing, which is harmless.
    return true;
  }
}

/**
 * The logo video over an inner page: Osama waves, then his name writes in.
 * A click, a tap or any key skips it; it fades out when it ends or stalls.
 */
export function LogoIntro({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {}
    let closing = false;
    const close = () => {
      if (closing) return;
      closing = true;
      gsap.to(root, { autoAlpha: 0, duration: 0.45, ease: 'power2.out', onComplete: onDone });
    };
    skipRef.current = close;
    // A stalled or blocked video never holds the page.
    const stall = window.setTimeout(close, 7000);
    video.addEventListener('ended', close);
    video.play().catch(close);
    window.addEventListener('keydown', close);
    root.querySelector('button')?.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(stall);
      video.removeEventListener('ended', close);
      window.removeEventListener('keydown', close);
      gsap.killTweensOf(root);
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Osama Abdelnaser, Product Designer"
      className="fixed inset-0 z-50 grid place-items-center bg-[#fbfbfb]"
      onClick={() => skipRef.current()}
      data-lenis-prevent
    >
      <video
        ref={videoRef}
        src="/intro/logo-intro.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="max-h-svh w-full max-w-[min(100vw,82svh)] object-contain"
      />
      <button
        type="button"
        className="absolute end-5 bottom-5 rounded-full border-[1.5px] border-ink bg-white px-4 py-1.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Skip
      </button>
    </div>
  );
}
