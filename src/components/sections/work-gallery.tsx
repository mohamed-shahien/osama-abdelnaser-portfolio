'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { Arrow } from '@/components/ui/arrow';
import { workContent } from '@/content/work-copy';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';
import { createWorkRenderer, type WorkFrame } from '@/lib/motion/work-renderer';
import type { WorkImage, WorkProject } from '@/types/work';
import { TransitionLink } from './page-transition';
import { WorkBadges } from './work-badges';
import { WorkCounter } from './work-counter';

type GalleryItem = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  support: string;
  date: string;
  cover: WorkImage;
} & ({ kind: 'project'; project: WorkProject } | { kind: 'more' });
const moreCard: GalleryItem = {
  kind: 'more',
  slug: 'all-projects',
  name: 'All projects',
  category: 'The full collection',
  summary: 'More work. The same curiosity. Open the rest of the collection and keep exploring.',
  support: 'Web, Salla and Zid',
  date: '',
  cover: {
    src: '/work/all-projects.svg',
    width: 910,
    height: 732,
    alt: 'ALL PROJECTS — open the complete collection',
  },
};
const clamp = (value: number, last: number) => Math.max(0, Math.min(last, value));
const part = (value: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (value - from) / (to - from)));
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

/**
 * The deck's assembly, driven by the push that reveals it: the showcase writes
 * `progress` (0 hidden, 1 assembled) and calls `apply`, which the gallery owns.
 */
export type GalleryAssembly = { progress: number; apply: (progress: number) => void };

export default function WorkGallery({
  projects: initialProjects,
  total,
  enabled,
  assembly,
}: {
  projects: readonly WorkProject[];
  total: number;
  enabled: boolean;
  assembly: GalleryAssembly;
}) {
  const rootRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLCanvasElement>(null);
  const [collection, setCollection] = useState<readonly WorkProject[]>(initialProjects);
  const [loading, setLoading] = useState(false),
    [, setError] = useState('');
  const [active, setActive] = useState(0),
    [webgl, setWebgl] = useState(false);
  const hasMore = collection.length < total;
  const items = useMemo<GalleryItem[]>(
    () => [
      ...collection.map((project) => ({ ...project, kind: 'project' as const, project })),
      ...(hasMore ? [moreCard] : []),
    ],
    [collection, hasMore],
  );
  const itemsRef = useRef(items),
    activeRef = useRef(0);
  const moveRef = useRef<(index: number) => void>(() => {}),
    replaceRef = useRef<() => void>(() => {});
  const requestRef = useRef<AbortController | null>(null);
  const restoreFocusRef = useRef(false);
  // Read live by the deck, so opening the gate never rebuilds the WebGL renderer.
  const enabledRef = useRef(enabled),
    wakeRef = useRef<() => void>(() => {});
  const project = items[active] ?? items[0];

  useEffect(() => {
    itemsRef.current = items;
    replaceRef.current();
  }, [items]);
  useEffect(() => () => requestRef.current?.abort(), []);
  // The copy beside the deck turns over with the card: each line rises in, one
  // after another, so a new project reads as a new page.
  const copyKey = project?.slug ?? '';
  const firstCopy = useRef(true);
  useGSAP(
    () => {
      if (firstCopy.current) {
        firstCopy.current = false;
        return;
      }
      if (!window.matchMedia(motionConfig.queries.full).matches) return;
      const lines = rootRef.current?.querySelectorAll<HTMLElement>('[data-copy-line]');
      if (!lines?.length) return;
      gsap.fromTo(
        lines,
        { yPercent: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        {
          yPercent: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.05,
          overwrite: true,
          clearProps: 'clipPath,transform,opacity',
        },
      );
    },
    { dependencies: [copyKey], scope: rootRef },
  );
  useEffect(() => {
    enabledRef.current = enabled;
    wakeRef.current();
  }, [enabled]);
  const loadMore = async () => {
    if (requestRef.current || !hasMore) return;
    const controller = new AbortController();
    restoreFocusRef.current = Boolean(rootRef.current?.contains(document.activeElement));
    requestRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/work', { signal: controller.signal });
      if (!response.ok) throw new Error('Collection unavailable');
      const data = (await response.json()) as { projects: WorkProject[]; total: number };
      if (!Array.isArray(data.projects) || data.total !== total)
        throw new Error('Invalid collection');
      const known = new Set(collection.map((item) => item.slug));
      const extra = data.projects.filter((item) => !known.has(item.slug));
      if (!extra.length) throw new Error('No additional projects');
      const first = extra[0];
      if (first) {
        const cover = new window.Image();
        cover.src = first.cover.src;
        await cover.decode().catch(() => {});
      }
      if (!controller.signal.aborted) setCollection((previous) => [...previous, ...extra]);
    } catch {
      if (!controller.signal.aborted)
        setError('Couldn’t load the collection. Click the card to try again.');
    } finally {
      requestRef.current = null;
      setLoading(false);
    }
  };

  useGSAP(
    () => {
      const root = rootRef.current,
        canvas = canvasRef.current;
      if (!root || !canvas) return;
      const media = gsap.matchMedia();
      media.add(
        { full: motionConfig.queries.full, reduced: motionConfig.queries.reduced },
        (context) => {
          const reduced = Boolean(context.conditions?.reduced);
          let cards = Array.from(root.querySelectorAll<HTMLElement>('[data-work-card]'));
          let labels = Array.from(root.querySelectorAll<HTMLElement>('[data-work-label]'));
          const last = () => itemsRef.current.length - 1;
          const savedIndex = clamp(activeRef.current, last());
          const frame: WorkFrame = {
            current: savedIndex,
            speed: 0,
            spacing: 7,
            focus: 1,
            mouse: 0,
            hover: itemsRef.current.map(() => 0),
          };
          let target = savedIndex,
            pending = 0,
            mouseTarget = 0,
            hoverIndex = -1;
          const hoverStarts = itemsRef.current.map(() => 0),
            hoverTimes = itemsRef.current.map(() => 1);
          let inView = false,
            ticking = false,
            disposed = false,
            assembled = reduced ? 1 : assembly.progress;
          let width = root.clientWidth,
            height = root.clientHeight,
            lastWheel = 0,
            snapTimer: ReturnType<typeof setTimeout> | undefined;
          const styles = new Map<HTMLElement, Map<string, string>>();
          const style = (node: HTMLElement, key: string, value: string) => {
            let cache = styles.get(node);
            if (!cache) {
              cache = new Map();
              styles.set(node, cache);
            }
            if (cache.get(key) === value) return;
            cache.set(key, value);
            node.style.setProperty(key, value);
          };
          let renderer: ReturnType<typeof createWorkRenderer>;
          const selectActive = (index: number) => {
            if (index === activeRef.current) return;
            activeRef.current = index;
            setActive(index);
            const selected = itemsRef.current[index];
            if (selected?.kind === 'project')
              try {
                sessionStorage.setItem('osama:selected-work', selected.slug);
              } catch {
                /* Optional. */
              }
          };
          const paint = () => {
            if (disposed || document.hidden || !inView) return;
            // Nothing to draw until the push starts revealing the deck.
            if (!enabledRef.current && assembled <= 0) return;
            const selected = clamp(Math.round(frame.current), last());
            selectActive(selected);
            if (root.dataset.workIndex !== String(selected))
              root.dataset.workIndex = String(selected);
            const bounds = renderer?.draw(frame),
              visible = new Set<number>();
            if (bounds)
              bounds
                .sort((a, b) => b.depth - a.depth)
                .forEach((bound, order) => {
                  const card = cards[bound.index];
                  if (!card) return;
                  visible.add(bound.index);
                  style(card, 'visibility', 'visible');
                  style(card, 'z-index', String(order + 1));
                  style(
                    card,
                    'clip-path',
                    `polygon(${bound.points.map((p) => `${p[0].toFixed(2)}px ${p[1].toFixed(2)}px`).join(',')})`,
                  );
                });
            cards.forEach((card, index) => {
              if (renderer) {
                if (!visible.has(index)) style(card, 'visibility', 'hidden');
              } else
                style(
                  card,
                  'visibility',
                  Math.abs(index - frame.current) < 0.5 ? 'visible' : 'hidden',
                );
            });
            const reveal = part(assembled, 0.55, 1);
            labels.forEach((label, index) => {
              const distance = index - frame.current;
              style(
                label,
                'transform',
                `translate(-50%,calc(-50% + ${(distance * 178).toFixed(2)}px))`,
              );
              const base = Math.abs(distance) < 0.5 ? 1 : Math.abs(distance) < 2.8 ? 0.2 : 0;
              style(label, 'opacity', String(Math.round(base * reveal * 1000) / 1000));
            });
            const progress = root.querySelector<HTMLElement>('[data-work-progress]');
            if (progress)
              style(
                progress,
                'transform',
                `scaleX(${((frame.current + 1) / (last() + 1)).toFixed(4)})`,
              );
          };
          const stop = () => {
            if (ticking) {
              gsap.ticker.remove(tick);
              ticking = false;
            }
            if (root.dataset.workAnimating !== 'false') root.dataset.workAnimating = 'false';
          };
          const wake = () => {
            if (!ticking && inView && !document.hidden && enabledRef.current) {
              ticking = true;
              root.dataset.workAnimating = 'true';
              gsap.ticker.add(tick);
            }
          };
          const tick = () => {
            if (!inView || document.hidden || !enabledRef.current) {
              stop();
              return;
            }
            const ratio = Math.min(3, gsap.ticker.deltaRatio(60));
            if (assembled >= 1) {
              if (Math.abs(pending) > 0.001) {
                const step = pending * (1 - Math.pow(0.925, ratio));
                pending -= step;
                target = clamp(target + step, last());
                frame.speed += step;
              } else pending = 0;
              frame.current +=
                (target - frame.current) * (reduced ? 1 : 1 - Math.pow(0.953, ratio));
              if (Math.abs(frame.current - target) < 0.0005) frame.current = target;
            }
            frame.speed *= Math.pow(0.829, ratio);
            frame.mouse += (mouseTarget - frame.mouse) * (1 - Math.pow(0.95, ratio));
            if (Math.abs(frame.mouse - mouseTarget) < 0.0001) frame.mouse = mouseTarget;
            let hoverMoving = false;
            frame.hover.forEach((_, index) => {
              const next = index === hoverIndex ? 1 : 0,
                time = Math.min(1, (hoverTimes[index] ?? 1) + ratio / 60),
                start = hoverStarts[index] ?? 0;
              hoverTimes[index] = time;
              frame.hover[index] = start + (next - start) * (1 - Math.pow(1 - time, 5));
              if (time < 1) hoverMoving = true;
            });
            paint();
            if (
              Math.abs(target - frame.current) < 0.0005 &&
              Math.abs(frame.speed) < 0.0001 &&
              !pending &&
              frame.mouse === mouseTarget &&
              !hoverMoving
            )
              stop();
          };
          try {
            if (!reduced) renderer = createWorkRenderer(canvas, itemsRef.current, paint);
          } catch {
            /* Keep the image fallback usable without WebGL. */
          }
          if (renderer) {
            renderer.resize(width, height);
            setWebgl(true);
          } else setWebgl(false);
          replaceRef.current = () => {
            cards = Array.from(root.querySelectorAll<HTMLElement>('[data-work-card]'));
            labels = Array.from(root.querySelectorAll<HTMLElement>('[data-work-label]'));
            renderer?.updateProjects(itemsRef.current);
            while (frame.hover.length < itemsRef.current.length) {
              frame.hover.push(0);
              hoverStarts.push(0);
              hoverTimes.push(1);
            }
            target = clamp(target, last());
            paint();
            if (restoreFocusRef.current) {
              root.focus({ preventScroll: true });
              restoreFocusRef.current = false;
            }
            wake();
          };
          // The deck rolls in from behind, fans out and turns into place as the
          // push pulls the page away, landing on the project the reader was on
          // (the first one on a first visit). Scrubbed by scroll, so it plays back
          // in reverse when the reader returns. Keeping that project matters: a
          // layout refresh can dip the push for a moment, and the deck must not
          // throw the reader back to the start.
          const copy = Array.from(root.querySelectorAll<HTMLElement>('[data-work-copy]'));
          let wasAssembling = assembled < 1;
          let home = savedIndex;
          const assemble = () => {
            if (assembled < 1) {
              if (!wasAssembling) home = clamp(Math.round(target), last());
              wasAssembling = true;
              frame.current = home - 2.4 * (1 - easeOut(assembled));
              frame.speed = 0;
              target = home;
              pending = 0;
              frame.spacing = 1.2 + 5.8 * easeOut(part(assembled, 0.1, 1));
              frame.focus = easeOut(part(assembled, 0.3, 1));
            } else if (wasAssembling) {
              wasAssembling = false;
              frame.current = home;
              frame.spacing = 7;
              frame.focus = 1;
            }
            copy.forEach((node, index) => {
              const shown = easeOut(part(assembled, 0.55 + index * 0.08, 0.86 + index * 0.05));
              style(node, 'opacity', String(Math.round(shown * 1000) / 1000));
              style(node, 'transform', `translate3d(0,${((1 - shown) * 12).toFixed(2)}px,0)`);
            });
          };
          assemble();
          assembly.apply = (progress) => {
            const next = reduced ? 1 : progress;
            if (next === assembled) return;
            assembled = next;
            assemble();
            paint();
          };
          const start = () => {
            if (!inView || document.hidden) return;
            paint();
            wake();
          };
          wakeRef.current = () => {
            paint();
            wake();
          };
          moveRef.current = (index) => {
            if (!enabledRef.current) return;
            pending = 0;
            target = clamp(index, last());
            if (reduced) {
              frame.current = target;
              paint();
            } else wake();
          };
          const snap = () => {
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => {
              target = clamp(Math.round(target + pending), last());
              pending = 0;
              wake();
            }, 240);
          };
          const atBoundary = (delta: number) =>
            delta > 0
              ? frame.current >= last() - 0.025 && target >= last() - 0.025
              : frame.current <= 0.025 && target <= 0.025;
          const wheel = (event: WheelEvent) => {
            if (!enabledRef.current || !inView || event.ctrlKey || document.hidden) return;
            const delta =
              Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (!delta || atBoundary(delta)) return;
            event.preventDefault();
            (event as WheelEvent & { lenisStopPropagation?: boolean }).lenisStopPropagation = true;
            const trackpad =
              event.deltaMode === 0 && (Math.abs(event.deltaX) > 0 || Math.abs(event.deltaY) < 24);
            if (trackpad) {
              const step = Math.max(
                -0.14,
                Math.min(
                  0.14,
                  ((delta * 10.8) / height) * Math.min(1, 1512 / width, 982 / height) * 0.21,
                ),
              );
              target = clamp(target + step, last());
              frame.speed += step;
            } else if (performance.now() - lastWheel > 90) {
              pending = Math.max(-target, Math.min(last() - target, pending + Math.sign(delta)));
              lastWheel = performance.now();
            }
            if (reduced) {
              target = clamp(Math.round(target + pending), last());
              pending = 0;
              frame.current = target;
              paint();
            } else {
              snap();
              wake();
            }
          };
          let touch: { x: number; y: number; axis: 'x' | 'y' | null } | undefined;
          const touchStart = (event: TouchEvent) => {
            const point = event.touches[0];
            if (point) touch = { x: point.clientX, y: point.clientY, axis: null };
          };
          const touchMove = (event: TouchEvent) => {
            const point = event.touches[0];
            if (!point || !touch || !enabledRef.current) return;
            const dx = point.clientX - touch.x,
              dy = point.clientY - touch.y;
            if (!touch.axis) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) < (width <= 767 ? 18 : 6)) return;
              touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }
            const delta = touch.axis === 'x' ? dx : dy;
            if (atBoundary(-delta)) return;
            event.preventDefault();
            (event as TouchEvent & { lenisStopPropagation?: boolean }).lenisStopPropagation = true;
            const step = Math.max(
              -0.2,
              Math.min(
                0.2,
                ((-delta * 10.8) / height) *
                  (width <= 767 ? 1.15 : 2.6) *
                  Math.min(1, 1512 / width, 982 / height),
              ),
            );
            target = clamp(target + step, last());
            frame.speed += step;
            touch.x = point.clientX;
            touch.y = point.clientY;
            wake();
          };
          const touchEnd = () => {
            touch = undefined;
            snap();
          };
          const hoverTo = (next: number) => {
            if (next === hoverIndex) return;
            const previous = hoverIndex;
            hoverIndex = next;
            [previous, next].forEach((index) => {
              if (index >= 0) {
                hoverStarts[index] = frame.hover[index] ?? 0;
                hoverTimes[index] = 0;
              }
            });
          };
          const pointer = (event: PointerEvent) => {
            const card = (event.target as Element).closest<HTMLElement>('[data-work-card]');
            hoverTo(card ? Number(card.dataset.index) : -1);
            if (width > 767)
              mouseTarget = ((event.clientX - root.getBoundingClientRect().left) / width) * 2 - 1;
            wake();
          };
          const leave = () => {
            hoverTo(-1);
            mouseTarget = 0;
            wake();
          };
          const observer = new IntersectionObserver(
            ([entry]) => {
              inView = Boolean(entry?.isIntersecting);
              if (inView) start();
              else stop();
            },
            { threshold: 0.1 },
          );
          observer.observe(root);
          const resize = new ResizeObserver(() => {
            width = root.clientWidth;
            height = root.clientHeight;
            renderer?.resize(width, height);
            paint();
          });
          resize.observe(root);
          const visibility = () => {
            if (document.hidden) stop();
            else start();
          };
          document.addEventListener('visibilitychange', visibility);
          root.addEventListener('wheel', wheel, { passive: false });
          root.addEventListener('touchstart', touchStart, { passive: true });
          root.addEventListener('touchmove', touchMove, { passive: false });
          root.addEventListener('touchend', touchEnd);
          root.addEventListener('pointermove', pointer);
          root.addEventListener('pointerleave', leave);
          paint();
          return () => {
            disposed = true;
            stop();
            assembly.apply = () => {};
            wakeRef.current = () => {};
            renderer?.dispose();
            observer.disconnect();
            resize.disconnect();
            clearTimeout(snapTimer);
            document.removeEventListener('visibilitychange', visibility);
            root.removeEventListener('wheel', wheel);
            root.removeEventListener('touchstart', touchStart);
            root.removeEventListener('touchmove', touchMove);
            root.removeEventListener('touchend', touchEnd);
            root.removeEventListener('pointermove', pointer);
            root.removeEventListener('pointerleave', leave);
            styles.forEach((properties, node) =>
              properties.forEach((_, key) => node.style.removeProperty(key)),
            );
            moveRef.current = () => {};
            replaceRef.current = () => {};
          };
        },
      );
      return () => media.revert();
    },
    { scope: rootRef },
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
    let next: number | undefined;
    if (event.key === 'Home' || event.key === 'End')
      next = event.key === 'Home' ? 0 : items.length - 1;
    else if (offsets[event.key]) next = activeRef.current + (offsets[event.key] ?? 0);
    if (next === undefined || next < 0 || next >= items.length) return;
    event.preventDefault();
    rootRef.current?.focus({ preventScroll: true });
    moveRef.current(next);
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
  const cardClass = webgl
    ? 'absolute inset-0 block cursor-pointer focus-visible:bg-primary/10'
    : 'absolute start-1/2 top-1/2 block aspect-[910/732] w-[64vw] max-w-[520px] [transform:translate(-50%,-50%)] focus-visible:outline-2 focus-visible:outline-primary lg:w-[29vw]';
  const cover = (item: GalleryItem, index: number) =>
    !webgl && index === active ? (
      <Image
        src={item.cover.src}
        alt={item.cover.alt}
        fill
        unoptimized
        sizes="(min-width:1024px) 29vw,64vw"
        className="object-cover"
      />
    ) : (
      <span className="sr-only">{item.name}</span>
    );
  return (
    <div
      ref={rootRef}
      data-work-gallery
      data-work-count={collection.length}
      data-work-total={total}
      tabIndex={0}
      role="region"
      aria-label="Project gallery. Scroll or use arrow keys. Scroll past the last card to continue."
      onKeyDown={keyboard}
      className="relative isolate h-full overflow-hidden bg-[#ededed] text-[#181818] outline-offset-[-4px] focus-visible:outline-2 focus-visible:outline-primary"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
      />
      {items.map((item, index) =>
        item.kind === 'more' ? (
          <button
            key={item.slug}
            type="button"
            data-work-card
            data-index={index}
            aria-label={loading ? 'Loading all projects' : 'Load all projects'}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
            aria-busy={loading}
            disabled={loading}
            onClick={() => void loadMore()}
            className={cardClass}
          >
            {cover(item, index)}
          </button>
        ) : (
          <TransitionLink
            key={item.slug}
            href={`/work/${item.slug}`}
            label={item.name}
            prefetch={false}
            data-work-card
            data-index={index}
            aria-label={`View ${item.name}`}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
            onClick={(event) => select(event, index)}
            className={cardClass}
          >
            {cover(item, index)}
          </TransitionLink>
        ),
      )}
      <aside
        data-work-copy
        className="pointer-events-none absolute start-[4%] top-[17%] z-50 flex w-[30%] max-w-[420px] flex-col gap-5 max-lg:hidden"
      >
        <p
          data-copy-line
          className="flex items-center gap-2 text-[11px] tracking-[0.08em] text-black/50 uppercase"
        >
          <span className="size-[7px] rounded-full bg-accent-rose" aria-hidden="true" />
          Now viewing · {project.kind === 'more' ? 'the rest' : String(active + 1).padStart(2, '0')}
        </p>
        <div className="flex flex-col gap-3">
          <span
            data-copy-line
            className="w-max rounded-full border border-black/15 px-3 py-1 text-[11px]"
          >
            {project.category}
          </span>
          <p data-copy-line className="text-[13px] leading-snug text-black/60">
            Up next ·{' '}
            <span className="text-black">{items[active + 1]?.name ?? 'the skills section'}</span>
          </p>
        </div>
        <dl
          data-copy-line
          className="grid grid-cols-[92px_1fr] gap-x-4 gap-y-3 border-t border-black/10 pt-4 text-[12px] leading-snug"
        >
          <dt className="text-black/45">Built for</dt>
          <dd>
            {project.kind === 'project' ? (
              <WorkBadges project={project.project} size="xs" />
            ) : (
              project.support
            )}
          </dd>
          <dt className="text-black/45">{project.date ? 'Delivered' : 'Collection'}</dt>
          <dd>{project.date || `${total} projects`}</dd>
          {project.kind === 'project' ? (
            <>
              <dt className="text-black/45">Inside</dt>
              <dd>
                {project.project.images.length}{' '}
                {project.project.images.length === 1 ? 'screen' : 'screens'} to scroll through
              </dd>
            </>
          ) : null}
        </dl>
        <p data-copy-line className="flex items-center gap-2 text-[12px] font-semibold">
          <span
            className="grid size-[26px] place-items-center rounded-full bg-ink text-secondary"
            aria-hidden="true"
          >
            <Arrow className="size-[14px]" />
          </span>
          {project.kind === 'more'
            ? 'Click to open the full collection'
            : 'Click the card to open the case'}
        </p>
        {project.kind === 'project' && project.project.images.length ? (
          <TransitionLink
            key={project.slug}
            href={`/work/${project.slug}`}
            label={project.name}
            prefetch={false}
            tabIndex={-1}
            aria-hidden="true"
            data-copy-line
            className="pointer-events-auto grid grid-cols-4 gap-2 border-t border-black/10 pt-4"
          >
            {project.project.images.slice(0, 4).map((image, index) => (
              <span
                key={image.src}
                className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-black/5 [box-shadow:0_1px_0_#17284f14]"
              >
                <Image
                  src={image.thumbnail ?? image.src}
                  alt=""
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
                {index === 3 && project.project.images.length > 4 ? (
                  <span className="absolute inset-0 grid place-items-center bg-ink/70 text-[12px] font-semibold text-white">
                    +{project.project.images.length - 4}
                  </span>
                ) : null}
              </span>
            ))}
          </TransitionLink>
        ) : null}
      </aside>
      <div
        className="pointer-events-none absolute end-[9.5%] top-1/2 z-50 w-[19%] max-lg:hidden"
        aria-hidden="true"
      >
        {items.map((item, index) => (
          <div
            key={item.slug}
            data-work-label
            className="absolute start-1/2 top-0 w-full text-center"
          >
            <p className="mb-2 text-[11px] text-black/45">{item.category}</p>
            <h3 className="[font-family:var(--font-work-display)] text-xl leading-none tracking-[-0.04em] uppercase">
              {item.kind === 'project' ? (
                // The card is the keyboard path; the name is a pointer shortcut.
                <TransitionLink
                  href={`/work/${item.slug}`}
                  label={item.name}
                  prefetch={false}
                  tabIndex={-1}
                  className={cn(
                    'group inline-flex items-start gap-1 underline decoration-black/20 decoration-1 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-black',
                    index === active ? 'pointer-events-auto' : 'pointer-events-none',
                  )}
                >
                  {item.name}
                  <span className="text-[0.6em] transition-transform group-hover:[transform:translate(2px,-2px)]">
                    <Arrow />
                  </span>
                </TransitionLink>
              ) : (
                item.name
              )}
            </h3>
            <span className="my-4 block text-black/30">—</span>
            <p className="text-[11px] leading-tight">{item.summary}</p>
          </div>
        ))}
      </div>
      <header
        data-work-copy
        className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-start justify-between p-5 text-xs"
      >
        <h2 className="text-xl font-medium tracking-[-0.07em] uppercase lg:ms-[12%]">
          {workContent.title}
          <sup className="ms-1 text-[11px] tracking-normal text-black/45">({total})</sup>
        </h2>
        <p className="flex items-center gap-2 self-center text-[11px] text-black/50 max-lg:hidden">
          <span className="rounded-full border border-black/15 px-2 py-1">
            <Arrow dir="left" />
          </span>
          <span className="rounded-full border border-black/15 px-2 py-1">
            <Arrow dir="right" />
          </span>
          {workContent.scroll}
        </p>
        <p className="max-w-36 text-end text-[10px] leading-snug uppercase">
          Ideas into
          <br />
          experiences.
        </p>
      </header>
      <div
        data-work-copy
        className="pointer-events-none absolute start-[14%] bottom-8 z-[200] flex items-start gap-2 max-lg:start-5 max-lg:bottom-5 lg:gap-6"
      >
        <span className="mt-1 text-[11px] leading-tight">
          Selected<span className="block lg:inline"> work</span>
        </span>
        <WorkCounter value={project.kind === 'more' ? '+' : String(active + 1).padStart(2, '0')} />
        <span className="ms-2 text-[10px]">/{String(total).padStart(2, '0')}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-5 bottom-[22%] z-[200] text-center lg:hidden">
        <p data-copy-line className="mb-2 text-[10px] text-black/50">
          {project.category}
        </p>
        <h3
          data-copy-line
          className="[font-family:var(--font-work-display)] text-xl leading-none tracking-tight uppercase"
        >
          {project.name}
        </h3>
        <p data-copy-line className="mx-auto mt-3 max-w-64 text-[11px] leading-snug">
          {project.summary}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Loading the complete collection.'
          : project.kind === 'more'
            ? 'Open all projects, or keep scrolling to continue.'
            : `Project ${active + 1} of ${total}: ${project.name}`}
      </p>
      <div
        data-work-progress
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[200] h-px origin-left bg-ink/30"
      />
    </div>
  );
}
