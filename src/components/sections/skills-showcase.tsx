'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import AnimatorTitlePreloader, { ATP_SCROLL } from '@/components/ui/animator-title-preloader';
import {
  BubbleDriver,
  SkillBubbles,
  type BubbleHalo,
  type BubbleKeepOut,
} from '@/components/ui/skill-bubbles';
import { skillsContent as content } from '@/content/skills';
import { followTo } from '@/lib/motion/follow';
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
  // The hands wear the hero's look: ink sleeves flecked with white, pale skin.
  sleeve0: '#24407f',
  sleeve1: '#17284f',
  sleeve2: '#0b1430',
  pattern: '#ffffff',
  speck: '#ffffff',
  skin0: '#ffffff',
  skin1: '#e3e9f6',
  skin2: '#9fb0d3',
  nail: '#ffffff',
  cuff: '#f8fa55',
};

// The track starts under the avatar's closing curtain (see WorkShowcase): the
// stage is revealed behind it over this much of the runway, then the title draws.
const REVEAL = 1.7;

/** The title card: the bubbles fall past it and never pile into it. */
function keepOut(root: HTMLElement): BubbleKeepOut[] {
  const stage = root.closest('.atp-stage') ?? root.parentElement;
  if (!stage) return [];
  const origin = root.getBoundingClientRect();
  return Array.from(stage.querySelectorAll<HTMLElement>('.atp-card')).map((el) => {
    const box = el.getBoundingClientRect();
    return {
      left: box.left - origin.left,
      top: box.top - origin.top,
      right: box.right - origin.left,
      bottom: box.bottom - origin.top,
    };
  });
}

/**
 * The glasses' halo: the circle the iris holds on before it shuts (the
 * animator's wink radius, 0.64 of the mascot's width, centred 0.56 down it).
 */
function halo(root: HTMLElement): BubbleHalo | null {
  const stage = root.closest('.atp-stage') ?? root.parentElement;
  const mascot = stage?.querySelector<SVGElement>('.atp-mascot');
  if (!mascot) return null;
  const origin = root.getBoundingClientRect();
  const box = mascot.getBoundingClientRect();
  if (!box.width) return null;
  return {
    x: box.left + box.width / 2 - origin.left,
    y: box.top + box.height * 0.56 - origin.top,
    r: box.width * 0.64,
  };
}

/**
 * A 690svh runway with a sticky stage; its first 170svh run under the avatar's
 * closing curtain, so the stage is uncovered behind it. Scroll then drives
 * the animator title both ways: the title is roughed, inked and painted while the hands reach in, they
 * grip and fling away, thirty skills rain past the haloed glasses at the foot,
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
      const write = (value: number, immediate = false) => {
        followTo(scrubRef, 'current', value, immediate);
      };
      const trigger = ScrollTrigger.create({
        id: 'skills-scrub',
        trigger: track,
        // From 80% of the avatar's close, so the stage never sits empty.
        start: () => {
          const close = ScrollTrigger.getById('selected-work-close');
          return close
            ? close.start + (close.end - close.start) * 0.8
            : `top -${Math.round(window.innerHeight * REVEAL)}px`;
        },
        // Past the pin by a quarter screen: the stage is already moving up
        // toward the CV while the iris shuts on the glasses.
        end: 'bottom 75%',
        refreshPriority: -1,
        invalidateOnRefresh: true,
        onUpdate: (self) => write(self.progress),
        onRefresh: (self) => write(self.progress, true),
      });
      write(trigger.progress, true);
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
    <div ref={trackRef} className="h-[690svh] motion-reduce:h-[520svh]">
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
            irisColor="#17284f"
            displayFamily="var(--font-work-display), 'Helvetica Neue', Arial, sans-serif"
            monoFamily="var(--font-sans)"
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
                halo={halo}
                label={content.label}
              />
            }
          />
        ) : null}
      </div>
    </div>
  );
}
