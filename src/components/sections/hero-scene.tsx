'use client';

import {
  useEffect,
  useLayoutEffect,
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
  FlowStudy,
  LaptopStudy,
  PhoneStudy,
  TokensStudy,
  ToolMark,
  SignupStudy,
  type HeroTool,
} from './hero-art';
import { canvasGrid } from './canvas-grid';
import { HeroPortfolioEntrance } from './hero-portfolio-entrance';
import { HeroMusic } from './music-deck';

const subscribeMotion = (callback: () => void) => {
  const query = window.matchMedia(motionConfig.queries.reduced);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const getReducedMotion = () => window.matchMedia(motionConfig.queries.reduced).matches;
const getServerMotion = () => false;
const toolNames: HeroTool[] = ['xd', 'figma', 'notion', 'framer', 'miro'];
const methodNotes = heroContent.method.map((step, index) => `${index + 1}. ${step}`).join('\n');
const cursorPaths = [
  [0, 0],
  [180, -230],
  [-120, -180],
  [140, 60],
  [-100, 110],
  [0, 0],
];

// Every floating card positions itself around the title (`--title-center`) and
// shrinks below the lg breakpoint. Device mockups stay straight and fully on
// screen. Below lg the poster gets its own band: tools and the switch sit above
// it, and the laptop, sticky note and user flow sit below.
const floatingBase = 'absolute group-data-[portfolio-phase=intro]/scene:invisible';
const tilted = 'z-5 [transform:rotate(var(--tilt,0deg))] max-lg:[scale:0.6]';
const floatingLayout = {
  wireframe: `${floatingBase} ${tilted} [--tilt:-2deg] top-[calc(var(--title-center)_-_282px)] left-[40px] max-lg:hidden`,
  code: `${floatingBase} ${tilted} [--tilt:-4deg] top-[calc(var(--title-center)_+_190px)] right-[262px] w-[190px] max-lg:top-[370px] max-lg:right-[-32px] md:max-lg:right-[40px]`,
  chat: `${floatingBase} ${tilted} [--tilt:2deg] top-[calc(var(--title-center)_+_202px)] left-[548px] max-lg:top-[543px] max-lg:left-[80px]`,
  design: `${floatingBase} ${tilted} [--tilt:1.5deg] top-[calc(var(--title-center)_-_268px)] right-[40px] max-lg:hidden`,
  laptop: `${floatingBase} z-5 top-[calc(var(--title-center)_+_44px)] left-[24px] max-lg:top-[324px] max-lg:left-[-134px] max-lg:[scale:0.45]`,
  phone: `${floatingBase} z-5 top-[calc(var(--title-center)_+_32px)] right-[48px] max-md:hidden md:max-lg:top-[560px] md:max-lg:right-[60px] md:max-lg:[scale:0.6]`,
  motionControl: `${floatingBase} z-12 [transform:translateX(-100%)] top-[calc(var(--title-center)_-_236px)] left-[calc(50%_-_6px)] max-lg:top-[20px] max-lg:[scale:1]`,
  music: `${floatingBase} z-12 top-[calc(var(--title-center)_-_236px)] left-[calc(50%_+_6px)] max-lg:top-[20px]`,
  commentOne: `${floatingBase} z-12 top-[calc(var(--title-center)_-_48px)] right-[60px] max-lg:hidden`,
  commentTwo: `${floatingBase} z-12 [transform:translateX(-50%)] top-[calc(var(--title-center)_+_128px)] left-[62%] max-lg:hidden`,
  tool0: `${floatingBase} z-5 top-[calc(var(--title-center)_-_250px)] left-[430px] max-lg:top-[70px] max-lg:left-[8%]`,
  tool1: `${floatingBase} z-5 top-[calc(var(--title-center)_-_254px)] right-[372px] max-lg:top-[70px] max-lg:right-[8%]`,
  tool2: `${floatingBase} z-5 top-[calc(var(--title-center)_-_84px)] left-[304px] max-lg:hidden`,
  tool3: `${floatingBase} z-5 top-[calc(var(--title-center)_-_200px)] left-[300px] max-lg:top-[640px] max-lg:left-[6%]`,
  tool4: `${floatingBase} z-5 [transform:translateX(-50%)] top-[calc(var(--title-center)_+_260px)] left-[58%] max-lg:top-[640px] max-lg:left-[88%] md:max-lg:left-[46%]`,
} as const;
type FloatingKind = keyof typeof floatingLayout;
const toolKinds = ['tool0', 'tool1', 'tool2', 'tool3', 'tool4'] as const;

const handleLayout = {
  tl: 'top-[-5px] left-[-5px]',
  tc: 'top-[-5px] left-[calc(50%_-_5px)]',
  tr: 'top-[-5px] right-[-5px]',
  bl: 'bottom-[-5px] left-[-5px]',
  bc: 'bottom-[-5px] left-[calc(50%_-_5px)]',
  br: 'bottom-[-5px] right-[-5px]',
};

const roseCursor = '[--cursor-color:color-mix(in_srgb,var(--accent-rose)_85%,var(--ink))]';
// [position and color, label text color], one per entry in heroContent.cursors.
// Each cursor starts on or beside the frame it names, like a collaborator in Figma.
const cursorLayout: [string, string][] = [
  [
    'text-primary [--cursor-color:var(--primary)] top-[calc(var(--title-center)_+_120px)] right-[300px] max-lg:top-[560px] max-lg:right-auto max-lg:left-[66%]',
    'text-ink',
  ],
  [
    `text-accent-rose ${roseCursor} top-[calc(var(--title-center)_+_372px)] left-[560px] max-lg:top-[690px] max-lg:left-[40%]`,
    'text-white',
  ],
  [
    'text-accent-warm [--cursor-color:var(--secondary)] top-[calc(var(--title-center)_-_130px)] left-[236px] max-lg:hidden',
    'text-ink',
  ],
  [
    'text-primary [--cursor-color:var(--primary)] top-[calc(var(--title-center)_+_40px)] right-[230px] max-lg:hidden',
    'text-ink',
  ],
  [
    `text-accent-rose ${roseCursor} top-[calc(var(--title-center)_-_180px)] right-[360px] max-lg:hidden`,
    'text-white',
  ],
];

const panelShadow = '[box-shadow:0_1px_4px_#17284f1a]';

function FloatingCard({
  kind,
  delay,
  children,
}: {
  kind: FloatingKind;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div className={floatingLayout[kind]} data-hero-enter data-delay={delay} aria-hidden="true">
      <div data-hero-scroll>
        <div data-hero-parallax>
          <div className="relative" data-hero-float>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Comment({ index }: { index: 0 | 1 }) {
  return (
    <div
      className={`flex min-h-[60px] w-max max-w-[310px] items-center gap-[10px] rounded-[22px_22px_22px_0] bg-[#fffffff5] px-[17px] py-[10px] ${panelShadow}`}
    >
      <span className="grid size-[30px] shrink-0 place-items-center rounded-[50%] bg-ink text-[10px] font-bold text-secondary">
        oa.
      </span>
      <div>
        <p className="mt-0 mb-[4px] text-[11px] leading-[14px]">
          <strong>Osama</strong>{' '}
          <span className="ms-[4px] text-[10px] text-[#6d7583]">{heroContent.role}</span>
        </p>
        <p className="m-0 text-[12px] leading-[16px] whitespace-nowrap">
          {heroContent.comments[index]}
        </p>
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
  const phase = !ready ? 'waiting' : portfolioReady ? 'ready' : 'intro';

  // Mirror the phase onto the hero section so its header can react without
  // `:has()`, which re-matched on every animated frame inside the scene.
  useLayoutEffect(() => {
    const hero = rootRef.current?.closest<HTMLElement>('[data-hero]');
    if (!hero) return;
    hero.dataset.portfolioPhase = phase;
    hero.dataset.portfolioActive = String(ready);
  }, [phase, ready]);

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
              scrub: 1,
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
                count: methodNotes.length,
                roundProps: 'count',
                duration: 5,
                repeat: -1,
                repeatDelay: 2.5,
                ease: 'none',
                paused: true,
                onUpdate: () => {
                  if (pen.count !== previous) {
                    code.textContent = methodNotes.slice(0, pen.count);
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
            if (code) code.textContent = methodNotes;
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
      className="group/scene relative isolate h-[calc(100svh_-_var(--hero-header-height))] min-h-[550px] w-full overflow-visible [--title-center:calc(50%_-_50px)] max-lg:[--title-center:calc(50%_-_97px)]"
      data-hero-scene
      data-portfolio-phase={phase}
      data-portfolio-active={ready}
    >
      <div
        className="absolute inset-0 -z-1 overflow-hidden [transition:opacity_900ms_ease] group-data-[portfolio-phase=intro]/scene:invisible group-data-[portfolio-phase=intro]/scene:opacity-0 motion-reduce:[transition:none]"
        style={{ backgroundImage: canvasGrid }}
        aria-hidden="true"
      >
        <div
          className="size-[60px] bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] opacity-0 will-change-[transform,opacity]"
          data-hero-glow
        />
      </div>
      {/* Once the poster is active the draggable title is kept for assistive tech only. */}
      <div className="absolute top-(--title-center) left-1/2 z-10 [translate:-50%_-50%] group-data-[portfolio-active=true]/scene:pointer-events-none group-data-[portfolio-active=true]/scene:h-px! group-data-[portfolio-active=true]/scene:w-px! group-data-[portfolio-active=true]/scene:overflow-hidden group-data-[portfolio-active=true]/scene:[clip-path:inset(50%)] max-lg:w-[80%]">
        <div
          ref={titleRef}
          className="relative border border-dashed border-[#5b8dfb55] px-[20px] py-[46px] max-lg:grid max-lg:h-[100px] max-lg:place-items-center max-lg:px-[8px] max-lg:py-[16px]"
          data-hero-selection
        >
          {(Object.keys(handleLayout) as (keyof typeof handleLayout)[]).map((corner) => (
            <span
              key={corner}
              className={`pointer-events-none absolute size-[10px] border border-[#5b8dfb66] bg-white ${handleLayout[corner]}`}
              aria-hidden="true"
            />
          ))}
          <h1
            className="m-0 text-[180px] leading-[95px] font-bold tracking-[-1.8px] whitespace-nowrap text-primary max-lg:text-[64px] max-lg:leading-[64px]"
            aria-label={`${heroContent.name} — ${heroContent.role}`}
          >
            <button
              type="button"
              className="block cursor-grab touch-none bg-none p-0 text-inherit select-none [border:0] [font:inherit] focus-visible:rounded-[4px] focus-visible:outline-accent-rose active:cursor-grabbing"
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
        <SignupStudy />
      </FloatingCard>
      {/* A sticky note that types the brief's four-step method. */}
      <FloatingCard kind="code" delay={1.6}>
        <div
          className={`aspect-square rounded-[4px_4px_4px_22px] bg-secondary px-[18px] pt-[16px] text-ink ${panelShadow}`}
        >
          <p className="m-0 text-[11px] leading-[14px] font-semibold tracking-[1.2px] uppercase opacity-60">
            How I think
          </p>
          <pre className="mt-[10px] mb-0 font-sans text-[16px] leading-[25px] font-semibold tracking-[-0.2px] whitespace-pre-wrap">
            <span data-hero-code>{methodNotes}</span>
          </pre>
        </div>
      </FloatingCard>
      <FloatingCard kind="chat" delay={1.4}>
        <FlowStudy />
      </FloatingCard>
      <FloatingCard kind="design" delay={0.4}>
        <TokensStudy />
      </FloatingCard>
      <FloatingCard kind="laptop" delay={0.8}>
        <LaptopStudy />
      </FloatingCard>
      <FloatingCard kind="phone" delay={1.1}>
        <PhoneStudy />
      </FloatingCard>
      <div className={floatingLayout.motionControl} data-hero-enter data-delay={0.9}>
        <button
          type="button"
          className={`group/switch flex h-[50px] cursor-pointer items-center gap-[20px] rounded-[20px] bg-[#fffffff2] px-[15px] text-[13px] text-ink [border:0] ${panelShadow} disabled:cursor-default max-lg:h-[38px] max-lg:gap-[8px] max-lg:px-[12px] max-lg:text-[11px]`}
          role="switch"
          aria-label="Ambient motion"
          aria-checked={motionEnabled && !reduced}
          disabled={reduced}
          onClick={() => setMotionEnabled((enabled) => !enabled)}
        >
          <span>{heroContent.motionLabel}</span>
          <span
            className="flex h-[24px] w-[40px] items-center rounded-[20px] bg-primary p-px group-aria-[checked=false]/switch:bg-[#d9deea] max-lg:h-[18px] max-lg:w-[30px]"
            aria-hidden="true"
          >
            <span className="block size-[22px] [translate:16px_0] rounded-[50%] bg-white [transition:translate_180ms_ease] group-aria-[checked=false]/switch:[translate:0_0]! motion-reduce:[transition:none] max-lg:size-[16px] max-lg:[translate:12px_0]" />
          </span>
        </button>
      </div>
      <div className={floatingLayout.music} data-hero-enter data-delay={1}>
        <HeroMusic />
      </div>
      <FloatingCard kind="commentOne" delay={1.2}>
        <Comment index={0} />
      </FloatingCard>
      <FloatingCard kind="commentTwo" delay={1.8}>
        <Comment index={1} />
      </FloatingCard>
      {toolNames.map((tool, index) => (
        <FloatingCard key={tool} kind={toolKinds[index] ?? 'tool0'} delay={0.3 + index * 0.12}>
          <span
            className={`flex size-[60px] items-center justify-center rounded-[10px] bg-[#fffffff2] p-[15px] ${panelShadow} max-lg:size-[40px] max-lg:p-[10px]`}
          >
            <ToolMark kind={tool} />
          </span>
        </FloatingCard>
      ))}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
        {heroContent.cursors.map((label, index) => (
          <div
            className={`absolute flex flex-col items-start [filter:drop-shadow(0_1px_1px_#17284f22)] group-data-[portfolio-phase=intro]/scene:invisible ${cursorLayout[index]?.[0] ?? ''}`}
            key={label}
            data-hero-cursor
          >
            <svg className="h-[17px] w-[15px]" viewBox="0 0 22 24" fill="none">
              <path
                d="M5 2 18 9.3 11 11 7 18Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`mt-[2px] ml-[9px] inline-block rounded-[0_5px_5px] bg-[var(--cursor-color,var(--primary))] px-[6px] text-[13px] leading-[19px] font-medium whitespace-nowrap max-lg:px-[4px] max-lg:text-[10px] max-lg:leading-[15px] ${cursorLayout[index]?.[1] ?? 'text-ink'}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
