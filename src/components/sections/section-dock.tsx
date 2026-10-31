'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import type { RemixTake } from '@/components/ui/type-remix-preloader';
import { cvContent } from '@/content/cv';
import { toggleMusic } from '@/lib/audio/lofi';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { scrollPageTo } from '@/lib/motion/page-scroll';
import { cn } from '@/lib/utils';
import { MusicBars, useMusicPlaying } from './music-deck';

// The CV runs its takes over the first 70% of its runway (see `RTP_SCROLL.takes`).
const CV_TAKES: readonly RemixTake[] = [
  'sticker',
  'felt',
  'bubble',
  'script',
  'stretch',
  'vector',
  'cutout',
];
const CV_TAKE_SPAN = 0.7 / CV_TAKES.length;

/** `lead` is how many screens past the section's top it is read best. */
type Stop = { id: string; label: string; selector?: string; take?: number; lead?: number };
// The solution opens the work section; the gallery comes in further down.
const stops: readonly Stop[] = [
  { id: 'intro', label: 'Intro', selector: '[data-hero]' },
  { id: 'solution', label: 'Solution', selector: '#work' },
  { id: 'work', label: 'Work', selector: '#work-viewer' },
  // Skills starts beneath the avatar's closing walk, uncovered about two screens on.
  { id: 'skills', label: 'Skills', selector: '#skills', lead: 2.2 },
  ...CV_TAKES.map((take, index) => ({
    id: 'cv-' + take,
    label: cvContent.labels[take],
    take: index,
  })),
  { id: 'contact', label: 'Contact' },
];
const firstCv = stops.findIndex((stop) => stop.take === 0);

const bottom = () => document.documentElement.scrollHeight - window.innerHeight;
/**
 * Where each stop is read best (`at`) and where it begins (`from`). A section
 * pinned beneath the one before it arrives only once that one has wiped away,
 * about three quarters of a screen on. CV stops sit in the middle of their take.
 */
const measureStops = () => {
  const end = bottom();
  const vh = window.innerHeight;
  const track = document.querySelector<HTMLElement>('[data-cv-track]');
  const trackTop = track ? track.getBoundingClientRect().top + window.scrollY : end;
  const span = track ? Math.max(1, track.offsetHeight - vh) : 0;
  let previous = Number.NEGATIVE_INFINITY;
  return stops.map((stop) => {
    if (stop.id === 'intro') return { at: (previous = 0), from: 0 };
    if (stop.id === 'contact') return { at: end, from: end - 4 };
    if (stop.take !== undefined) {
      const from = trackTop + stop.take * CV_TAKE_SPAN * span;
      const at = Math.min(end, trackTop + (stop.take + 0.5) * CV_TAKE_SPAN * span);
      previous = stop.take === 0 ? Math.max(at, previous + vh * 0.75) : at;
      return { at: previous, from: stop.take === 0 ? previous - vh * 0.45 : from };
    }
    const element = stop.selector ? document.querySelector(stop.selector) : null;
    if (!element) return { at: Number.POSITIVE_INFINITY, from: Number.POSITIVE_INFINITY };
    const top = element.getBoundingClientRect().top + window.scrollY + (stop.lead ?? 0) * vh;
    previous = Math.min(end, Math.max(top, previous + vh * 0.75));
    return { at: previous, from: previous - vh * 0.45 };
  });
};

const dotClass =
  'block rounded-full [transition:height_420ms_cubic-bezier(.22,1,.36,1),width_420ms_cubic-bezier(.22,1,.36,1),background_260ms_ease]';

/**
 * A slim rail of shortcuts to every section, the CV chapters included. The
 * index button opens it with names, which phones always use. A jump draws an
 * ink curtain across the screen, moves while it is covered, and lifts it again,
 * so the page never races through every animation in between.
 */
export function SectionDock() {
  const ready = useSiteIntroReady();
  const playing = useMusicPlaying();
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shapedRef = useRef(false);
  const closingRef = useRef(false);
  const sizeRef = useRef<DOMRect | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  // One trigger over the page; the stops' positions are read on refresh only.
  useGSAP(
    () => {
      if (!ready) return;
      let marks: { from: number }[] = [];
      let current = 0;
      const update = () => {
        let next = 0;
        marks.forEach((mark, index) => {
          if (mark.from <= window.scrollY) next = index;
        });
        if (next !== current) {
          current = next;
          setActive(next);
        }
      };
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: update,
        onRefresh: () => {
          marks = measureStops();
          update();
        },
      });
      marks = measureStops();
      update();
      return () => trigger.kill();
    },
    { dependencies: [ready], scope: rootRef },
  );

  // The panel changes shape between the rail and the index: each new shape
  // glides in from the rail's edge, and the index rows settle one by one.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!shapedRef.current) {
        shapedRef.current = true;
        return;
      }
      const rows = panel.querySelectorAll('[data-index-row]');
      // Rows faded by the close keep no inline opacity, or the rail's dots vanish.
      if (!open) gsap.set(rows, { clearProps: 'opacity,transform' });
      const from = sizeRef.current;
      sizeRef.current = null;
      const media = gsap.matchMedia();
      media.add(motionConfig.queries.full, () => {
        // The panel grows from the size it had into the size it has now.
        if (from) {
          const to = panel.getBoundingClientRect();
          gsap.fromTo(
            panel,
            { width: from.width, height: from.height, overflow: 'hidden' },
            {
              width: to.width,
              height: to.height,
              duration: 0.75,
              ease: 'power3.inOut',
              clearProps: 'width,height,overflow',
            },
          );
        }
        if (open)
          gsap.from(rows, {
            y: 8,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.03,
            delay: 0.3,
            clearProps: 'transform,opacity',
          });
      });
      return () => media.revert();
    },
    { dependencies: [open], scope: rootRef },
  );

  // Closing plays the rows and the panel out before the rail comes back.
  const close = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || window.matchMedia(motionConfig.queries.reduced).matches) {
      setOpen(false);
      return;
    }
    if (closingRef.current) return;
    closingRef.current = true;
    gsap.to(panel.querySelectorAll('[data-index-row]'), {
      opacity: 0,
      y: 4,
      duration: 0.3,
      ease: 'power2.in',
      stagger: { each: 0.015, from: 'end' },
      onComplete: () => {
        closingRef.current = false;
        sizeRef.current = panel.getBoundingClientRect();
        setOpen(false);
      },
    });
  }, []);

  const toggle = () => {
    if (open) return close();
    if (panelRef.current) sizeRef.current = panelRef.current.getBoundingClientRect();
    setOpen(true);
  };

  // The open index closes on Escape or a press anywhere else.
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const press = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('pointerdown', press);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('pointerdown', press);
    };
  }, [open, close]);

  const jump = (index: number) => {
    if (open) close();
    const go = () => {
      const y = measureStops()[index]?.at;
      if (y === undefined || !Number.isFinite(y)) return;
      scrollPageTo(y);
      ScrollTrigger.update();
    };
    const curtain = curtainRef.current;
    if (!curtain || window.matchMedia(motionConfig.queries.reduced).matches) {
      go();
      return;
    }
    gsap.killTweensOf(curtain);
    gsap
      .timeline()
      .set(curtain, { display: 'block', transformOrigin: '50% 100%' })
      .fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: 0.65, ease: 'power3.inOut' })
      .call(go)
      .set(curtain, { transformOrigin: '50% 0%' }, '+=0.15')
      .to(curtain, { scaleY: 0, duration: 0.9, ease: 'power3.inOut' })
      .set(curtain, { display: 'none' });
  };

  const atContact = stops[active]?.id === 'contact';
  return (
    <div ref={rootRef} data-section-dock>
      <div
        ref={curtainRef}
        className="pointer-events-none fixed inset-0 z-[60] hidden bg-ink"
        aria-hidden="true"
      />
      <nav
        aria-label="Sections"
        className={cn(
          'fixed top-1/2 right-[10px] z-40 -translate-y-1/2 [transition:opacity_500ms_ease,translate_500ms_ease]',
          'max-sm:top-auto max-sm:right-auto max-sm:bottom-[12px] max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-0',
          // On phones the bar steps aside for the footer's own button.
          atContact &&
            !open &&
            'max-sm:pointer-events-none max-sm:translate-y-[72px] max-sm:opacity-0',
          !ready && 'pointer-events-none translate-x-[24px] opacity-0',
        )}
      >
        <div
          ref={panelRef}
          className={cn(
            'flex [scrollbar-width:none] flex-col items-center gap-[2px] bg-[#17284fee] p-[5px] text-white [box-shadow:0_6px_18px_#17284f33] [&::-webkit-scrollbar]:hidden',
            open
              ? 'max-h-[calc(100svh_-_40px)] items-stretch overflow-y-auto rounded-[18px] p-[8px] max-sm:mb-[8px] max-sm:w-[min(320px,calc(100vw_-_24px))]'
              : 'rounded-full max-sm:flex-row',
          )}
          data-lenis-prevent
        >
          <button
            type="button"
            aria-expanded={open}
            aria-controls="section-index"
            onClick={toggle}
            className={cn(
              'group/stop relative flex h-[26px] min-w-[26px] cursor-pointer items-center justify-center gap-[8px] rounded-full bg-transparent px-[6px] text-[12px] font-semibold [border:0] focus-visible:outline-2 focus-visible:outline-accent-rose',
              open && 'justify-between px-[8px]',
            )}
          >
            <span className="flex flex-col gap-[2px]" aria-hidden="true">
              <span className="block h-[2px] w-[11px] rounded-full bg-secondary" />
              <span className="block h-[2px] w-[11px] rounded-full bg-secondary" />
              <span className="block h-[2px] w-[7px] rounded-full bg-secondary" />
            </span>
            <span className={cn(open ? 'not-sr-only' : 'sr-only', 'max-sm:not-sr-only')}>
              {open ? 'Close index' : 'Index'}
            </span>
            {!open ? (
              <span className="text-[11px] font-normal text-[#ffffffb3] sm:hidden">
                · {stops[active]?.label}
              </span>
            ) : null}
          </button>
          <ul
            id="section-index"
            className={cn(
              'm-0 flex list-none flex-col items-center gap-[2px] p-0',
              open
                ? 'mt-[4px] items-stretch border-t border-[#ffffff26] pt-[6px]'
                : 'max-sm:hidden',
            )}
          >
            {stops.map((stop, index) => {
              const current = active === index;
              const child = stop.take !== undefined;
              return (
                <li key={stop.id} data-index-row>
                  {open && index === firstCv ? (
                    <p className="m-0 px-[8px] pt-[6px] pb-[2px] text-[10px] tracking-[0.12em] text-[#ffffff80] uppercase">
                      CV
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className={cn(
                      'group/stop relative grid cursor-pointer place-items-center rounded-full bg-transparent [border:0] focus-visible:outline-2 focus-visible:outline-accent-rose',
                      open
                        ? 'flex w-full items-center gap-[10px] rounded-[10px] px-[8px] py-[5px] text-start text-[13px] whitespace-nowrap [transition:background-color_200ms_ease] hover:bg-[#ffffff14]'
                        : child
                          ? 'size-[18px]'
                          : 'size-[26px]',
                      open && child && 'ps-[18px]',
                      open && current && 'bg-[#ffffff1f] text-secondary',
                    )}
                    aria-label={open ? undefined : 'Go to ' + stop.label}
                    aria-current={current ? 'location' : undefined}
                    onClick={() => jump(index)}
                  >
                    <span
                      className={cn(
                        dotClass,
                        child ? 'w-[4px]' : 'w-[6px]',
                        current
                          ? cn('bg-secondary', open ? 'h-[6px]' : child ? 'h-[12px]' : 'h-[16px]')
                          : cn(
                              child ? 'h-[4px]' : 'h-[6px]',
                              'bg-[#ffffff66] group-hover/stop:bg-white',
                            ),
                      )}
                    />
                    {open ? (
                      stop.label
                    ) : (
                      <span
                        className="pointer-events-none absolute top-1/2 right-[calc(100%_+_12px)] translate-x-[6px] -translate-y-1/2 rounded-full bg-ink px-[10px] py-[4px] text-[11px] leading-[14px] font-semibold whitespace-nowrap text-secondary opacity-0 [transition:opacity_180ms_ease,translate_180ms_ease] group-hover/stop:translate-x-0 group-hover/stop:opacity-100 group-focus-visible/stop:translate-x-0 group-focus-visible/stop:opacity-100"
                        aria-hidden="true"
                      >
                        {child ? 'CV · ' + stop.label : stop.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {open ? (
              <li data-index-row className="mt-[4px] border-t border-[#ffffff26] pt-[6px]">
                <a
                  href={cvContent.cta.href}
                  download
                  className="flex items-center justify-between gap-[10px] rounded-[10px] bg-secondary px-[10px] py-[8px] text-[13px] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-rose"
                >
                  Download CV <span aria-hidden="true">↓</span>
                </a>
              </li>
            ) : null}
          </ul>
          <div
            className={cn(
              'mt-[3px] border-t border-[#ffffff26] pt-[3px]',
              open
                ? 'mt-[6px] flex justify-start pt-[6px]'
                : 'max-sm:ms-[3px] max-sm:mt-0 max-sm:border-s max-sm:border-t-0 max-sm:ps-[3px] max-sm:pt-0',
            )}
          >
            <button
              type="button"
              className="group/stop relative grid size-[26px] cursor-pointer place-items-center rounded-full bg-transparent [border:0] focus-visible:outline-2 focus-visible:outline-accent-rose"
              aria-pressed={playing}
              aria-label={playing ? 'Pause the studio radio' : 'Play the studio radio'}
              onClick={toggleMusic}
            >
              <MusicBars
                className={cn('h-[12px]', playing ? 'text-accent-rose' : 'text-[#ffffff99]')}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-[calc(100%_+_12px)] translate-x-[6px] -translate-y-1/2 rounded-full bg-ink px-[10px] py-[4px] text-[11px] leading-[14px] font-semibold whitespace-nowrap text-secondary opacity-0 [transition:opacity_180ms_ease,translate_180ms_ease] group-hover/stop:translate-x-0 group-hover/stop:opacity-100 group-focus-visible/stop:translate-x-0 group-focus-visible/stop:opacity-100 max-sm:hidden"
                aria-hidden="true"
              >
                {playing ? 'Radio on' : 'Radio off'}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
