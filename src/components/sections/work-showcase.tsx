'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { workContent } from '@/content/work-copy';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import type { WorkProject } from '@/types/work';

const WorkGallery = dynamic(() => import('./work-gallery'));

export function WorkShowcase({ projects }: { projects: readonly WorkProject[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const [open, setOpen] = useState(false);
  const mounted = nearby && introDone;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !mounted) return;
      const frame = root.querySelector<HTMLElement>('[data-work-frame]');
      const panel = root.querySelector<HTMLElement>('[data-work-curtain]');
      const actor = root.querySelector<HTMLElement>('[data-work-actor]');
      const counter = root.querySelector<HTMLElement>('[data-work-counter]');
      const graphic = root.querySelector<HTMLElement>('[data-work-sprite]');
      if (!frame || !panel || !actor || !counter || !graphic) return;
      const media = gsap.matchMedia();
      media.add(
        { full: motionConfig.queries.full, reduced: motionConfig.queries.reduced },
        (context) => {
          if (context.conditions?.reduced) {
            gsap.set([panel, actor, counter], { autoAlpha: 0 });
            setOpen(true);
            if (root.dataset.workOpen !== 'true') root.dataset.workOpen = 'true';
            ScrollTrigger.refresh();
            return;
          }
          setOpen(false);
          if (root.dataset.workOpen !== 'false') root.dataset.workOpen = 'false';
          let width = frame.clientWidth;
          let actorSize = window.innerWidth < 768 ? 176 : 256;
          let previousX = Number.NaN;
          let previousCounterX = Number.NaN;
          let previousFrame = -1;
          let previousPercent = -1;
          let wasOpen = false;
          const progress = { value: 0 };
          const paint = () => {
            const value = progress.value;
            const x = Math.round(value * width * 100) / 100;
            if (x !== previousX) {
              panel.style.transform = `translate3d(${x}px,0,0)`;
              actor.style.transform = `translate3d(${x - actorSize * 0.87}px,-50%,0)`;
              previousX = x;
            }
            const counterX = Math.max(0, x - width + 180);
            if (counterX !== previousCounterX) {
              counter.style.transform = `translate3d(${counterX}px,-50%,0)`;
              previousCounterX = counterX;
            }
            const frameIndex = Math.floor((value * 32 * 1.08) % 32);
            if (frameIndex !== previousFrame) {
              graphic.style.backgroundPosition = `${((frameIndex % 8) / 7) * 100}% ${(Math.floor(frameIndex / 8) / 3) * 100}%`;
              previousFrame = frameIndex;
            }
            const percentage = Math.round(
              value <= 0.6 ? value * 100 : 60 + ((value - 0.6) / 0.62) * 40,
            );
            if (percentage !== previousPercent) {
              counter.textContent = String(Math.min(100, percentage));
              previousPercent = percentage;
            }
            const nextOpen = value >= 1.17;
            if (nextOpen !== wasOpen) {
              wasOpen = nextOpen;
              setOpen(nextOpen);
              root.dataset.workOpen = String(nextOpen);
            }
          };
          const timeline = gsap.timeline({
            paused: true,
            onUpdate: paint,
          });
          timeline
            .to(progress, { value: 0.3, duration: 0.23, ease: 'power2.inOut' })
            .to({}, { duration: 0.035 })
            .to(progress, { value: 0.6, duration: 0.25, ease: 'power2.inOut' })
            .to({}, { duration: 0.04 })
            .to(progress, { value: 1.22, duration: 0.445, ease: 'power3.in' });
          const trigger = ScrollTrigger.create({
            id: 'selected-work-push',
            trigger: root,
            animation: timeline,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.25,
            invalidateOnRefresh: true,
            onRefresh: paint,
          });
          paint();
          const observer = new ResizeObserver(() => {
            width = frame.clientWidth;
            actorSize = window.innerWidth < 768 ? 176 : 256;
            previousX = Number.NaN;
            paint();
          });
          observer.observe(frame);
          ScrollTrigger.refresh();
          timeline.progress(trigger.progress);
          paint();
          const visibility = () => {
            const tween = timeline.scrollTrigger?.getTween();
            if (document.hidden) tween?.pause();
            else {
              tween?.resume();
              timeline.scrollTrigger?.update();
            }
          };
          document.addEventListener('visibilitychange', visibility);
          return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', visibility);
            panel.style.removeProperty('transform');
            actor.style.removeProperty('transform');
            counter.style.removeProperty('transform');
          };
        },
      );
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [mounted], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      data-work-open="false"
      data-work-intro-ready={introDone}
      className="relative h-[175svh] motion-reduce:h-svh"
    >
      <span
        id="work-viewer"
        aria-hidden="true"
        className="absolute top-[75svh] size-px motion-reduce:top-0"
      />
      <div data-work-frame className="sticky top-0 h-svh overflow-hidden bg-[#ededed]">
        {mounted ? (
          <>
            <div inert={!open} className="h-full">
              <WorkGallery projects={projects} enabled={open} />
            </div>
            <div
              data-work-curtain
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 bg-black will-change-transform"
            />
            <div
              data-work-actor
              aria-hidden="true"
              className="pointer-events-none absolute start-0 top-1/2 z-50 size-44 [transform:translateY(-50%)] will-change-transform md:size-64"
            >
              <div
                data-work-sprite
                className="size-full [background-size:800%_400%] bg-no-repeat"
                style={{ backgroundImage: `url(${workContent.sprite})` }}
              />
            </div>
            <span
              data-work-counter
              aria-hidden="true"
              className="pointer-events-none absolute end-6 top-1/2 z-50 [transform:translateY(-50%)] font-serif text-7xl leading-none tracking-tighter text-white md:text-8xl"
            >
              0
            </span>
          </>
        ) : (
          <div className="grid h-full place-content-center bg-black px-8 text-center text-white">
            <h2 className="text-4xl tracking-tight sm:text-6xl">{workContent.title}</h2>
            <p className="mt-4 text-sm text-white/60">{workContent.introLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
