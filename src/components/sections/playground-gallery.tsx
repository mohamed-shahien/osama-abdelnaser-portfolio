'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { Arrow } from '@/components/ui/arrow';
import { playgroundFilters } from '@/content/playground';
import { workProjects } from '@/content/work';
import { workGroupOf, type WorkGroupId } from '@/content/work-groups';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';
import { TransitionLink } from './page-transition';
import { WorkBadges } from './work-badges';
import { workGroupDot } from './work-group-dot';

const groupLabel = Object.fromEntries(
  playgroundFilters.map((item) => [item.id, item.label]),
) as Record<string, string>;

/** Every project as a card, with a filter by kind. */
export function PlaygroundGallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('all');
  const shown =
    filter === 'all'
      ? workProjects
      : workProjects.filter((project) => workGroupOf(project) === filter);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const media = gsap.matchMedia();
      media.add(motionConfig.queries.full, () => {
        // Cards already on screen stay put, so the first row paints at once.
        const fold = window.innerHeight;
        root.querySelectorAll('[data-playground-card]').forEach((card, index) => {
          if (card.getBoundingClientRect().top < fold) return;
          gsap.from(card, {
            y: 32,
            rotate: index % 2 ? 1.2 : -1.2,
            opacity: 0,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 98%', once: true },
          });
        });
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [filter], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="min-w-0">
      <div className="sticky top-3 z-10 mb-8 flex">
        <div
          role="group"
          aria-label="Filter projects"
          className="flex max-w-full [scrollbar-width:none] gap-[3px] overflow-x-auto rounded-full bg-ink p-[5px] [box-shadow:0_8px_24px_#17284f2e]"
          data-lenis-prevent
        >
          {playgroundFilters.map((item) => {
            const pressed = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFilter(item.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] leading-none font-semibold whitespace-nowrap text-white/75 [transition:background-color_180ms_ease,color_180ms_ease] hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  pressed && 'bg-secondary text-ink hover:bg-secondary hover:text-ink',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-[8px] rounded-full ring-2 ring-white/20',
                    workGroupDot[item.id as WorkGroupId | 'all'],
                    pressed && 'ring-ink/20',
                  )}
                />
                {item.label}
                <span
                  className={cn(
                    'rounded-full bg-white/10 px-[7px] py-[3px] text-[10px] tabular-nums',
                    pressed && 'bg-ink text-secondary',
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} projects shown
      </p>
      <ul className="grid list-none grid-cols-1 gap-x-5 gap-y-12 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((project, index) => {
          const group = workGroupOf(project);
          return (
            <li key={project.slug} data-playground-card>
              <TransitionLink
                href={`/work/${project.slug}`}
                label={project.name}
                prefetch={false}
                className="group block rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span className="relative block aspect-[910/732] overflow-hidden rounded-[20px] bg-ink/5 [box-shadow:0_1px_0_#17284f14]">
                  <Image
                    src={project.cover.src}
                    width={project.cover.width}
                    height={project.cover.height}
                    alt={project.cover.alt}
                    unoptimized
                    // The first row is above the fold; the rest load as they near it.
                    loading={index < 3 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : undefined}
                    sizes="(min-width:1280px) 25vw, (min-width:640px) 38vw, 92vw"
                    className="size-full object-cover [transition:transform_720ms_cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none"
                  />
                  <span className="absolute start-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs leading-none font-semibold text-ink [box-shadow:0_2px_8px_#17284f1f]">
                    <span
                      aria-hidden="true"
                      className={cn('size-[7px] rounded-full', workGroupDot[group])}
                    />
                    {groupLabel[group]}
                  </span>
                  <span className="absolute end-3 bottom-3 rounded-full bg-ink/80 px-2 py-1 text-xs leading-none text-white tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="absolute end-3 top-3 grid size-9 scale-75 place-items-center rounded-full bg-secondary text-ink opacity-0 [transition:opacity_200ms_ease,scale_260ms_cubic-bezier(.3,1.6,.5,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    <Arrow />
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between gap-3 text-xs text-ink/75">
                  <span>{project.category}</span>
                  <span className="tabular-nums">{project.date}</span>
                </span>
                <span className="mt-1.5 block [font-family:var(--font-work-display)] text-2xl leading-none tracking-[-0.04em] text-ink uppercase [transition:color_180ms_ease] group-hover:text-primary">
                  {project.name}
                </span>
                <span className="mt-2 block text-[13px] leading-snug text-ink/70">
                  {project.summary}
                </span>
                <WorkBadges project={project} size="xs" className="mt-3" />
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
