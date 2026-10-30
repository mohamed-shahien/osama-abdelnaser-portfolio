'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import AnimatorTitlePreloader, { ATP_SCROLL } from '@/components/ui/animator-title-preloader';
import { BubbleDriver, SkillBubbles, type BubbleKeepOut } from '@/components/ui/skill-bubbles';
import { skillsContent as content } from '@/content/skills';
import { ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

// The bubbles fall while the stage rests, between the hands' fling and the iris.
const FALL = { from: ATP_SCROLL.beats[4][1] + 0.02, to: ATP_SCROLL.beats[4][2] - 0.03 } as const;

// Brand colourway on the black the work section closes on.
const palette = {
  stage: '#000000',
  ink: '#f8fa55',
  muted: '#5b8dfb',
  rough: '#5b8dfb',
  ghost: '#e43468',
  word0: '#f3d061',
  word1: '#f8fa55',
  word2: '#ffffff',
  sleeve0: '#5b8dfb',
  sleeve1: '#3f6fe0',
  sleeve2: '#17284f',
  pattern: '#f8fa55',
  speck: '#0b1430',
  skin0: '#f06a93',
  skin1: '#e43468',
  skin2: '#9e1c44',
  nail: '#ffb3ca',
  cuff: '#f3d061',
};

// The track starts under the avatar's closing curtain (see WorkShowcase): the
// stage is revealed behind it over this much of the runway, then the title draws.
const REVEAL = 0.75;

/** The title card and the glasses at the foot: the bubbles keep clear of both. */
function keepOut(root: HTMLElement): BubbleKeepOut[] {
  const stage = root.closest('.atp-stage') ?? root.parentElement;
  if (!stage) return [];
  const origin = root.getBoundingClientRect();
  return Array.from(stage.querySelectorAll<HTMLElement>('.atp-card, .atp-foot')).map((el) => {
    const box = el.getBoundingClientRect();
    return {
      left: box.left - origin.left,
      top: box.top - origin.top,
      right: box.right - origin.left,
      bottom: el.classList.contains('atp-foot') ? origin.height : box.bottom - origin.top,
    };
  });
}

/**
 * A 595svh runway with a sticky stage; its first 75svh run under the avatar's
 * closing curtain, so the stage is uncovered behind it. Scroll then drives
 * the animator title both ways: the title is roughed, inked and painted while the hands reach in, they
 * grip and fling away, the sixteen skills rain onto the glasses at the foot,
 * and the iris closes on the glasses onto the footer's yellow.
 */
export function SkillsShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef(0);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const [driver] = useState(() => new BubbleDriver());
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
        id: 'skills-scrub',
        trigger: track,
        start: () => `top -${Math.round(window.innerHeight * REVEAL)}px`,
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

  const onScrub = useCallback(
    (u: number) => {
      const t = Math.max(0, Math.min(1, (u - FALL.from) / (FALL.to - FALL.from)));
      driver.set(Math.round(t * 10000) / 10000);
    },
    [driver],
  );

  return (
    <div ref={trackRef} className="h-[595svh] motion-reduce:h-[520svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-black [--skills-card-top:30%] max-md:[--skills-card-top:24%]">
        {mounted ? (
          <AnimatorTitlePreloader
            scrub={scrubRef}
            onScrub={onScrub}
            kicker={content.kicker}
            title={content.title}
            connector={content.connector}
            name={content.name}
            scene={content.scene}
            meta={content.meta}
            steps={content.steps}
            label={content.label}
            palette={palette}
            irisColor="var(--secondary)"
            displayFamily="var(--font-work-display), 'Helvetica Neue', Arial, sans-serif"
            monoFamily="var(--font-geist-mono), ui-monospace, Menlo, Consolas, monospace"
            cardTop="var(--skills-card-top)"
            wordMax={19}
            lettering="marker"
            hud={false}
            mascotDock="foot"
            slot={
              <SkillBubbles
                skills={content.skills}
                driver={driver}
                keepOut={keepOut}
                label={content.label}
              />
            }
          />
        ) : null}
      </div>
    </div>
  );
}
