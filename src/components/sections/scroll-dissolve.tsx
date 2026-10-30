'use client';

import { useCallback, useRef, useState } from 'react';

import NoiseDissolveReveal from '@/components/ui/noise-dissolve-reveal';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

type Stage = 'idle' | 'veil' | 'play' | 'done';

/**
 * The booking form's opening, for any section: the section's first screen
 * arrives under a solid veil, and the veil dissolves once it nearly fills the
 * view. It plays once per visit, only with full motion, and never for a reader
 * who is already past it. Place it in a `relative` section.
 */
export function ScrollDissolve({
  veilColor = '#17284F',
  start = 'top 18%',
}: {
  veilColor?: string;
  start?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const done = useCallback(() => setStage('done'), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const media = gsap.matchMedia();
      media.add(motionConfig.queries.full, () => {
        if (root.getBoundingClientRect().top < window.innerHeight * 0.5) return;
        setStage((current) => (current === 'idle' ? 'veil' : current));
        const trigger = ScrollTrigger.create({
          trigger: root,
          start,
          once: true,
          onEnter: () => setStage((current) => (current === 'veil' ? 'play' : current)),
        });
        return () => trigger.kill();
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [start] },
  );

  if (stage === 'done') return null;
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[45] h-svh"
    >
      {stage === 'veil' ? <div className="h-full" style={{ backgroundColor: veilColor }} /> : null}
      {stage === 'play' ? (
        <NoiseDissolveReveal
          veilColor={veilColor}
          durationMs={1100}
          delayMs={0}
          height="100svh"
          onReveal={done}
        />
      ) : null}
    </div>
  );
}
