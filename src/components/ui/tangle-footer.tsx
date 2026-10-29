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
}: TangleFooterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rootRef = useRef<HTMLElement>(null);
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
  const rings = useMemo(
    () => (width > 0 && bandHeight > 0 ? buildRings(width, bandHeight, lines, seed) : []),
    [width, bandHeight, lines, seed],
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !rings.length) return;

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
          [...rings].reverse().forEach((_ring, order) => {
            const index = rings.length - 1 - order;
            const paths = root.querySelectorAll<SVGPathElement>(
              '[data-tangle-reveal="' + index + '"]',
            );
            paths.forEach((path) => {
              const length = path.getTotalLength();
              gsap.set(path, { strokeDasharray: length + ' ' + length, strokeDashoffset: length });
            });
            drawing.to(paths, { strokeDashoffset: 0, duration: 1, ease: 'none' }, order * 0.13);
          });

          const spins = rings.flatMap((ring, index) => {
            const group = root.querySelector<SVGGElement>('[data-tangle-spin="' + index + '"]');
            if (!group) return [];
            gsap.set(group, { svgOrigin: ring.cx + ' ' + ring.cy, rotation: ring.phase * 360 });
            return [
              gsap.to(group, {
                rotation: (ring.reverse ? '-=' : '+=') + 360,
                duration: ring.duration,
                repeat: -1,
                ease: 'none',
                paused: true,
              }),
            ];
          });

          const visibility = ScrollTrigger.create({
            id: uid + '-visibility',
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: ({ isActive }) =>
              spins.forEach((spin) => (isActive ? spin.resume() : spin.pause())),
          });
          if (visibility.isActive) spins.forEach((spin) => spin.resume());
        },
        root,
      );

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [rings, uid], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      data-slot="tangle-footer"
      aria-label={label}
      className={cn('relative w-full shrink-0 overflow-hidden', className)}
      style={{
        background,
        height: bandHeight > 0 ? bandHeight : undefined,
        aspectRatio: height == null ? '2 / 1' : undefined,
      }}
    >
      {width > 0 && bandHeight > 0 ? (
        <svg
          className="absolute inset-0 size-full"
          viewBox={['0', '0', width, bandHeight].join(' ')}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {rings.map((ring, index) => (
              <g key={index}>
                <path id={uid + '-path-' + index} d={ring.d} fill="none" />
                <mask
                  id={uid + '-mask-' + index}
                  maskUnits="userSpaceOnUse"
                  x={0}
                  y={0}
                  width={width}
                  height={bandHeight}
                  style={{ maskType: 'alpha' }}
                >
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
                </mask>
              </g>
            ))}
          </defs>
          {rings.map((ring, index) => (
            <g key={index} mask={'url(#' + uid + '-mask-' + index + ')'}>
              <g data-tangle-spin={index}>
                <use
                  href={'#' + uid + '-path-' + index}
                  strokeWidth={ring.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  style={{ stroke: ribbon }}
                />
                <text
                  fontSize={ring.fontSize}
                  fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
                  fontWeight={700}
                  letterSpacing="0.05em"
                  dominantBaseline="central"
                  style={{ fill: textColor, userSelect: 'none', pointerEvents: 'none' }}
                >
                  <textPath href={'#' + uid + '-path-' + index} startOffset="0" method="align">
                    {ring.text}
                  </textPath>
                </text>
              </g>
            </g>
          ))}
        </svg>
      ) : null}
      <p className="sr-only">{(lines.length ? lines : DEFAULT_LINES).join(' ')}</p>
    </section>
  );
}

export default TangleFooter;
