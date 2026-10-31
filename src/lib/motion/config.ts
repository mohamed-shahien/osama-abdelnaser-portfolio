export const motionConfig = {
  queries: {
    full: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  duration: { fast: 0.25, normal: 0.6, slow: 1 },
  ease: { enter: 'power2.out', exit: 'power2.in', transition: 'power2.inOut' },
  // Lenis carries the glide (each frame closes 10% of the gap); scenes follow
  // the scroll closely (`follow` seconds, short scrubs), so they stop with it.
  scroll: { lerp: 0.1, wheelMultiplier: 1, follow: 0.25, scrub: 0.35 },
} as const;
