export const motionConfig = {
  queries: {
    full: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  duration: { fast: 0.25, normal: 0.6, slow: 1 },
  ease: { enter: 'power2.out', exit: 'power2.in', transition: 'power2.inOut' },
  scroll: { lerp: 0.1 },
} as const;
