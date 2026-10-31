export const motionConfig = {
  queries: {
    full: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  duration: { fast: 0.25, normal: 0.6, slow: 1 },
  ease: { enter: 'power2.out', exit: 'power2.in', transition: 'power2.inOut' },
  // A soft glide: each frame closes 6% of the gap, a wheel notch travels less, and
  // scroll-written scene values ease toward their target over `follow` seconds.
  scroll: { lerp: 0.06, wheelMultiplier: 0.75, follow: 0.9 },
} as const;
