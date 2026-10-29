'use client';

import {
  useEffect,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { heroContent } from '@/content/hero';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import {
  DesignCanvas,
  LaptopStudy,
  PhoneStudy,
  ToolMark,
  WindowStudy,
  type HeroTool,
} from './hero-art';
import styles from './hero.module.css';
import { HeroPortfolioEntrance } from './hero-portfolio-entrance';

const subscribeMotion = (callback: () => void) => {
  const query = window.matchMedia(motionConfig.queries.reduced);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const getReducedMotion = () => window.matchMedia(motionConfig.queries.reduced).matches;
const getServerMotion = () => false;
const toolNames: HeroTool[] = ['xd', 'figma', 'notion', 'framer', 'miro'];
const cursorPaths = [
  [0, 0],
  [180, -230],
  [-120, -180],
  [140, 60],
  [-100, 110],
  [0, 0],
];

function FloatingCard({
  kind,
  delay,
  children,
}: {
  kind: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.floating} ${styles[kind] ?? ''}`}
      data-hero-enter
      data-delay={delay}
      aria-hidden="true"
    >
      <div data-hero-scroll>
        <div data-hero-parallax>
          <div data-hero-float>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Comment({ index }: { index: 0 | 1 }) {
  return (
    <div className={styles.commentBubble}>
      <span className={styles.avatar}>oa.</span>
      <div>
        <p className={styles.commentHeader}>
          <strong>Osama</strong> <span>{heroContent.role}</span>
        </p>
        <p className={styles.commentText}>{heroContent.comments[index]}</p>
      </div>
    </div>
  );
}

export function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);
  const dragRef = useRef<{
    id: number;
    px: number;
    py: number;
    x: number;
    y: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);
  const ready = useSiteIntroReady();
  const [portfolioReady, setPortfolioReady] = useState(false);
  const revealHero = useCallback(() => setPortfolioReady(true), []);
  const replayPortfolio = useCallback(() => {
    enteredRef.current = false;
    setPortfolioReady(false);
  }, []);
  const reduced = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerMotion);
  const [motionEnabled, setMotionEnabled] = useState(true);
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

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || !portfolioReady || !width || !motionEnabled) return;

      const media = gsap.matchMedia();
      media.add(
        motionConfig.queries.full,
        () => {
          const ambient: gsap.core.Animation[] = [];
          const cards = root.querySelectorAll<HTMLElement>('[data-hero-enter]');
          if (!enteredRef.current) {
            gsap.from(root.querySelectorAll('[data-hero-cursor]'), {
              opacity: 0,
              duration: 0.6,
              stagger: 0.08,
              delay: 0.6,
            });
            cards.forEach((card) => {
              gsap.from(card, {
                opacity: 0,
                duration: 0.8,
                delay: Number(card.dataset.delay),
                ease: 'power2.out',
              });
            });
            gsap.from(root.querySelector('[data-hero-selection]'), {
              opacity: 0,
              duration: 1,
              delay: 0.65,
            });
            enteredRef.current = true;
          }

          root.querySelectorAll<HTMLElement>('[data-hero-float]').forEach((item, index) => {
            ambient.push(
              gsap.to(item, {
                y: -7 - (index % 4) * 3,
                rotation: index % 2 ? 0.8 : -0.8,
                duration: 2.6 + index * 0.15,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
                paused: true,
              }),
            );
          });

          const stage = root.getBoundingClientRect();
          gsap.to(root.querySelectorAll('[data-hero-scroll]'), {
            y: (index) => root.clientHeight * (0.05 + (index % 5) * 0.025),
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
          root.querySelectorAll<HTMLElement>('[data-hero-cursor]').forEach((cursor, index) => {
            const box = cursor.getBoundingClientRect();
            const factor = width < 1024 ? 0.28 : 1;
            const path = gsap.timeline({ repeat: -1, paused: true, delay: index * 0.14 });
            cursorPaths.forEach(([x = 0, y = 0], point) => {
              path
                .to(cursor, {
                  x: gsap.utils.clamp(
                    stage.left - box.left + 8,
                    stage.right - box.right - 8,
                    x * factor * (index % 2 ? -1 : 1),
                  ),
                  y: gsap.utils.clamp(
                    stage.top - box.top + 8,
                    stage.bottom - box.bottom - 8,
                    y * factor,
                  ),
                  duration: 1.6 + index * 0.13,
                  ease: 'sine.inOut',
                })
                .to(
                  cursor.querySelector('span'),
                  { scale: 0.96, duration: 0.12, repeat: 1, yoyo: true },
                  '>-0.1',
                )
                .to({}, { duration: 0.45 + (point % 3) * 0.12 });
            });
            ambient.push(path);
          });

          const code = root.querySelector<HTMLElement>('[data-hero-code]');
          if (code) {
            const pen = { count: 0 };
            let previous = -1;
            ambient.push(
              gsap.to(pen, {
                count: heroContent.processNotes.length,
                roundProps: 'count',
                duration: 5,
                repeat: -1,
                repeatDelay: 2.5,
                ease: 'none',
                paused: true,
                onUpdate: () => {
                  if (pen.count !== previous) {
                    code.textContent = heroContent.processNotes.slice(0, pen.count);
                    previous = pen.count;
                  }
                },
              }),
            );
          }

          const parallax = Array.from(
            root.querySelectorAll<HTMLElement>('[data-hero-parallax]'),
          ).map((element, index) => ({
            x: gsap.quickTo(element, 'x', { duration: 0.8, ease: 'power2.out' }),
            y: gsap.quickTo(element, 'y', { duration: 0.8, ease: 'power2.out' }),
            depth: 5 + (index % 4) * 3,
          }));
          const glow = root.querySelector<HTMLElement>('[data-hero-glow]');
          gsap.set(glow, { opacity: 0 });
          const glowX = gsap.quickTo(glow, 'x', { duration: 0.45, ease: 'power3.out' });
          const glowY = gsap.quickTo(glow, 'y', { duration: 0.45, ease: 'power3.out' });
          const glowOpacity = gsap.quickTo(glow, 'opacity', { duration: 0.35, ease: 'power2.out' });
          let placed = false;
          let frame = 0;
          let pending: { x: number; y: number } | null = null;
          const flush = () => {
            frame = 0;
            if (!pending) return;
            const { x, y } = pending;
            pending = null;
            const rect = root.getBoundingClientRect();
            const px = x - rect.left;
            const py = y - rect.top;
            parallax.forEach((item) => {
              item.x((px / rect.width - 0.5) * item.depth);
              item.y((py / rect.height - 0.5) * item.depth);
            });
            const cellX = Math.floor(px / 60) * 60;
            const cellY = Math.floor(py / 60) * 60;
            if (!placed) {
              gsap.set(glow, { x: cellX, y: cellY });
              placed = true;
            } else {
              glowX(cellX);
              glowY(cellY);
            }
            glowOpacity(1);
          };
          const move = (event: globalThis.PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            pending = { x: event.clientX, y: event.clientY };
            if (!frame) frame = requestAnimationFrame(flush);
          };
          const leave = () => {
            pending = null;
            placed = false;
            parallax.forEach((item) => {
              item.x(0);
              item.y(0);
            });
            glowOpacity(0);
          };
          root.addEventListener('pointermove', move);
          root.addEventListener('pointerleave', leave);

          let inView = false;
          const sync = () =>
            ambient.forEach((animation) =>
              inView && !document.hidden ? animation.resume() : animation.pause(),
            );
          const visibility = ScrollTrigger.create({
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: ({ isActive }) => {
              inView = isActive;
              sync();
            },
          });
          inView = visibility.isActive;
          sync();
          document.addEventListener('visibilitychange', sync);

          return () => {
            root.removeEventListener('pointermove', move);
            root.removeEventListener('pointerleave', leave);
            cancelAnimationFrame(frame);
            document.removeEventListener('visibilitychange', sync);
            parallax.forEach((item) => {
              item.x.tween.kill();
              item.y.tween.kill();
            });
            if (code) code.textContent = heroContent.processNotes;
          };
        },
        root,
      );
      return () => media.revert();
    },
    {
      scope: rootRef,
      dependencies: [ready, portfolioReady, width, motionEnabled],
      revertOnUpdate: true,
    },
  );

  const bounds = () => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return null;
    const stage = root.getBoundingClientRect();
    const box = title.getBoundingClientRect();
    const x = Number(gsap.getProperty(title, 'x')) || 0;
    const y = Number(gsap.getProperty(title, 'y')) || 0;
    return {
      x,
      y,
      minX: x + stage.left - box.left + 8,
      maxX: x + stage.right - box.right - 8,
      minY: y + stage.top - box.top + 8,
      maxY: y + stage.bottom - box.bottom - 8,
    };
  };
  const onDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const range = bounds();
    if (!range) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { ...range, id: event.pointerId, px: event.clientX, py: event.clientY };
  };
  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    gsap.set(titleRef.current, {
      x: gsap.utils.clamp(drag.minX, drag.maxX, drag.x + event.clientX - drag.px),
      y: gsap.utils.clamp(drag.minY, drag.maxY, drag.y + event.clientY - drag.py),
    });
  };
  const onUp = () => {
    dragRef.current = null;
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const range = bounds();
    if (!range) return;
    const step = event.shiftKey ? 24 : 8;
    const vectors: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const vector = vectors[event.key];
    if (vector) {
      event.preventDefault();
      gsap.set(titleRef.current, {
        x: gsap.utils.clamp(range.minX, range.maxX, range.x + vector[0]),
        y: gsap.utils.clamp(range.minY, range.maxY, range.y + vector[1]),
      });
    }
    if (['Home', 'Escape', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      gsap.set(titleRef.current, { x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={rootRef}
      className={styles.scene}
      data-hero-scene
      data-portfolio-phase={!ready ? 'waiting' : portfolioReady ? 'ready' : 'intro'}
      data-portfolio-active={ready}
    >
      <div className={styles.grid} aria-hidden="true">
        <div className={styles.glow} data-hero-glow />
      </div>
      <div className={styles.titlePosition}>
        <div ref={titleRef} className={styles.selection} data-hero-selection>
          {['tl', 'tc', 'tr', 'bl', 'bc', 'br'].map((corner) => (
            <span
              key={corner}
              className={`${styles.handle} ${styles[corner]}`}
              aria-hidden="true"
            />
          ))}
          <h1 className={styles.title} aria-label={`${heroContent.name} — ${heroContent.role}`}>
            <button
              type="button"
              tabIndex={ready ? -1 : 0}
              aria-hidden={ready}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey}
              aria-label="Move Osama’s name"
              aria-describedby="hero-drag-help"
            >
              {heroContent.word}
            </button>
          </h1>
        </div>
      </div>
      <p className="sr-only" id="hero-drag-help">
        Drag to move the name. Arrow keys move it; Home or Escape resets its position.
      </p>
      <p className="sr-only">{heroContent.description}</p>
      {ready ? (
        <HeroPortfolioEntrance
          reducedMotion={reduced}
          onReady={revealHero}
          onReplay={replayPortfolio}
        />
      ) : null}

      <FloatingCard kind="wireframe" delay={0.2}>
        <WindowStudy kind="wireframe" />
      </FloatingCard>
      <FloatingCard kind="code" delay={1.6}>
        <WindowStudy kind="code" />
        <pre className={styles.codeText}>
          <span data-hero-code>{heroContent.processNotes}</span>
        </pre>
      </FloatingCard>
      <FloatingCard kind="chat" delay={1.4}>
        <WindowStudy kind="chat" />
      </FloatingCard>
      <FloatingCard kind="design" delay={0.4}>
        <DesignCanvas />
      </FloatingCard>
      <FloatingCard kind="laptop" delay={0.8}>
        <LaptopStudy />
      </FloatingCard>
      <FloatingCard kind="phone" delay={1.1}>
        <PhoneStudy />
      </FloatingCard>
      <div
        className={`${styles.floating} ${styles.motionControl}`}
        data-hero-enter
        data-delay={0.9}
      >
        <button
          type="button"
          className={styles.motionSwitch}
          role="switch"
          aria-label="Ambient motion"
          aria-checked={motionEnabled && !reduced}
          disabled={reduced}
          onClick={() => setMotionEnabled((enabled) => !enabled)}
        >
          <span>{heroContent.motionLabel}</span>
          <span className={styles.switchTrack} aria-hidden="true">
            <span />
          </span>
        </button>
      </div>
      <FloatingCard kind="commentOne" delay={1.2}>
        <Comment index={0} />
      </FloatingCard>
      <FloatingCard kind="commentTwo" delay={1.8}>
        <Comment index={1} />
      </FloatingCard>
      {toolNames.map((tool, index) => (
        <FloatingCard key={tool} kind={`tool${index}`} delay={0.3 + index * 0.12}>
          <span className={styles.tool}>
            <ToolMark kind={tool} />
          </span>
        </FloatingCard>
      ))}
      <div className={styles.cursors} aria-hidden="true">
        {heroContent.cursors.map((label, index) => (
          <div
            className={`${styles.cursor} ${styles[`cursor${index}`]}`}
            key={label}
            data-hero-cursor
          >
            <svg viewBox="0 0 22 24" fill="none">
              <path
                d="M5 2 18 9.3 11 11 7 18Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
