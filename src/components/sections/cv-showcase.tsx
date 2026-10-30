'use client';

import { useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import TypeRemixPreloader from '@/components/ui/type-remix-preloader';
import type { RemixSlides } from '@/components/ui/type-remix-preloader';
import { cvContent as content } from '@/content/cv';
import { ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

/**
 * A 560svh runway with a sticky stage. Scroll drives the Type Remix takes both
 * ways, one CV chapter per take, and lands on the moodboard whose last tile
 * downloads the CV.
 */
export function CvShowcase({ slides }: { slides: RemixSlides }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef(0);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const mounted = nearby && introDone;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !mounted) return;
      const write = (value: number) => {
        scrubRef.current = value;
      };
      const trigger = ScrollTrigger.create({
        id: 'cv-scrub',
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => write(self.progress),
        onRefresh: (self) => write(self.progress),
      });
      write(trigger.progress);
      return () => trigger.kill();
    },
    { scope: trackRef, dependencies: [mounted] },
  );

  const { shared } = content;
  return (
    <div ref={trackRef} data-cv-track className="h-[560svh] motion-reduce:h-[400svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#17284f]">
        {mounted ? (
          <TypeRemixPreloader
            scrub={scrubRef}
            word={shared.word}
            name={shared.name}
            discipline={shared.discipline}
            year={shared.year}
            period={shared.period}
            handle={shared.handle}
            roles={shared.roles}
            kicker={shared.kicker}
            tagline={shared.tagline}
            motto={shared.motto}
            slides={slides}
            labels={content.labels}
            cta={content.cta}
            ground="#17284f"
            height="100svh"
            label={content.label}
            hud={false}
            stickers={false}
            decals={content.decals}
          />
        ) : null}
      </div>
    </div>
  );
}
