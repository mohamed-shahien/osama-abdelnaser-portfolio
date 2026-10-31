'use client';

import { useRef } from 'react';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';

/** The reference's small, isolated blur pulse; no filtering on the whole scene. */
export function WorkCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (first.current) {
        first.current = false;
        return;
      }
      const media = gsap.matchMedia();
      media.add(motionConfig.queries.full, () => {
        const timeline = gsap.timeline();
        timeline
          .to(node, { filter: 'blur(9.73px)', duration: 0.3, ease: 'power2.out' })
          .to(node, { filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' });
        let inView = true;
        const visibility = () => {
          if (document.hidden || !inView) timeline.pause();
          else timeline.resume();
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = Boolean(entry?.isIntersecting);
          visibility();
        });
        observer.observe(node);
        document.addEventListener('visibilitychange', visibility);
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', visibility);
        };
      });
      return () => media.revert();
    },
    { scope: ref, dependencies: [value], revertOnUpdate: true },
  );
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="inline-block text-[clamp(4rem,12vw,11rem)] leading-[0.75] tracking-[-0.11em] [font-variant-numeric:tabular-nums]"
    >
      {value}
    </span>
  );
}
