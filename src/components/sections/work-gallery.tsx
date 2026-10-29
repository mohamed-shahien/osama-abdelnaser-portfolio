'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { workContent } from '@/content/work-copy';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { createWorkRenderer, type WorkFrame } from '@/lib/motion/work-renderer';
import type { WorkImage, WorkProject } from '@/types/work';
import { WorkPageLink } from './work-page-transition';

type GalleryItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  role: string;
  launch: string;
  cover: WorkImage;
} & ({ kind: 'project'; project: WorkProject } | { kind: 'more' });
const moreCard: GalleryItem = {
  kind: 'more',
  slug: 'all-projects',
  name: 'All projects',
  category: 'The full collection',
  description: 'More work. The same curiosity. Open the rest of the collection and keep exploring.',
  role: 'Product & digital design',
  launch: '',
  cover: {
    src: '/work/all-projects.svg',
    width: 910,
    height: 732,
    alt: 'ALL PROJECTS — open the complete collection',
  },
};
const clamp = (value: number, last: number) => Math.max(0, Math.min(last, value));

export default function WorkGallery({
  projects: initialProjects,
  total,
  enabled,
}: {
  projects: readonly WorkProject[];
  total: number;
  enabled: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLCanvasElement>(null);
  const [collection, setCollection] = useState<readonly WorkProject[]>(initialProjects);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState('');
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
    activeRef = useRef(0),
    introPlayed = useRef(false);
  const moveRef = useRef<(index: number) => void>(() => {}),
    replaceRef = useRef<() => void>(() => {});
  const requestRef = useRef<AbortController | null>(null);
  const project = items[active] ?? items[0];

  useEffect(() => {
    itemsRef.current = items;
    replaceRef.current();
  }, [items]);
  useEffect(() => () => requestRef.current?.abort(), []);
  const loadMore = async () => {
    if (requestRef.current || !hasMore) return;
    const controller = new AbortController();
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
          let savedIndex = clamp(activeRef.current, last());
          if (!introPlayed.current)
            try {
              const saved = sessionStorage.getItem('osama:selected-work');
              const index = itemsRef.current.findIndex((p) => p.slug === saved);
              if (index >= 0) {
                savedIndex = index;
                introPlayed.current = true;
              }
            } catch {
              /* Optional navigation memory. */
            }
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
            introRunning = false;
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
            const selected = clamp(Math.round(frame.current), last());
            if (!introRunning) selectActive(selected);
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
            labels.forEach((label, index) => {
              const distance = index - frame.current;
              style(
                label,
                'transform',
                `translate(-50%,calc(-50% + ${(distance * 178).toFixed(2)}px))`,
              );
              style(
                label,
                'opacity',
                introRunning
                  ? '0'
                  : Math.abs(distance) < 0.5
                    ? '1'
                    : Math.abs(distance) < 2.8
                      ? '.2'
                      : '0',
              );
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
            if (!ticking && inView && !document.hidden && enabled) {
              ticking = true;
              root.dataset.workAnimating = 'true';
              gsap.ticker.add(tick);
            }
          };
          const tick = () => {
            if (!inView || document.hidden || !enabled) {
              stop();
              return;
            }
            const ratio = Math.min(3, gsap.ticker.deltaRatio(60));
            if (!introRunning) {
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
              !introRunning &&
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
            wake();
          };
          const intro = gsap.timeline({
            paused: true,
            onUpdate: paint,
            onComplete: () => {
              introRunning = false;
              target = savedIndex;
              frame.current = savedIndex;
              frame.spacing = 7;
              frame.focus = 1;
              root.dataset.workIntro = 'complete';
              selectActive(savedIndex);
              paint();
              wake();
            },
          });
          if (!reduced && !introPlayed.current) {
            frame.current = Math.min(last(), 5);
            frame.spacing = 0;
            frame.focus = 0;
            intro
              .to(frame, { current: savedIndex, duration: 2, ease: 'power3.out' }, 0)
              .to(frame, { spacing: 7, focus: 1, duration: 1.1, ease: 'power2.out' }, 1.06);
          }
          const start = () => {
            if (!enabled || !inView || document.hidden) return;
            if (!reduced && !introPlayed.current) {
              introPlayed.current = true;
              introRunning = true;
              root.dataset.workIntro = 'playing';
              intro.play();
            } else if (introRunning) intro.resume();
            paint();
            wake();
          };
          moveRef.current = (index) => {
            if (!enabled) return;
            if (introRunning) {
              intro.progress(1);
              introRunning = false;
            }
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
            if (!enabled || !inView || event.ctrlKey || document.hidden) return;
            const delta =
              Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (!delta || (!introRunning && atBoundary(delta))) return;
            event.preventDefault();
            if (introRunning) return;
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
            if (!point || !touch || !enabled) return;
            const dx = point.clientX - touch.x,
              dy = point.clientY - touch.y;
            if (!touch.axis) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) < (width <= 767 ? 18 : 6)) return;
              touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }
            const delta = touch.axis === 'x' ? dx : dy;
            if (!introRunning && atBoundary(-delta)) return;
            event.preventDefault();
            if (introRunning) return;
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
              else {
                stop();
                intro.pause();
              }
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
            if (document.hidden) {
              stop();
              intro.pause();
            } else start();
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
            intro.kill();
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
    { scope: rootRef, dependencies: [enabled], revertOnUpdate: true },
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
  const end = active === items.length - 1;
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
      data-lenis-prevent={enabled ? '' : undefined}
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
          <WorkPageLink
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
          </WorkPageLink>
        ),
      )}
      <aside className="pointer-events-none absolute start-5 top-[42%] z-50 w-[29%] text-[11px] leading-tight max-lg:hidden">
        <dl className="grid grid-cols-[42px_1fr_64px_1fr] gap-x-3 gap-y-2">
          <dt className="text-black/45">Role</dt>
          <dd>{project.role}</dd>
          <dt className="text-black/45">{project.launch ? 'Launch' : 'Collection'}</dt>
          <dd>{project.launch || `${total} projects`}</dd>
        </dl>
      </aside>
      <div
        className="pointer-events-none absolute end-[9.5%] top-1/2 z-50 w-[19%] max-lg:hidden"
        aria-hidden="true"
      >
        {items.map((item) => (
          <div
            key={item.slug}
            data-work-label
            className="absolute start-1/2 top-0 w-full text-center"
          >
            <p className="mb-2 text-[11px] text-black/45">{item.category}</p>
            <h3 className="[font-family:var(--font-work-display)] text-xl leading-none tracking-[-0.04em] uppercase">
              {item.name}
            </h3>
            <span className="my-4 block text-black/30">—</span>
            <p className="text-[11px] leading-tight">{item.description}</p>
          </div>
        ))}
      </div>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-start justify-between p-5 text-xs">
        <h2 className="text-xl font-medium tracking-[-0.07em] uppercase lg:ms-[12%]">
          {workContent.title}
        </h2>
        <p className="max-w-36 text-end text-[10px] leading-snug uppercase">
          Ideas into
          <br />
          experiences.
        </p>
      </header>
      <div className="pointer-events-none absolute start-[14%] bottom-8 z-[200] flex items-start gap-2 max-lg:start-5 max-lg:bottom-5 lg:gap-6">
        <span className="mt-1 text-[11px] leading-tight">
          Selected<span className="block lg:inline"> work</span>
        </span>
        <span
          className="text-[clamp(4rem,12vw,11rem)] leading-[0.75] tracking-[-0.11em]"
          aria-hidden="true"
        >
          {project.kind === 'more' ? '+' : String(active + 1).padStart(2, '0')}
        </span>
        <span className="ms-2 text-[10px]">/{String(total).padStart(2, '0')}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-5 bottom-[22%] z-[200] text-center lg:hidden">
        <p className="mb-2 text-[10px] text-black/50">{project.category}</p>
        <h3 className="[font-family:var(--font-work-display)] text-xl leading-none tracking-tight uppercase">
          {project.name}
        </h3>
        <p className="mx-auto mt-3 max-w-64 text-[11px] leading-snug">{project.description}</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Loading the complete collection.'
          : project.kind === 'more'
            ? 'Open all projects, or keep scrolling to continue.'
            : `Project ${active + 1} of ${total}: ${project.name}`}
      </p>
      <p
        className="absolute end-5 bottom-5 z-[200] max-w-40 text-end text-[11px] leading-snug"
        role={error ? 'alert' : undefined}
      >
        {error ||
          (loading ? 'Loading projects…' : end ? 'Keep scrolling to continue' : workContent.scroll)}
      </p>
      <div
        data-work-progress
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[200] h-px origin-left bg-ink/30"
      />
    </div>
  );
}
