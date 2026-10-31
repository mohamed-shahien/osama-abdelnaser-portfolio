'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { mountPushCharacter } from '@/lib/motion/push-character';
import type { WorkProject } from '@/types/work';
import type { GalleryAssembly } from './work-gallery';

const WorkGallery = dynamic(() => import('./work-gallery'));

// Push progress at which the deck behind the page starts to assemble.
const ASSEMBLE_FROM = 0.18;

function actorMetrics(mobile: boolean) {
  // Matches the actors' size classes (md and min-[120rem], i.e. 1920px).
  const scale = mobile ? 0.75 : window.innerWidth >= 1920 ? 1.85 : 1.4;
  // `reach`: from the mirrored closer's left edge to its fingertips, measured
  // on the drawing, so its hands sit exactly on the edge it pulls.
  return {
    width: 429 * scale,
    offset: scale * (mobile ? 31 / 0.58 : 60 / 1.14),
    reach: scale * 49.3,
  };
}

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
  // Shared with the gallery: the push writes how far the deck has assembled.
  const [assembly] = useState<GalleryAssembly>(() => ({ progress: 0, apply: () => {} }));
  const mounted = nearby && introDone;

  // Mounts a screen before the push, and also after any jump straight past it
  // (a dock jump to Skills), which an IntersectionObserver would never see.
  useEffect(() => {
    const marker = rootRef.current?.querySelector('[data-push-start]');
    if (!marker) return;
    const trigger = ScrollTrigger.create({
      trigger: marker,
      start: 'top bottom+=100%',
      end: 'max',
      // `once` kills it after the first enter; that can fire inside `create`
      // when the page reloads below this point, before `trigger` is assigned.
      once: true,
      onEnter: () => setNearby(true),
    });
    return () => trigger.kill();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !mounted) return;
      const plate = root.querySelector<HTMLElement>('[data-work-plate]');
      const actor = root.querySelector<HTMLElement>('[data-work-actor]');
      const graphic = root.querySelector<HTMLElement>('[data-work-vector]');
      const stage = root.querySelector<HTMLElement>('[data-work-stage]');
      const exitActor = root.querySelector<HTMLElement>('[data-work-exit-actor]');
      const exitGraphic = root.querySelector<HTMLElement>('[data-work-exit-vector]');
      if (!plate || !actor || !graphic || !stage || !exitActor || !exitGraphic) return;
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
            assembly.progress = 1;
            assembly.apply(1);
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
          const finish = () => {
            const actor = actorMetrics(mobile);
            return 1 + (actor.width - actor.offset) / width + 0.04;
          };
          const paint = () => {
            const value = position.value;
            const metrics = actorMetrics(mobile);
            const x = Math.round(value * width * 100) / 100;
            if (x !== previousX) {
              plate.style.transform = `translate3d(${Math.min(x, width * (mobile ? 1.4 : 1.12))}px,0,0)`;
              actor.style.transform = `translate3d(${x - metrics.width + metrics.offset}px,-50%,0)`;
              previousX = x;
            }
            const opacity = value > 0.001 && value < finish() - 0.001 ? '1' : '0';
            if (opacity !== previousOpacity) {
              actor.style.opacity = opacity;
              previousOpacity = opacity;
            }
            if (!document.hidden) seek?.(value);
            const nextOpen = value >= finish() - 0.01;
            // An open gallery is fully assembled. Landing on the trigger's end (a
            // return from a project, a dock jump) can leave the scrub a hair short
            // of it, and the deck only takes input once assembly is exactly 1.
            const assembled = nextOpen
              ? 1
              : Math.round(
                  Math.max(0, Math.min(1, (value - ASSEMBLE_FROM) / (finish() - ASSEMBLE_FROM))) *
                    10000,
                ) / 10000;
            if (assembled !== assembly.progress) {
              assembly.progress = assembled;
              assembly.apply(assembled);
            }
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
            .to(position, { value: 0.3, duration: 0.8, ease: 'sine.inOut' })
            .to({}, { duration: 0.08 })
            .to(position, { value: 0.6, duration: 0.85, ease: 'sine.inOut' })
            .to({}, { duration: 0.1 })
            .to(position, {
              value: finish,
              duration: 1.6,
              ease: 'power2.inOut',
            });
          const trigger = ScrollTrigger.create({
            id: 'selected-work-push',
            trigger: root,
            animation: timeline,
            start: () => `top -${window.innerHeight * 10.65}px`,
            end: () => `top -${window.innerHeight * 11.9}px`,
            scrub: motionConfig.scroll.scrub,
            invalidateOnRefresh: true,
            onRefresh: paint,
          });
          const exitPosition = { value: 0 };
          let exitX = Number.NaN;
          let exitOpacity = '';
          let exitShown = '';
          let wasClosing = false;
          const paintExit = () => {
            const value = exitPosition.value;
            const metrics = actorMetrics(mobile);
            const x = Math.round(width * (1 - value) * 100) / 100;
            if (x !== exitX) {
              // The avatar draws the gallery off to the left; the next section,
              // already pinned beneath this one, shows behind it.
              const covered = Math.max(0, Math.min(width, width - x));
              stage.style.clipPath = covered > 0 ? `inset(0 ${covered}px 0 0)` : '';
              const shown = covered >= width ? 'hidden' : '';
              if (shown !== exitShown) {
                stage.style.visibility = shown;
                exitShown = shown;
              }
              exitActor.style.transform = `translate3d(${x - metrics.reach}px,-50%,0)`;
              exitX = x;
            }
            const opacity = value > 0.001 && value < finish() - 0.001 ? '1' : '0';
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
          // A quarter screen after the push holds the gallery open, so a fling
          // lands on it instead of starting the close; the close is one walk
          // over a little more than a screen, with Skills drawing in under it.
          exitTimeline
            .to(exitPosition, { value: 0.45, duration: 0.9, ease: 'sine.inOut' })
            .to(exitPosition, { value: finish, duration: 1.3, ease: 'sine.inOut' });
          const exitTrigger = ScrollTrigger.create({
            id: 'selected-work-close',
            trigger: root,
            animation: exitTimeline,
            start: () => `top -${window.innerHeight * 12.15}px`,
            end: () => `top -${window.innerHeight * 13.35}px`,
            scrub: motionConfig.scroll.scrub,
            invalidateOnRefresh: true,
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
            stage.style.removeProperty('clip-path');
            stage.style.removeProperty('visibility');
            exitActor.style.removeProperty('transform');
            exitActor.style.removeProperty('opacity');
            exitGraphic.replaceChildren();
          };
        },
      );
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [mounted, assembly], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      data-work-open="false"
      data-work-intro-ready={introDone}
      className="relative flex flex-col"
    >
      <span data-push-start aria-hidden="true" className="absolute top-[1065svh] size-px" />
      <span
        id="work-viewer"
        aria-hidden="true"
        className="absolute top-[1190svh] size-px [scroll-margin-top:-2rem] motion-reduce:top-[1165svh]"
      />
      <div
        data-work-stage
        className="sticky top-0 order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden bg-[#ededed] motion-reduce:static motion-reduce:order-3 motion-reduce:mb-0"
      >
        <div inert={!open || closing} className="h-full">
          {mounted ? (
            <WorkGallery
              projects={projects}
              total={total}
              enabled={open && !closing}
              assembly={assembly}
            />
          ) : null}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-50 order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden motion-reduce:hidden"
      >
        <div
          data-work-actor
          className="absolute start-0 top-1/2 h-[338.25px] w-[321.75px] opacity-0 will-change-transform md:h-[631.4px] md:w-[600.6px] min-[120rem]:h-[834.35px] min-[120rem]:w-[793.65px]"
        >
          <div data-work-vector className="size-full" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-[60] order-1 -mb-[100svh] h-svh shrink-0 overflow-hidden motion-reduce:hidden"
      >
        <div
          data-work-exit-actor
          className="absolute start-0 top-1/2 h-[338.25px] w-[321.75px] opacity-0 will-change-transform md:h-[631.4px] md:w-[600.6px] min-[120rem]:h-[834.35px] min-[120rem]:w-[793.65px]"
        >
          <div data-work-exit-vector className="size-full [transform:scaleX(-1)]" />
        </div>
      </div>
      <div
        data-work-plate
        className="sticky top-[-1065svh] z-40 order-2 shrink-0 will-change-transform motion-reduce:static"
      >
        {children}
      </div>
      <div aria-hidden="true" className="order-3 h-[345svh] shrink-0 motion-reduce:hidden" />
    </div>
  );
}
