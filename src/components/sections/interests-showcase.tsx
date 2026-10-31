'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { RingTower, type RingTowerInstance, type RingTowerRing } from '@/components/ui/ring-tower';
import { StackTower } from '@/components/ui/stack-tower';
import { interestsContent as content, type Interest } from '@/content/interests';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { mountPushCharacter } from '@/lib/motion/push-character';
import { cn } from '@/lib/utils';
import {
  playPose,
  playStage,
  POSE_TALL,
  poseCardClass,
  poseSrc,
  poses,
  spotClass,
  StageProps,
  stageOf,
} from './interest-stage';

const GROUND = '#fbf7ec';
const PER_RING = 3;
const words = content.interests.map((interest) => interest.label);
const tagged = new Set<string>(content.photos.map((photo) => photo.interest));
const labelOf = new Map<string, string>(content.interests.map((item) => [item.id, item.label]));

// Thirty photos, three to a ring, the first ones on the top ring (rings count
// from the bottom up); neighbors crawl opposite ways.
const ringCount = Math.ceil(content.photos.length / PER_RING);
const rings: RingTowerRing[] = Array.from({ length: ringCount }, (_, ring) => {
  const slot = (ringCount - 1 - ring) * PER_RING;
  return {
    speed: ring % 2 ? -0.75 : 1,
    images: content.photos.slice(slot, slot + PER_RING).map((photo) => ({
      src: photo.src,
      tag: photo.interest,
      label: labelOf.get(photo.interest) ?? '',
    })),
  };
});

const toneClass: Record<Interest['tone'], string> = {
  blue: 'bg-primary text-white',
  yellow: 'bg-secondary text-ink',
  warm: 'bg-accent-warm text-ink',
  rose: 'bg-accent-rose text-white',
  ink: 'bg-ink text-white',
  white: 'bg-white text-ink',
};
// Fixed spray directions, so the burst reads the same every time.
const spray = Array.from({ length: 10 }, (_, i) => {
  const angle = -Math.PI * 0.95 + (i / 9) * Math.PI * 1.1;
  const reach = 95 + (i % 3) * 38;
  return {
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach,
    r: (i % 2 ? 1 : -1) * (40 + i * 17),
  };
});
const pad = (n: number) => String(n).padStart(2, '0');

/** Copies the middle of the rings, as the camera sees them, into the print. */
function snapshot(track: HTMLElement) {
  const source = track.querySelector<HTMLCanvasElement>('[data-slot="ring-tower"] canvas');
  const print = track.querySelector<HTMLCanvasElement>('[data-snap]');
  const ctx = print?.getContext('2d');
  if (!source || !print || !ctx || !source.width || !source.height) return;
  const w = Math.min(source.width, source.height * (4 / 3)) * 0.8;
  const h = w * 0.75;
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, print.width, print.height);
  ctx.drawImage(
    source,
    (source.width - w) / 2,
    (source.height - h) / 2,
    w,
    h,
    0,
    0,
    print.width,
    print.height,
  );
}

/**
 * Interests, last on the page. The interest list holds still on the left, the
 * photo rings run through the scroll, and the avatar from Selected Work walks
 * in to push a card for whichever interest is hovered, then acts it out.
 */
export function InterestsShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const towerRef = useRef<RingTowerInstance | null>(null);
  const panRef = useRef(0);
  const seekRef = useRef<((progress: number) => void) | null>(null);
  const pushRef = useRef({ v: 0.06 });
  const actRef = useRef<gsap.core.Timeline | null>(null);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [replay, setReplay] = useState(0);
  const mounted = nearby && introDone;
  const shown = hovered ?? selected;
  const list: readonly Interest[] = content.interests;
  const interest = shown === null ? null : (list[shown] ?? null);

  // Mount the canvas and the avatar about a screen before the section.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const onReady = useCallback(
    (instance: RingTowerInstance | null) => {
      towerRef.current = instance;
      if (!instance) return;
      instance.setPan(panRef.current);
      if (entered) instance.enter(true);
    },
    // Only the first mount matters; `entered` later calls enter() itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // The rings pan with the scroll; the section plays its entrance once.
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
      const pan = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          panRef.current = reduced ? 0.5 : self.progress;
          towerRef.current?.setPan(panRef.current);
        },
      });
      panRef.current = reduced ? 0.5 : pan.progress;
      const entrance = ScrollTrigger.create({
        trigger: track,
        start: 'top 55%',
        end: 'max',
        onEnter: () => setEntered(true),
      });
      if (entrance.progress > 0) setEntered(true);
      return () => {
        pan.kill();
        entrance.kill();
      };
    },
    { scope: trackRef },
  );

  // The avatar, mirrored to push leftward toward the rings.
  useEffect(() => {
    const host = trackRef.current?.querySelector<HTMLElement>('[data-interest-avatar]');
    if (!host || !mounted) return;
    let alive = true;
    void mountPushCharacter(host)
      .then((render) => {
        if (!alive || !render) return;
        seekRef.current = render;
        render(pushRef.current.v);
      })
      .catch(() => {});
    return () => {
      alive = false;
      seekRef.current = null;
      host.replaceChildren();
    };
  }, [mounted]);

  // Fetch and decode the drawn poses once the section is reached, a few at a
  // time while the page is idle, so hovering the list never shows a blank.
  useEffect(() => {
    if (!entered) return;
    const ids = Object.keys(poses);
    let alive = true;
    let handle = 0;
    const idle = (run: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(run, { timeout: 800 })
        : window.setTimeout(run, 120);
    const next = () => {
      if (!alive || !ids.length) return;
      ids.splice(0, 4).forEach((id) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = poseSrc(id);
        void image.decode().catch(() => {});
      });
      handle = idle(next);
    };
    handle = idle(next);
    return () => {
      alive = false;
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle);
      window.clearTimeout(handle);
    };
  }, [entered]);

  // Entrance: the avatar walks in pushing the card, the title slaps down,
  // the list rises and the rings drop in.
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !entered) return;
      const media = gsap.matchMedia();
      media.add(
        { full: motionConfig.queries.full, reduced: motionConfig.queries.reduced },
        (context) => {
          towerRef.current?.enter(Boolean(context.conditions?.reduced));
          if (context.conditions?.reduced) return;
          const actor = track.querySelector<HTMLElement>('[data-interest-actor]');
          const letters = track.querySelectorAll<HTMLElement>('[data-title-letter]');
          const lines = track.querySelectorAll<HTMLElement>('[data-title-line]');
          const push = pushRef.current;
          const seek = () => seekRef.current?.(push.v);
          const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
          timeline
            .fromTo(
              letters,
              { yPercent: -120, rotate: (i) => (i % 2 ? 18 : -14), opacity: 0 },
              {
                yPercent: 0,
                rotate: (i) => (i % 2 ? 3 : -3),
                opacity: 1,
                duration: 1.1,
                ease: 'back.out(2.2)',
                stagger: 0.07,
              },
              0.2,
            )
            .fromTo(
              lines,
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12 },
              0.7,
            );
          if (actor) {
            const travel = () => window.innerWidth - actor.getBoundingClientRect().left + 40;
            timeline
              .fromTo(actor, { x: travel }, { x: 0, duration: 2.6, ease: 'power2.out' }, 0.3)
              .fromTo(
                push,
                { v: 0.06 },
                { v: 2.06, duration: 2.6, ease: 'power2.out', onUpdate: seek },
                0.3,
              );
          }
        },
      );
      return () => media.revert();
    },
    { scope: trackRef, dependencies: [entered, mounted] },
  );

  // Picking an interest: the rings dim everything else, the avatar shoves the
  // new card in and acts the interest out.
  useEffect(() => {
    towerRef.current?.setFocus(interest && tagged.has(interest.id) ? interest.id : null);
  }, [interest]);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !entered) return;
      const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
      if (reduced) return;
      const card = track.querySelector<HTMLElement>('[data-interest-card]');
      const actor = track.querySelector<HTMLElement>('[data-interest-actor]');
      if (!card || !actor) return;
      const push = pushRef.current;
      const seek = () => seekRef.current?.(push.v);
      const stage = stageOf(interest?.id);
      const q = gsap.utils.selector(track);
      actRef.current?.kill();
      const tl = gsap.timeline();
      actRef.current = tl;
      gsap.set(actor, { rotate: 0, x: 0, y: 0 });
      gsap.set(q('[data-fx-flash]'), { opacity: 0 });
      if (stage.look === 'polaroid') {
        // The print leaves the camera after the flash and floats to its spot.
        tl.call(() => snapshot(track), [], 0.4).fromTo(
          card,
          { x: 150, y: 120, scale: 0.25, rotate: 24, opacity: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotate: stage.tilt,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
          },
          0.45,
        );
        tl.fromTo(
          q('[data-develop]'),
          { opacity: 1 },
          { opacity: 0, duration: 1.6, ease: 'power1.in' },
          0.9,
        );
      } else {
        tl.fromTo(
          card,
          { scale: 0.7, rotate: stage.tilt - 12, opacity: 0, y: 14 },
          { scale: 1, rotate: stage.tilt, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' },
          0.15,
        );
      }
      if (!interest) {
        tl.to(push, { v: push.v + 0.38, duration: 0.85, ease: 'power2.out', onUpdate: seek }, 0);
        tl.fromTo(
          actor,
          { x: 18 },
          { x: 0, duration: 0.85, ease: 'power3.out', immediateRender: false },
          0,
        );
        return;
      }
      const figure = q('[data-interest-pose]')[0];
      if (figure) playPose(tl, q, interest.id, figure);
      else playStage(tl, q, interest.id, actor, push, seek);
      switch (interest.act) {
        case 'flash':
          tl.fromTo(
            q('[data-fx-flash]'),
            { opacity: 0 },
            { opacity: 0.92, duration: 0.08, ease: 'none' },
            0.35,
          ).to(q('[data-fx-flash]'), { opacity: 0, duration: 0.7, ease: 'power2.out' });
          break;
        case 'waves':
          tl.fromTo(
            q('[data-fx-wave]'),
            { scale: 0.3, opacity: 0.95 },
            { scale: 1.6, opacity: 0, duration: 1.1, ease: 'sine.out', stagger: 0.22, repeat: 2 },
            0.2,
          );
          break;
        case 'bubbles': {
          const bubble = q('[data-fx-bubble]')[0];
          const text = q('[data-fx-bubble-text]')[0];
          if (!bubble || !text) break;
          (interest.glyphs ?? []).forEach((word, index) => {
            tl.call(() => void (text.textContent = word), [], 0.3 + index * 0.62).fromTo(
              bubble,
              { scale: 0.6, rotate: index % 2 ? 6 : -6, opacity: 0 },
              {
                scale: 1,
                rotate: index % 2 ? 3 : -3,
                opacity: 1,
                duration: 0.45,
                ease: 'back.out(2.4)',
              },
              0.3 + index * 0.62,
            );
          });
          tl.to(bubble, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.in' }, '+=0.5');
          break;
        }
        case 'burst':
          tl.fromTo(
            q('[data-fx-particle]'),
            { x: 0, y: 0, scale: 0.3, rotate: 0, opacity: 1 },
            {
              x: (i) => spray[i]?.x ?? 0,
              y: (i) => spray[i]?.y ?? 0,
              rotate: (i) => spray[i]?.r ?? 0,
              scale: 1,
              duration: 1.1,
              ease: 'power3.out',
              stagger: 0.02,
            },
            0.25,
          ).to(q('[data-fx-particle]'), { opacity: 0, duration: 0.5, stagger: 0.02 }, 0.95);
          break;
        case 'type':
          tl.fromTo(
            q('[data-note-char]'),
            { opacity: 0 },
            { opacity: 1, duration: 0.01, stagger: 0.035, ease: 'none' },
            0.35,
          ).fromTo(
            q('[data-fx-caret]'),
            { opacity: 1 },
            { opacity: 0, duration: 0.4, repeat: 5, yoyo: true },
            0.35,
          );
          break;
        case 'steam':
          tl.fromTo(
            q('[data-fx-steam]'),
            { y: 18, opacity: 0, scaleY: 0.7 },
            { y: -34, opacity: 0.9, scaleY: 1, duration: 1, ease: 'sine.out', stagger: 0.18 },
            0.3,
          ).to(q('[data-fx-steam]'), { opacity: 0, y: -60, duration: 0.8, stagger: 0.18 }, 1.1);
          break;
        case 'stamp':
          tl.fromTo(
            q('[data-fx-stamp]'),
            { scale: 2.8, rotate: -40, opacity: 0 },
            { scale: 1, rotate: -12, opacity: 1, duration: 0.55, ease: 'back.out(2.6)' },
            0.4,
          );
          break;
        case 'ticks':
          tl.fromTo(
            q('[data-fx-tick]'),
            { scale: 0, rotate: -30 },
            { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(3)', stagger: 0.16 },
            0.4,
          );
          break;
      }
      return () => {
        tl.kill();
      };
    },
    { scope: trackRef, dependencies: [shown, replay, entered] },
  );

  const onSelect = useCallback((index: number) => {
    setSelected((current) => (current === index ? current : index));
    setReplay((count) => count + 1);
  }, []);

  const stage = stageOf(interest?.id);
  const tone = !interest
    ? 'bg-white text-ink'
    : stage.look === 'polaroid'
      ? 'bg-white text-ink'
      : stage.look === 'screen' || stage.look === 'onair'
        ? 'bg-ink text-white'
        : toneClass[interest.tone];
  const glyphs = interest?.glyphs ?? [];
  const pose = interest ? poses[interest.id] : undefined;
  // Poses are sized in the avatar box's container units, so every drawing keeps one scale.
  const cq = (px: number) => `${(px / POSE_TALL) * 100}cqh`;
  // The drawing sits in the box's bottom-right corner; this is its effect point in the box.
  const fxAt = pose?.fx
    ? {
        left: `calc(100cqw - ${cq((1 - pose.fx[0]) * pose.w)})`,
        top: `calc(100cqh - ${cq((1 - pose.fx[1]) * pose.h)})`,
      }
    : undefined;

  return (
    <div ref={trackRef} className="relative h-[250svh] motion-reduce:h-auto">
      <div
        className={cn(
          'sticky top-0 flex h-svh flex-col overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)]',
          'bg-[#fbf7ec] bg-[radial-gradient(rgba(23,40,79,.16)_1.1px,transparent_1.4px)] bg-[size:26px_26px]',
        )}
      >
        <div
          data-fx-flash
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0"
        />

        {/* Title, beside the rings on wide screens and on top on phones. */}
        <header className="relative z-20 px-5 pt-14 md:order-3 md:flex md:flex-col md:justify-start md:px-8 md:pt-[14svh] lg:px-12">
          <p
            data-title-line
            className="text-[15px] font-bold tracking-[0.04em] text-accent-rose md:text-[18px]"
          >
            {content.kicker}
          </p>
          <h2
            aria-label={content.title}
            className="mt-1 font-[family-name:var(--font-work-display)] text-[clamp(46px,13vw,64px)] leading-[0.86] font-bold tracking-[-0.03em] whitespace-nowrap text-ink md:text-[clamp(44px,5.4vw,104px)]"
          >
            {content.title.split('').map((letter, index) => (
              <span
                key={index}
                aria-hidden="true"
                data-title-letter
                className="inline-block [-webkit-text-stroke:2px_#17284f] [paint-order:stroke_fill] [text-shadow:0_5px_0_#17284f] odd:text-secondary even:text-primary"
              >
                {letter}
              </span>
            ))}
          </h2>
          <p
            data-title-line
            className="mt-4 hidden max-w-[22rem] text-[15px] leading-snug text-ink/80 md:block lg:text-[17px]"
          >
            {content.lead}
          </p>
          <p
            data-title-line
            className="mt-3 hidden items-center gap-2 text-[13px] font-bold text-ink/60 md:flex"
          >
            <span aria-hidden="true">↔</span> {content.hint}
          </p>
        </header>

        {/* The photo rings, panned by the scroll. */}
        <div className="relative z-0 min-h-0 flex-1 md:order-2 md:h-full">
          {mounted ? (
            <RingTower onReady={onReady} rings={rings} ground={GROUND} lean={0} backface={0.8} />
          ) : null}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#fbf7ec] to-transparent md:h-28"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fbf7ec] to-transparent md:h-28"
          />
        </div>

        {/* The interest list, held still. */}
        <div className="relative z-10 flex h-[40svh] shrink-0 items-start justify-center px-4 pb-[76px] md:order-1 md:h-full md:items-center md:px-6 md:pb-0">
          <StackTower
            words={words}
            active={selected}
            entered={entered}
            label="Interests"
            onHover={setHovered}
            onSelect={onSelect}
            wordClassName="font-[family-name:var(--font-work-display)] font-bold uppercase text-[min(5.4vw,2.05svh)] md:text-[clamp(26px,3.3vw,62px)]"
          />
        </div>

        {/* The avatar and its card, in the free space under the title. */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute end-3 bottom-[40svh] z-30 md:end-12 md:bottom-[5svh] lg:end-16"
        >
          <div
            data-interest-actor
            className="[container-type:size] relative h-[158px] w-[150px] will-change-transform md:h-[300px] md:w-[286px] min-[120rem]:h-[380px] min-[120rem]:w-[362px]"
          >
            <div
              data-interest-avatar
              aria-hidden="true"
              className={cn('absolute inset-0 -scale-x-100', pose && 'opacity-0')}
            />
            {interest && pose ? (
              <div
                key={interest.id}
                data-interest-pose
                aria-hidden="true"
                className="absolute end-0 bottom-0 origin-bottom"
                style={{ width: cq(pose.w), height: cq(pose.h) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a local drawing, sized by its box */}
                <img
                  src={poseSrc(interest.id)}
                  alt=""
                  width={pose.w}
                  height={pose.h}
                  decoding="async"
                  draggable={false}
                  className="size-full object-contain select-none"
                />
              </div>
            ) : interest ? (
              <div key={interest.id} aria-hidden="true" className="absolute inset-0 z-10">
                <StageProps id={interest.id} />
              </div>
            ) : null}
            {/* Hand-cut voice waves and speech bubble around the head. */}
            {interest?.act === 'waves' ? (
              <div
                aria-hidden="true"
                className={cn('absolute', !fxAt && 'top-[20%] left-[10%]')}
                style={fxAt}
              >
                {[0, 1, 2].map((wave) => (
                  <span
                    key={wave}
                    data-fx-wave
                    className="absolute -top-6 -left-6 size-12 rounded-full border-[3px] border-accent-rose opacity-0"
                  />
                ))}
              </div>
            ) : null}
            {interest?.act === 'bubbles' ? (
              <div
                data-fx-bubble
                aria-hidden="true"
                style={fxAt}
                className={cn(
                  'absolute opacity-0',
                  fxAt ? '-translate-x-full -translate-y-full' : '-top-[2%] right-[88%]',
                )}
              >
                <div className="relative rounded-[16px] border-[3px] border-ink bg-white px-3 py-1.5 text-[15px] font-bold text-ink shadow-[0_6px_0_#17284f] md:text-[20px]">
                  <span data-fx-bubble-text>{glyphs[0]}</span>
                  <span className="absolute -bottom-[11px] left-[60%] size-4 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-white" />
                </div>
              </div>
            ) : null}

            {interest?.act === 'steam' ? (
              <div
                aria-hidden="true"
                className={cn(
                  'absolute',
                  fxAt ? 'w-[44px] -translate-x-1/2' : 'top-[22%] left-[0%] w-[20%]',
                )}
                style={fxAt}
              >
                {interest.act === 'steam'
                  ? [0, 1, 2].map((wisp) => (
                      <svg
                        key={wisp}
                        data-fx-steam
                        aria-hidden="true"
                        viewBox="0 0 20 60"
                        className="absolute -top-14 h-12 w-4 opacity-0"
                        style={{ left: `${8 + wisp * 28}%` }}
                      >
                        <path
                          d="M10 58 C2 46 18 38 10 28 C2 18 18 10 10 2"
                          fill="none"
                          stroke="#17284f"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ))
                  : null}
              </div>
            ) : null}

            {/* The card: each interest lands it somewhere of its own. */}
            <div
              data-interest-card
              className={cn(
                'absolute w-[156px] rounded-[16px] border-4 border-white p-3 shadow-[0_14px_28px_-12px_rgba(23,40,79,.55)] md:w-[252px] md:rounded-[20px] md:p-4',
                pose ? poseCardClass[pose.card] : spotClass[stage.spot],
                stage.look === 'polaroid' && 'rounded-[6px] border-0 pb-5 md:rounded-[8px] md:pb-6',
                stage.look === 'bubble' && 'border-[3px] border-ink shadow-[0_6px_0_#17284f]',
                stage.look === 'block' && 'md:w-[272px] md:py-6',
                tone,
              )}
              style={pose ? { right: `calc(${cq(pose.w)} + 10px)` } : undefined}
            >
              {interest ? (
                <>
                  {stage.look === 'polaroid' ? (
                    <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-[3px] bg-ink">
                      <canvas data-snap width={480} height={360} className="size-full" />
                      <span data-develop className="absolute inset-0 bg-[#f4efe2]" />
                    </div>
                  ) : null}
                  {stage.look === 'onair' ? (
                    <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-rose px-2 py-0.5 font-[family-name:var(--font-work-display)] text-[11px] font-bold tracking-[0.12em] md:text-[12px]">
                      <span data-rec className="size-2 rounded-full bg-white" /> ON AIR
                    </p>
                  ) : null}
                  {stage.look === 'screen' ? (
                    <p className="mb-2 font-[family-name:var(--font-work-display)] text-[11px] font-bold tracking-[0.14em] text-secondary md:text-[12px]">
                      ▶ PLAYER 1 READY
                    </p>
                  ) : null}
                  {stage.look === 'bubble' ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-[22%] -bottom-[11px] size-4 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-white"
                    />
                  ) : null}
                  {interest.id === 'writing' ? (
                    <svg aria-hidden="true" viewBox="0 0 200 30" className="mb-1 h-6 w-full">
                      <path
                        data-scribble
                        d="M4 20 C20 4 30 28 46 14 S70 6 84 18 S110 26 124 12 S150 6 164 18 S186 22 196 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="240"
                      />
                    </svg>
                  ) : null}
                  {interest.id === 'strategy' ? (
                    <svg aria-hidden="true" viewBox="0 0 200 50" className="mb-1 h-9 w-full">
                      <path
                        data-plan
                        d="M10 40 C50 40 60 8 100 14 S160 40 186 12 M176 10 L188 11 L184 22"
                        fill="none"
                        stroke="#e43468"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="200"
                      />
                      <circle cx="10" cy="40" r="5" fill="currentColor" />
                    </svg>
                  ) : null}
                  {interest.id === 'interactions'
                    ? [0, 1].map((ring) => (
                        <span
                          key={ring}
                          data-ripple
                          aria-hidden="true"
                          className="absolute inset-0 rounded-[inherit] border-[3px] border-secondary opacity-0"
                        />
                      ))
                    : null}
                  <p className="font-[family-name:var(--font-work-display)] text-[12px] font-bold tracking-[0.08em] opacity-70 md:text-[13px]">
                    {pad((shown ?? 0) + 1)} / {pad(content.interests.length)}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-work-display)] text-[18px] leading-[0.95] font-bold tracking-[-0.02em] uppercase md:text-[26px]">
                    {interest.label}
                  </p>
                  <p className="mt-2 hidden text-[13px] leading-snug font-bold md:block">
                    {interest.act === 'type' ? (
                      <>
                        {interest.note.split('').map((char, index) => (
                          <span key={index} data-note-char>
                            {char}
                          </span>
                        ))}
                        <span
                          data-fx-caret
                          aria-hidden="true"
                          className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-current"
                        />
                      </>
                    ) : (
                      interest.note
                    )}
                  </p>
                  {interest.act === 'ticks' ? (
                    <div aria-hidden="true" className="mt-2 flex gap-1.5">
                      {[0, 1, 2, 3, 4].map((tick) => (
                        <span
                          key={tick}
                          className="grid size-5 place-items-center rounded-[5px] border-2 border-current md:size-6"
                        >
                          <span
                            data-fx-tick
                            className="text-[13px] leading-none font-bold text-secondary md:text-[15px]"
                          >
                            ✓
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {interest.act === 'stamp' ? (
                    <span
                      data-fx-stamp
                      aria-hidden="true"
                      className="absolute -top-5 -right-5 grid size-14 place-items-center rounded-full border-[3px] border-accent-rose bg-white text-[28px] leading-none text-accent-rose opacity-0 md:size-16 md:text-[32px]"
                    >
                      {glyphs[0]}
                    </span>
                  ) : null}
                  {interest.act === 'burst'
                    ? spray.map((_, index) => (
                        <span
                          key={index}
                          data-fx-particle
                          aria-hidden="true"
                          className="absolute top-1/2 left-1/2 -mt-3 -ml-3 grid size-6 place-items-center text-[20px] leading-none font-bold text-accent-rose opacity-0 [text-shadow:0_2px_0_#fff] md:text-[24px]"
                        >
                          {glyphs[index % Math.max(1, glyphs.length)]}
                        </span>
                      ))
                    : null}
                </>
              ) : (
                <>
                  <p className="font-[family-name:var(--font-work-display)] text-[12px] font-bold tracking-[0.08em] text-accent-rose md:text-[13px]">
                    {pad(content.interests.length)} INTERESTS
                  </p>
                  <p className="mt-1 text-[14px] leading-snug font-bold md:text-[16px]">
                    <span className="hidden md:inline">← Hover a word to see what moves him.</span>
                    <span className="md:hidden">↓ Tap a word below.</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
