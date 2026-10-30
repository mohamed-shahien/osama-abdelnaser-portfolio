'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { footerLines } from '@/content/footer';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';

export const DEFAULT_LINES = footerLines;

export type Ring = {
  d: string;
  radius: number;
  cx: number;
  cy: number;
  strokeWidth: number;
  fontSize: number;
  /** Text repeated enough to blanket the full circumference. */
  text: string;
  /** Seconds for one full revolution. */
  duration: number;
  /** Fraction of a turn (0–1) to offset the starting rotation. */
  phase: number;
  reverse: boolean;
  /** True when this ring is the interactive center CTA marquee. */
  isCta?: boolean;
};

export type TangleFooterOptions = {
  /** Phrases sampled randomly onto rings. */
  lines?: string[];
  /** Ribbon stroke color. Defaults to the approved primary blue. */
  ribbon?: string;
  /** Text fill on the ribbons. Defaults to derived dark blue ink. */
  textColor?: string;
  /**
   * Field behind the rings. Defaults to the footer's secondary yellow. Pass `"transparent"`
   * when the parent already paints the stage.
   */
  background?: string;
  /**
   * Band height in px. Omit to use half the measured width
   * (upper semicircle of a full-width nest). When set shorter
   * than that, the nest scales down to fit so rings stay intact.
   */
  height?: number;
  /** Seed for random line / marquee assignment across rings. */
  seed?: number;
  /** Accessible label. */
  label?: string;
  /** Label for the center semicircle action button filling the innermost ring. */
  ctaLabel?: string;
  /** Handler when the center semicircle button is clicked. */
  onCtaClick?: () => void;
  /** Optional handler to preload the target modal on hover/focus. */
  onCtaPreload?: () => void;
  /** Whether the controlled dialog/overlay is currently open. */
  ctaExpanded?: boolean;
  /** ID of the dialog/overlay controlled by the button. */
  ctaControls?: string;
};

export const RING_COUNT = 5;

export const K = 0.5522847498;
export const STROKE = 28;

/** Mulberry32 — deterministic PRNG so rings stay stable across re-renders. */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Perfect circle as four cubics (container clips to the upper half). */
export function circlePath(cx: number, cy: number, r: number): string {
  const o = r * K;
  return [
    `M ${(cx + r).toFixed(1)} ${cy.toFixed(1)}`,
    `C ${(cx + r).toFixed(1)} ${(cy + o).toFixed(1)} ${(cx + o).toFixed(1)} ${(cy + r).toFixed(1)} ${cx.toFixed(1)} ${(cy + r).toFixed(1)}`,
    `C ${(cx - o).toFixed(1)} ${(cy + r).toFixed(1)} ${(cx - r).toFixed(1)} ${(cy + o).toFixed(1)} ${(cx - r).toFixed(1)} ${cy.toFixed(1)}`,
    `C ${(cx - r).toFixed(1)} ${(cy - o).toFixed(1)} ${(cx - o).toFixed(1)} ${(cy - r).toFixed(1)} ${cx.toFixed(1)} ${(cy - r).toFixed(1)}`,
    `C ${(cx + o).toFixed(1)} ${(cy - r).toFixed(1)} ${(cx + r).toFixed(1)} ${(cy - o).toFixed(1)} ${(cx + r).toFixed(1)} ${cy.toFixed(1)}`,
  ].join(' ');
}

/**
 * Tile copy so the ring is fully blanketed with no visible gap.
 * Rotation makes the loop seamless, so we only need to cover the
 * circumference — no exact tile-width matching required.
 */
export function buildRingCopy(
  line: string,
  other: string,
  mix: boolean,
  circumference: number,
  fontSize: number,
): string {
  const unit = mix
    ? `${line}   ·   ${other}   ·   `
    : `${line}   ·   ${line}   ·   ${other}   ·   `;
  // Bold + letter-spacing runs wider than 0.5em — over-estimate so we never underfill.
  const unitWidth = Math.max(unit.length * fontSize * 0.72, 1);
  const repeats = Math.max(3, Math.ceil(circumference / unitWidth) + 1);
  return unit.repeat(repeats);
}

/**
 * Five concentric circles nested as an upper semicircle.
 * Outer radius fits both width and band height so a short band
 * still shows complete arches instead of an equatorial clip.
 */
export function buildRings(
  width: number,
  bandHeight: number,
  lines: string[],
  seed: number,
): Ring[] {
  const rand = mulberry32(seed);
  const cx = width / 2;
  const cy = bandHeight;
  const strokePad = STROKE / 2 + 2;
  // Full-width nest needs height ≈ width/2; if the band is shorter,
  // shrink the nest so the upper semicircle stays fully visible.
  const outer = Math.max(Math.min(width / 2 - strokePad, bandHeight - strokePad), STROKE * 4);
  const radii = Array.from({ length: RING_COUNT }, (_, i) => (outer * (i + 1)) / RING_COUNT);

  const fontSize = Math.min(24, Math.max(16, width * 0.022));
  const pool = lines.length > 0 ? lines : DEFAULT_LINES;

  return radii.map((r, i) => {
    const line = pool[Math.floor(rand() * pool.length)] ?? 'Product Design';
    const other = pool[Math.floor(rand() * pool.length)] ?? line;
    const circumference = 2 * Math.PI * r;
    const text = buildRingCopy(line, other, rand() > 0.45, circumference, fontSize);

    return {
      d: circlePath(cx, cy, r),
      radius: r,
      cx,
      cy,
      strokeWidth: STROKE,
      fontSize,
      text,
      // Keep angular pace lively but readable; outer rings a touch slower.
      duration: 42 + i * 8 + rand() * 10,
      phase: rand(),
      // Alternate direction each ring (inner → outer)
      reverse: i % 2 === 1,
    };
  });
}

export type TangleFooterProps = TangleFooterOptions & {
  className?: string;
};

/** A quarter-circle reveal, growing from the footer's baseline toward the crown. */
function risePath(ring: Ring, side: -1 | 1) {
  const { cx, cy, radius: r } = ring;
  const o = r * K;
  return [
    'M',
    cx + side * r,
    cy,
    'C',
    cx + side * r,
    cy - o,
    cx + side * o,
    cy - r,
    cx,
    cy - r,
  ].join(' ');
}

/** Original concentric text rings, with GSAP scroll-drawn masks and rotation. */
export function TangleFooter({
  className,
  lines = DEFAULT_LINES,
  ribbon = 'var(--primary)',
  textColor = 'var(--ink)',
  background = 'var(--secondary)',
  height,
  seed = 23,
  label = 'Osama’s design practice',
  ctaLabel,
  onCtaClick,
  onCtaPreload,
  ctaExpanded,
  ctaControls,
}: TangleFooterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const syncVisibilityRef = useRef<() => void>(() => {});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => setWidth(root.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const bandHeight = height ?? width / 2;
  useEffect(() => {
    syncVisibilityRef.current();
  }, [ctaExpanded]);
  const { allRings, ctaHitRadius } = useMemo(() => {
    if (width <= 0 || bandHeight <= 0) {
      return { allRings: [] as Ring[], ctaHitRadius: 0 };
    }
    const fullRings = buildRings(width, bandHeight, lines, seed);
    // Reserve a readable semicircle on compact screens. Keep the outer arches
    // in their original positions; only omit the crowded inner bands by the CTA.
    const compact = Boolean(ctaLabel) && width < 720;
    const baseRings = compact ? fullRings.slice(width < 480 ? 2 : 1) : fullRings;
    const innerRing = baseRings[0];
    if (!ctaLabel || !innerRing) {
      return { allRings: baseRings, ctaHitRadius: 0 };
    }

    const innerEdge = Math.max(0, innerRing.radius - innerRing.strokeWidth / 2);
    const strokeWidth = Math.min(STROKE, Math.max(12, Math.round(innerRing.radius * 0.2)));
    const gap = Math.max(10, Math.min(24, width * 0.035));
    const radius = compact
      ? Math.min(innerEdge - gap, Math.max(44, Math.min(68, width * 0.15))) - strokeWidth / 2
      : Math.max(
          strokeWidth * 0.75,
          Math.round(Math.min(innerRing.radius * 0.52, innerEdge - strokeWidth * 0.85) * 10) / 10,
        );
    const fontSize = Math.min(innerRing.fontSize, Math.max(10, Math.round(strokeWidth * 0.64)));
    const circumference = 2 * Math.PI * radius;
    const ctaRing: Ring = {
      d: circlePath(innerRing.cx, innerRing.cy, radius),
      radius,
      cx: innerRing.cx,
      cy: innerRing.cy,
      strokeWidth,
      fontSize,
      text: buildRingCopy(
        ctaLabel.toUpperCase(),
        ctaLabel.toUpperCase(),
        false,
        circumference,
        fontSize,
      ),
      duration: 34,
      phase: 0.12,
      reverse: !innerRing.reverse,
      isCta: true,
    };

    return {
      allRings: [ctaRing, ...baseRings],
      ctaHitRadius: Math.round((radius + strokeWidth / 2) * 10) / 10,
    };
  }, [width, bandHeight, lines, seed, ctaLabel]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !allRings.length) return;

      const media = gsap.matchMedia();
      media.add(
        motionConfig.queries.full,
        () => {
          const drawing = gsap.timeline({
            scrollTrigger: {
              id: uid + '-draw',
              trigger: root,
              start: 'clamp(top 90%)',
              end: 'clamp(bottom 72%)',
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });

          // Outer arch leads; each pair grows upward from both feet on the footer seam.
          const reveals: gsap.core.Tween[] = [];
          [...allRings].reverse().forEach((_ring, order) => {
            const index = allRings.length - 1 - order;
            const paths = root.querySelectorAll<SVGPathElement>(
              '[data-tangle-reveal="' + index + '"]',
            );
            paths.forEach((path) => {
              const length = path.getTotalLength();
              gsap.set(path, { strokeDasharray: length + ' ' + length, strokeDashoffset: length });
            });
            const reveal = gsap.to(paths, { strokeDashoffset: 0, duration: 1, ease: 'none' });
            drawing.add(reveal, order * 0.13);
            reveals[index] = reveal;
          });
          const face = root.querySelector('[data-tangle-cta-face]');
          const icon = root.querySelector('[data-tangle-cta-icon]');
          const ctaStart = (allRings.length - 1) * 0.13;
          if (face)
            drawing.fromTo(
              face,
              { scaleY: 0 },
              { scaleY: 1, duration: 1, ease: 'power2.out' },
              ctaStart,
            );
          if (icon)
            drawing.fromTo(
              icon,
              { opacity: 0, y: 6 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
              ctaStart + 0.35,
            );

          // Each ring is its own layer, turned on the compositor, so spinning never
          // repaints the text. The reveal mask must stay put while the ring turns, so
          // it is counter-rotated until the ring is fully drawn. Then it masks nothing
          // (the hidden lower half sits below the footer seam) and is dropped, so a
          // drawn ring costs no repaint at all.
          const syncs: (() => void)[] = [];
          const restores: (() => void)[] = [];
          const spins = allRings.flatMap((ring, index) => {
            const layer = root.querySelector<HTMLElement>('[data-tangle-spin="' + index + '"]');
            const masked = root.querySelector<SVGGElement>('[data-tangle-mask="' + index + '"]');
            const counter = root.querySelector<SVGGElement>(
              '[data-tangle-counter="' + index + '"]',
            );
            if (!layer || !masked || !counter) return [];
            const maskRef = masked.getAttribute('mask') ?? '';
            let state = '';
            const sync = () => {
              const progress = reveals[index]?.progress() ?? 1;
              const next = progress >= 1 ? 'drawn' : progress <= 0 ? 'hidden' : 'drawing';
              if (next !== state) {
                state = next;
                if (next === 'drawn') masked.removeAttribute('mask');
                else masked.setAttribute('mask', maskRef);
              }
              if (next !== 'drawn') {
                const angle = Number(gsap.getProperty(layer, 'rotation')) || 0;
                counter.setAttribute(
                  'transform',
                  'rotate(' + -angle + ' ' + ring.cx + ' ' + ring.cy + ')',
                );
              }
            };
            syncs.push(sync);
            restores.push(() => {
              masked.setAttribute('mask', maskRef);
              counter.removeAttribute('transform');
            });
            gsap.set(layer, {
              transformOrigin: ring.cx + 'px ' + ring.cy + 'px',
              rotation: ring.phase * 360,
            });
            sync();
            return [
              gsap.to(layer, {
                rotation: (ring.reverse ? '-=' : '+=') + 360,
                duration: ring.duration,
                repeat: -1,
                ease: 'none',
                paused: true,
                onUpdate: sync,
              }),
            ];
          });
          drawing.eventCallback('onUpdate', () => syncs.forEach((sync) => sync()));

          const visibility = ScrollTrigger.create({
            id: uid + '-visibility',
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: () => syncVisibilityRef.current(),
          });
          const syncVisibility = () => {
            const play =
              visibility.isActive &&
              !document.hidden &&
              !root.querySelector('[data-tangle-cta][aria-expanded="true"]');
            spins.forEach((spin) => (play ? spin.resume() : spin.pause()));
          };
          syncVisibilityRef.current = syncVisibility;
          document.addEventListener('visibilitychange', syncVisibility);
          syncVisibility();
          return () => {
            document.removeEventListener('visibilitychange', syncVisibility);
            syncVisibilityRef.current = () => {};
            restores.forEach((restore) => restore());
          };
        },
        root,
      );

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [allRings, uid], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      role="region"
      data-slot="tangle-footer"
      aria-label={label}
      className={cn('group/tangle relative w-full shrink-0 overflow-hidden', className)}
      style={{
        background,
        height: bandHeight > 0 ? bandHeight : undefined,
        aspectRatio: height == null ? '2 / 1' : undefined,
      }}
    >
      {width > 0 && bandHeight > 0
        ? allRings.map((ring, index) => (
            // One layer per ring, painted in the same inner-to-outer order as before.
            <div
              key={index}
              className={cn(
                'pointer-events-none absolute inset-0 will-change-transform',
                ring.isCta && 'z-20',
              )}
              data-tangle-spin={index}
            >
              <svg
                className="absolute inset-0 size-full overflow-visible"
                viewBox={['0', '0', width, bandHeight].join(' ')}
                preserveAspectRatio="xMidYMax slice"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <path id={uid + '-path-' + index} d={ring.d} fill="none" />
                  {/* Region padded past the band so the counter-rotated mask never clips. */}
                  <mask
                    id={uid + '-mask-' + index}
                    maskUnits="userSpaceOnUse"
                    x={-width}
                    y={-bandHeight}
                    width={width * 3}
                    height={bandHeight * 3}
                    style={{ maskType: 'alpha' }}
                  >
                    <g data-tangle-counter={index}>
                      {([-1, 1] as const).map((side) => (
                        <path
                          key={side}
                          data-tangle-reveal={index}
                          d={risePath(ring, side)}
                          stroke="white"
                          strokeWidth={ring.strokeWidth + 2}
                          strokeLinecap="round"
                          fill="none"
                        />
                      ))}
                    </g>
                  </mask>
                </defs>
                <g data-tangle-mask={index} mask={'url(#' + uid + '-mask-' + index + ')'}>
                  <use
                    href={'#' + uid + '-path-' + index}
                    strokeWidth={ring.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    className={
                      ring.isCta
                        ? '[stroke:var(--ink)] [transition:stroke_220ms_ease] group-has-[[data-tangle-cta]:focus-visible]/tangle:[stroke:var(--accent-rose)] group-has-[[data-tangle-cta]:hover]/tangle:[stroke:var(--accent-rose)]'
                        : undefined
                    }
                    style={ring.isCta ? undefined : { stroke: ribbon }}
                  />
                  <text
                    fontSize={ring.fontSize}
                    fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
                    fontWeight={700}
                    letterSpacing="0.05em"
                    dominantBaseline="central"
                    style={{
                      fill: ring.isCta ? 'var(--secondary)' : textColor,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    <textPath href={'#' + uid + '-path-' + index} startOffset="0" method="align">
                      {ring.text}
                    </textPath>
                  </text>
                </g>
              </svg>
            </div>
          ))
        : null}
      {ctaLabel && ctaHitRadius > 0 ? (
        <button
          type="button"
          data-tangle-cta
          onClick={onCtaClick}
          onPointerEnter={onCtaPreload}
          onFocus={onCtaPreload}
          aria-haspopup="dialog"
          aria-expanded={ctaExpanded}
          aria-controls={ctaControls}
          style={{
            width: ctaHitRadius * 2,
            height: ctaHitRadius,
            borderRadius: '9999px 9999px 0 0',
          }}
          className="group/cta absolute bottom-0 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-t-full bg-transparent after:absolute after:bottom-0 after:left-1/2 after:h-[max(100%,44px)] after:w-[max(100%,44px)] after:-translate-x-1/2 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-rose"
        >
          <span
            data-tangle-cta-face
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 origin-bottom rounded-t-full bg-ink transition-colors duration-300 group-hover/cta:bg-accent-rose group-focus-visible/cta:bg-accent-rose"
          />
          <span
            data-tangle-cta-icon
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[58%] flex justify-center text-secondary"
          >
            <svg
              width={Math.max(6, Math.min(26, ctaHitRadius * 0.25))}
              height={Math.max(6, Math.min(26, ctaHitRadius * 0.25))}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18 18 6M6 6h12v12" />
            </svg>
          </span>
          <span className="sr-only">{ctaLabel}</span>
        </button>
      ) : null}
      <p className="sr-only">{(lines.length ? lines : DEFAULT_LINES).join(' ')}</p>
    </div>
  );
}

export default TangleFooter;
