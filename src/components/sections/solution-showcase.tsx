'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { solutionContent as content } from '@/content/solution';
import { ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

// Both download when the stage is about a screen away, not with the page.
const SkeletonKeyPreloader = dynamic(() => import('@/components/ui/skeleton-key-preloader'));
const SolutionWorkspace = dynamic(() =>
  import('./solution-workspace').then((module) => module.SolutionWorkspace),
);

// Runway, in viewport heights, that turns the key and dives through the keyhole.
const UNLOCK = 1.1;

/**
 * A 1165svh runway with a sticky stage inside it. Scroll drives the whole
 * piece, both ways: the collage assembles as the stage comes into view, the
 * next 110svh insert and turn the key and dive through the keyhole into the
 * Figma file, and the remaining runway scrubs the workspace through its ten
 * stages; the next section's push starts only after the last one. The gate
 * mounts only after the intro and a little before it is needed.
 */
export function SolutionShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const unlockRef = useRef(0);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const [through, setThrough] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deep, setDeep] = useState(false);
  const mounted = nearby && introDone;
  // The workspace never re-renders with the count.
  const workspace = useMemo(() => <SolutionWorkspace trackRef={trackRef} />, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '30% 0px' },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // The workspace sits behind the keyhole, a screen of scrolling away. It is
  // the heaviest DOM on the page, so it is built in a quiet moment after the
  // gate rather than in the same task as the intro's hand-off.
  useEffect(() => {
    if (!mounted) return;
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setDeep(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setDeep(true), 1200);
    return () => window.clearTimeout(id);
  }, [mounted]);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !mounted) return;
      // Scroll is the loading bar: 0 when the stage is 15% on screen, 100 when it fills the view.
      let shown = -1;
      const write = (value: number) => {
        const next = Math.round(value * 100);
        if (next === shown) return;
        shown = next;
        setProgress(next);
      };
      const count = ScrollTrigger.create({
        id: 'solution-key-progress',
        trigger: track,
        start: 'top 85%',
        end: 'top top',
        onUpdate: (self) => write(self.progress),
        onRefresh: (self) => write(self.progress),
      });
      write(count.progress);

      // Then the key: insert, turn and dive. The gate eases toward this raw value itself.
      let wasThrough = false;
      const unlock = (value: number) => {
        unlockRef.current = value;
        const next = value >= 0.999;
        if (next === wasThrough) return;
        wasThrough = next;
        setThrough(next);
      };
      const trigger = ScrollTrigger.create({
        id: 'solution-key-unlock',
        trigger: track,
        start: 'top top',
        end: () => `top -${window.innerHeight * UNLOCK}px`,
        invalidateOnRefresh: true,
        onUpdate: (self) => unlock(self.progress),
        onRefresh: (self) => unlock(self.progress),
      });
      unlock(trigger.progress);
      return () => {
        count.kill();
        trigger.kill();
      };
    },
    { scope: trackRef, dependencies: [mounted] },
  );

  return (
    <div ref={trackRef} className="h-[1165svh]">
      <div className="sticky top-0 h-lvh overflow-hidden bg-secondary">
        {mounted ? (
          <SkeletonKeyPreloader
            progress={progress}
            scrub={unlockRef}
            through={through}
            face={content.key.face}
            greeting={content.key.greeting}
            word={content.key.word}
            tags={[...content.key.tags]}
            aboutLabel={content.key.aboutLabel}
            about={[...content.key.about]}
            links={[...content.key.links]}
            signature={content.key.signature}
            labels={content.key.labels}
          >
            <div inert={!through} className="isolate h-full w-full">
              {deep || through ? workspace : null}
            </div>
          </SkeletonKeyPreloader>
        ) : null}
      </div>
    </div>
  );
}
