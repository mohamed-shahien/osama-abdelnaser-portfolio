'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { mountPushCharacter } from '@/lib/motion/push-character';
import { scrollPageTo } from '@/lib/motion/page-scroll';
import type { WorkProject } from '@/types/work';

const WorkGallery = dynamic(() => import('./work-gallery'));

export function WorkShowcase({
  projects,
  total,
  children,
}: {
  projects: readonly WorkProject[];
  total: number;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const mounted = nearby && introDone;

  useEffect(() => {
    const marker = rootRef.current?.querySelector('[data-push-start]');
    if (!marker) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !mounted) return;
      const plate = root.querySelector<HTMLElement>('[data-work-plate]');
      const actor = root.querySelector<HTMLElement>('[data-work-actor]');
      const graphic = root.querySelector<HTMLElement>('[data-work-vector]');
      const exitPanel = root.querySelector<HTMLElement>('[data-work-exit-panel]');
      const exitActor = root.querySelector<HTMLElement>('[data-work-exit-actor]');
      const exitGraphic = root.querySelector<HTMLElement>('[data-work-exit-vector]');
      if (!plate || !actor || !graphic || !exitPanel || !exitActor || !exitGraphic) return;
      const media = gsap.matchMedia();
      media.add(
        {
          full: motionConfig.queries.full,
          reduced: motionConfig.queries.reduced,
          mobile: '(max-width: 767px)',
        },
        (context) => {
          if (context.conditions?.reduced) {
            setOpen(true);
            setClosing(false);
            root.dataset.workOpen = 'true';
            return;
          }
          let disposed = false;
          let seek: ((progress: number) => void) | undefined;
          let exitSeek: ((progress: number) => void) | undefined;
          const position = { value: 0 };
          let previousX = Number.NaN;
          let previousOpacity = '';
          let wasOpen = false;
          let width = root.clientWidth;
          const mobile = Boolean(context.conditions?.mobile);
          const paint = () => {
            const value = position.value;
            const scale = mobile ? 0.58 : width >= 1920 ? 1.6 : 1.14;
            const offset = mobile ? 31 : width >= 1920 ? 80 : 60;
            const x = Math.round(value * width * 100) / 100;
            if (x !== previousX) {
              plate.style.transform = `translate3d(${Math.min(x, width * (mobile ? 1.4 : 1.12))}px,0,0)`;
              actor.style.transform = `translate3d(${x - 429 * scale + offset}px,-50%,0)`;
              previousX = x;
            }
            const opacity = value > 0.001 && value < (mobile ? 1.4 : 1.28) ? '1' : '0';
            if (opacity !== previousOpacity) {
              actor.style.opacity = opacity;
              previousOpacity = opacity;
            }
            if (!document.hidden) seek?.(value);
            const nextOpen = value >= (mobile ? 1.39 : 1.27);
            if (nextOpen !== wasOpen) {
              wasOpen = nextOpen;
              setOpen(nextOpen);
              root.dataset.workOpen = String(nextOpen);
            }
          };
          void mountPushCharacter(graphic)
            .then((render) => {
              if (!disposed) {
                seek = render;
                paint();
              }
            })
            .catch(() => {
              /* The section remains navigable if the illustration fails. */
            });
          const timeline = gsap.timeline({ paused: true, onUpdate: paint });
          timeline
            .to(position, { value: 0.3, duration: mobile ? 0.95 : 0.65, ease: 'power2.inOut' })
            .to({}, { duration: 0.16 })
            .to(position, { value: 0.6, duration: 0.72, ease: 'power2.inOut' })
            .to({}, { duration: 0.2 })
            .to(position, {
              value: mobile ? 1.4 : 1.28,
              duration: mobile ? 1.76 : 1.46,
              ease: 'power2.inOut',
            });
          const trigger = ScrollTrigger.create({
            id: 'selected-work-push',
            trigger: root,
            animation: timeline,
            start: () => `top -${window.innerHeight * 0.75}px`,
            end: () => `top -${window.innerHeight * 1.5}px`,
            scrub: 0.18,
            onRefresh: paint,
            onLeave: () => {
              const end =
                root.getBoundingClientRect().top + window.scrollY + window.innerHeight * 1.5;
              // Cancel the root Lenis inertia when the local gallery takes input.
              if (window.scrollY >= end && window.scrollY < end + window.innerHeight * 0.4)
                scrollPageTo(end);
            },
          });
          const exitPosition = { value: 0 };
          let exitX = Number.NaN;
          let exitOpacity = '';
          let wasClosing = false;
          const paintExit = () => {
            const value = exitPosition.value;
            const scale = mobile ? 0.58 : width >= 1920 ? 1.6 : 1.14;
            const offset = mobile ? 31 : width >= 1920 ? 80 : 60;
            const x = Math.round(width * (1 - value) * 100) / 100;
            if (x !== exitX) {
              exitPanel.style.transform = `translate3d(${Math.max(0, x)}px,0,0)`;
              exitActor.style.transform = `translate3d(${x - offset}px,-50%,0)`;
              exitActor.style.width = `${429 * scale}px`;
              exitActor.style.height = `${451 * scale}px`;
              exitX = x;
            }
            const opacity = value > 0.001 && value < 1.28 ? '1' : '0';
            if (opacity !== exitOpacity) {
              exitActor.style.opacity = opacity;
              exitOpacity = opacity;
            }
            if (!document.hidden) exitSeek?.(value);
            const nextClosing = value > 0.001;
            if (nextClosing !== wasClosing) {
              wasClosing = nextClosing;
              setClosing(nextClosing);
              root.dataset.workClosing = String(nextClosing);
            }
          };
          void mountPushCharacter(exitGraphic)
            .then((render) => {
              if (!disposed) {
                exitSeek = render;
                paintExit();
              }
            })
            .catch(() => {});
          const exitTimeline = gsap.timeline({ paused: true, onUpdate: paintExit });
          exitTimeline
            .to(exitPosition, { value: 0.3, duration: 0.65, ease: 'power2.inOut' })
            .to({}, { duration: 0.16 })
            .to(exitPosition, { value: 0.6, duration: 0.72, ease: 'power2.inOut' })
            .to({}, { duration: 0.2 })
            .to(exitPosition, { value: 1.28, duration: 1.46, ease: 'power2.inOut' });
          const exitTrigger = ScrollTrigger.create({
            id: 'selected-work-close',
            trigger: root,
            animation: exitTimeline,
            start: () => `top -${window.innerHeight * 1.5}px`,
            end: () => `top -${window.innerHeight * 2.25}px`,
            scrub: 0.18,
            onRefresh: paintExit,
          });
          const resize = new ResizeObserver(() => {
            width = root.clientWidth;
            previousX = Number.NaN;
            exitX = Number.NaN;
            paint();
            paintExit();
          });
          resize.observe(root);
          const visibility = () => {
            const scrub = trigger.getTween();
            if (document.hidden) scrub?.pause();
            else {
              scrub?.resume();
              trigger.update();
              paint();
            }
            if (document.hidden) exitTrigger.getTween()?.pause();
            else {
              exitTrigger.getTween()?.resume();
              exitTrigger.update();
              paintExit();
            }
          };
          document.addEventListener('visibilitychange', visibility);
          ScrollTrigger.refresh();
          timeline.progress(trigger.progress);
          exitTimeline.progress(exitTrigger.progress);
          paint();
          paintExit();
          return () => {
            disposed = true;
            resize.disconnect();
            document.removeEventListener('visibilitychange', visibility);
            plate.style.removeProperty('transform');
            actor.style.removeProperty('transform');
            actor.style.removeProperty('opacity');
            graphic.replaceChildren();
            exitPanel.style.removeProperty('transform');
            exitActor.style.removeProperty('transform');
            exitActor.style.removeProperty('opacity');
            exitGraphic.replaceChildren();
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
      className="relative flex flex-col"
    >
      <span data-push-start aria-hidden="true" className="absolute top-[75svh] size-px" />
      <span
        id="work-viewer"
        aria-hidden="true"
        className="absolute top-[150svh] size-px [scroll-margin-top:-2rem] motion-reduce:top-[175svh]"
      />
      <div className="sticky top-0 order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden bg-[#ededed] motion-reduce:static motion-reduce:order-3 motion-reduce:mb-0">
        <div inert={!open} className="h-full">
          {mounted ? (
            <WorkGallery projects={projects} total={total} enabled={open && !closing} />
          ) : null}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-50 order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden motion-reduce:hidden"
      >
        <div
          data-work-actor
          className="absolute start-0 top-1/2 h-[261.58px] w-[248.82px] opacity-0 will-change-transform min-[1920px]:h-[721.6px] min-[1920px]:w-[686.4px] md:h-[514.14px] md:w-[489.06px]"
        >
          <div data-work-vector className="size-full" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-[60] order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden motion-reduce:hidden"
      >
        <div
          data-work-exit-panel
          className="absolute inset-0 [transform:translateX(100%)] bg-black"
        />
        <div
          data-work-exit-actor
          className="absolute start-0 top-1/2 opacity-0 will-change-transform"
        >
          <div data-work-exit-vector className="size-full [transform:scaleX(-1)]" />
        </div>
      </div>
      <div
        data-work-plate
        className="sticky top-[-75svh] z-40 order-2 shrink-0 will-change-transform motion-reduce:static"
      >
        {children}
      </div>
      <div aria-hidden="true" className="order-3 h-[150svh] shrink-0 motion-reduce:hidden" />
    </div>
  );
}
