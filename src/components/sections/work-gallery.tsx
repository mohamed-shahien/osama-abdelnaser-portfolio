'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { workContent } from '@/content/work-copy';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';
import type { WorkProject } from '@/types/work';

function distanceTo(index: number, current: number, count: number) {
  return ((((index - current + count / 2) % count) + count) % count) - count / 2;
}

export default function WorkGallery({
  projects,
  enabled,
}: {
  projects: readonly WorkProject[];
  enabled: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<(index: number) => void>(() => {});
  const activeRef = useRef(0);
  const restoredRef = useRef(false);
  const [active, setActive] = useState(0);
  const project = projects[active] ?? projects[0];

  useGSAP(
    () => {
      const root = rootRef.current;
      const scroller = scrollRef.current;
      if (!root || !scroller) return;
      if (!restoredRef.current) {
        restoredRef.current = true;
        try {
          const saved = sessionStorage.getItem('osama:selected-work');
          const savedIndex = projects.findIndex((item) => item.slug === saved);
          if (savedIndex > 0) scroller.scrollTop = savedIndex * scroller.clientHeight * 0.7;
        } catch {
          // The gallery also works when browser storage is disabled.
        }
      }
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-work-card]'));
      const labels = Array.from(root.querySelectorAll<HTMLElement>('[data-work-label]'));
      const media = gsap.matchMedia();
      media.add(
        { full: motionConfig.queries.full, reduced: motionConfig.queries.reduced },
        (context) => {
          const reduce = Boolean(context.conditions?.reduced);
          const position = { index: scroller.scrollTop / Math.max(1, scroller.clientHeight * 0.7) };
          let width = root.clientWidth;
          let height = root.clientHeight;
          let inView = false;
          let lastTarget = Number.NaN;
          const transforms: string[] = [];
          const labelTransforms: string[] = [];
          const labelOpacities: string[] = [];
          const layers: string[] = [];
          const visibility: boolean[] = [];
          const paint = () => {
            const current = position.index;
            cards.forEach((card, index) => {
              const distance = distanceTo(index, current, projects.length);
              const visible = reduce ? Math.abs(distance) < 0.5 : Math.abs(distance) < 3.8;
              if (visibility[index] !== visible) {
                visibility[index] = visible;
                card.style.visibility = visible ? 'visible' : 'hidden';
              }
              if (!visible) return;
              const x = Math.sin(distance * 0.68) * width * (width >= 1024 ? 0.32 : 0.34);
              const curve = distance / (1 + Math.max(0, Math.abs(distance) - 1) * 0.7);
              const y = -curve * height * (distance > 0 ? 0.48 : 0.58);
              const transform = reduce
                ? 'translate(-50%,-50%)'
                : `translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${(-Math.abs(distance) * 70).toFixed(2)}px) rotateX(${(distance * 7).toFixed(2)}deg) rotateY(${(-distance * 24).toFixed(2)}deg) rotateZ(${(distance * 7).toFixed(2)}deg)`;
              if (transforms[index] !== transform) {
                card.style.transform = transform;
                transforms[index] = transform;
              }
              const layer = String(100 - Math.round(Math.abs(distance) * 10));
              if (layers[index] !== layer) {
                card.style.zIndex = layer;
                layers[index] = layer;
              }
            });
            labels.forEach((label, index) => {
              const distance = distanceTo(index, current, projects.length);
              const transform = `translate(-50%,calc(-50% + ${(distance * 178).toFixed(2)}px))`;
              if (labelTransforms[index] !== transform) {
                label.style.transform = transform;
                labelTransforms[index] = transform;
              }
              const opacity =
                Math.abs(distance) < 0.5 ? '1' : Math.abs(distance) < 2.8 ? '0.2' : '0';
              if (labelOpacities[index] !== opacity) {
                label.style.opacity = opacity;
                labelOpacities[index] = opacity;
              }
            });
            const next =
              ((Math.round(current) % projects.length) + projects.length) % projects.length;
            if (next !== activeRef.current) {
              activeRef.current = next;
              setActive(next);
              const selected = projects[next];
              if (selected) {
                try {
                  sessionStorage.setItem('osama:selected-work', selected.slug);
                } catch {
                  /* Optional navigation memory. */
                }
              }
            }
          };
          const seek = gsap.quickTo(position, 'index', {
            duration: reduce ? 0 : 0.55,
            ease: 'power3.out',
            onUpdate: paint,
          });
          const scroll = () => {
            if (!enabled || !inView || document.hidden) return;
            const target = scroller.scrollTop / Math.max(1, height * 0.7);
            if (target === lastTarget) return;
            lastTarget = target;
            seek(position.index + distanceTo(target, position.index, projects.length));
          };
          moveRef.current = (index) => {
            scroller.scrollTop = Math.max(0, Math.min(projects.length - 1, index)) * height * 0.7;
            scroll();
          };
          const observer = new IntersectionObserver(([entry]) => {
            inView = Boolean(entry?.isIntersecting);
            if (inView && !document.hidden) {
              seek.tween.resume();
              scroll();
            } else seek.tween.pause();
          });
          observer.observe(root);
          const resize = new ResizeObserver(() => {
            width = root.clientWidth;
            height = root.clientHeight;
            lastTarget = Number.NaN;
            scroll();
            paint();
          });
          resize.observe(root);
          const visibilityChange = () => {
            if (document.hidden) seek.tween.pause();
            else if (inView) {
              seek.tween.resume();
              scroll();
            }
          };
          document.addEventListener('visibilitychange', visibilityChange);
          scroller.addEventListener('scroll', scroll, { passive: true });
          paint();
          return () => {
            observer.disconnect();
            resize.disconnect();
            document.removeEventListener('visibilitychange', visibilityChange);
            scroller.removeEventListener('scroll', scroll);
            seek.tween.kill();
            moveRef.current = () => {};
          };
        },
      );
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [enabled, projects], revertOnUpdate: true },
  );

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const offsets: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      PageDown: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
      PageUp: -1,
    };
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      moveRef.current(event.key === 'Home' ? 0 : projects.length - 1);
    } else if (offsets[event.key]) {
      event.preventDefault();
      moveRef.current(activeRef.current + (offsets[event.key] ?? 0));
    }
  };
  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (
      index === activeRef.current ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    moveRef.current(index);
  };
  if (!project) return null;

  return (
    <div
      ref={rootRef}
      className="relative isolate h-full overflow-hidden bg-[#ededed] text-[#181818]"
      data-work-gallery
    >
      <div
        ref={scrollRef}
        data-lenis-prevent={enabled ? '' : undefined}
        tabIndex={0}
        role="region"
        aria-label="Project gallery. Scroll, or use the arrow keys to explore projects."
        onKeyDown={keyboard}
        className={cn(
          'h-full [scrollbar-width:none] outline-offset-[-4px] focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden',
          enabled ? 'overflow-y-auto' : 'overflow-hidden',
        )}
      >
        <div className="relative" style={{ height: `${100 + (projects.length - 1) * 70}svh` }}>
          <div className="sticky top-0 h-svh overflow-hidden">
            <div className="absolute inset-0 [perspective:1100px] [transform-style:preserve-3d]">
              {projects.map((item, index) => (
                <Link
                  key={item.slug}
                  href={`/work/${item.slug}`}
                  prefetch={false}
                  data-work-card
                  aria-label={`View ${item.name}`}
                  aria-hidden={Math.abs(distanceTo(index, active, projects.length)) > 3}
                  tabIndex={index === active ? 0 : -1}
                  onClick={(event) => select(event, index)}
                  className="absolute start-[49%] top-1/2 block aspect-[910/732] w-[min(29vw,520px)] [transform:translate(-50%,-50%)] bg-[#d8d8d8] [backface-visibility:hidden] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary max-lg:start-1/2 max-lg:w-[min(64vw,380px)]"
                >
                  {Math.abs(distanceTo(index, active, projects.length)) <= 3 ? (
                    <Image
                      src={item.cover.src}
                      alt={item.cover.alt}
                      fill
                      unoptimized
                      loading={index === active ? 'eager' : 'lazy'}
                      sizes="(min-width: 1024px) 29vw, 64vw"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
              ))}
            </div>
            <aside className="pointer-events-none absolute start-5 top-[42%] w-[29%] text-[11px] leading-tight max-lg:hidden">
              <dl className="grid grid-cols-[42px_1fr_64px_1fr] gap-x-3 gap-y-2">
                <dt className="text-black/45">Role</dt>
                <dd>{project.role}</dd>
                <dt className="text-black/45">Launch</dt>
                <dd>{project.launch}</dd>
                <dt className="mt-14 text-black/45">Source</dt>
                <dd className="col-span-3 mt-14">{project.sourceAuthor ?? 'Osama Abdelnaser'}</dd>
              </dl>
            </aside>
            <div
              className="pointer-events-none absolute end-[9.5%] top-1/2 w-[19%] max-lg:hidden"
              aria-hidden="true"
            >
              {projects.map((item) => (
                <div
                  key={item.slug}
                  data-work-label
                  className="absolute start-1/2 top-0 w-full text-center"
                >
                  <p className="mb-2 text-[11px] text-black/45">{item.category}</p>
                  <h3 className="font-serif text-xl leading-none tracking-[-0.04em] uppercase">
                    {item.name}
                  </h3>
                  <span className="my-4 block text-black/30">—</span>
                  <p className="text-[11px] leading-tight">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-start justify-between p-5 text-xs">
        <h2 className="text-xl font-semibold tracking-[-0.07em] uppercase lg:ms-[12%]">
          {workContent.title}
        </h2>
        {project.sourceUrl ? (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto max-w-36 text-end text-[10px] leading-snug underline underline-offset-4"
          >
            {workContent.referenceLabel}
            <br />
            {project.sourceAuthor} ↗
          </a>
        ) : null}
      </header>
      <div className="pointer-events-none absolute start-[14%] bottom-8 z-[200] flex items-start gap-2 max-lg:start-5 max-lg:bottom-5 lg:gap-6">
        <span className="mt-1 text-[11px] leading-tight">
          Selected<span className="block lg:inline"> work</span>
        </span>
        <span
          className="text-[clamp(4rem,12vw,11rem)] leading-[0.75] tracking-[-0.11em]"
          aria-hidden="true"
        >
          {String(active + 1).padStart(2, '0')}
        </span>
        <span className="ms-2 text-[10px]">/{String(projects.length).padStart(2, '0')}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-5 bottom-[22%] z-[200] text-center lg:hidden">
        <p className="mb-2 text-[10px] text-black/50">{project.category}</p>
        <h3 className="font-serif text-xl leading-none tracking-tight uppercase">{project.name}</h3>
        <p className="mx-auto mt-3 max-w-64 text-[11px] leading-snug">{project.description}</p>
      </div>
      <p className="sr-only" aria-live="polite">
        Project {active + 1} of {projects.length}: {project.name}
      </p>
      <nav
        aria-label="Gallery controls"
        className="absolute end-5 bottom-5 z-[200] flex items-center gap-2 text-xs"
      >
        <button
          type="button"
          onClick={() => moveRef.current(activeRef.current - 1)}
          disabled={active === 0}
          aria-label="Previous project"
          className="grid size-10 cursor-pointer place-content-center rounded-full border border-black/25 text-lg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-25"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => moveRef.current(activeRef.current + 1)}
          disabled={active === projects.length - 1}
          aria-label="Next project"
          className="grid size-10 cursor-pointer place-content-center rounded-full border border-black/25 text-lg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-25"
        >
          ↓
        </button>
        <a
          href="#after-selected-work"
          className="ms-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          Continue ↓
        </a>
      </nav>
      <p className="pointer-events-none absolute start-5 bottom-5 text-[10px] max-lg:hidden">
        {workContent.scroll}
      </p>
    </div>
  );
}
