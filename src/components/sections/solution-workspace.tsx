'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { solutionContent as content } from '@/content/solution';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { cn } from '@/lib/utils';
import { canvasGrid } from './canvas-grid';
import { StepOrb } from './step-orb';

/*
 * The workspace revealed behind the key: Osama's Figma file, where a developer
 * and the client work with him through ten stages. One timeline, scrubbed by
 * scroll, drives the canvas (camera, live cursors, comments, diagrams, frames);
 * the Figma chrome follows the stage index, which changes only ten times.
 */

// The workspace speaks in the site's own type: BT Grotesk for labels and
// notes, F37 Bolton for the hand-set annotations; only code stays monospaced.
const sans = 'font-sans font-medium';
const code = '[font-family:var(--font-sans)]';
const hand = '[font-family:var(--font-work-display)] tracking-[-0.01em]';
const sticker =
  'rounded-full border-[3px] border-white font-extrabold leading-none [box-shadow:0_1px_0_#17284f14,0_8px_20px_#17284f2e]';
const hidden = 'invisible opacity-0';

const STAGES = content.stages.length;
const STAGE = { mapping: 2, options: 3, toolCall: 4, error: 8, done: 9 } as const;
// Timeline time at which each stage starts; "thinking" gets two units.
const STARTS = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10] as const;
const END = 11;
// The canvas is a fixed world scaled to fit; the camera pans between sections.
const VIEW = { width: 900, height: 600 } as const;
const CENTER = { brief: 450, mapping: 1390, options: 2330, build: 3270 } as const;

type Person = keyof typeof content.people;

export function SolutionWorkspace({ trackRef }: { trackRef: RefObject<HTMLDivElement | null> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      const canvas = root?.querySelector<HTMLElement>('[data-canvas]');
      const view = root?.querySelector<HTMLElement>('[data-view]');
      if (!root || !track || !canvas || !view) return;

      // Wide canvases show a whole section; narrow ones zoom to half and follow the action.
      let scale = 0;
      let narrow = false;
      const fit = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        let next = Math.min(width / VIEW.width, height / VIEW.height);
        const nextNarrow = next < 0.6;
        if (nextNarrow) next = Math.min(width / (VIEW.width / 2), height / VIEW.height);
        if (Math.abs(next - scale) < 0.001 && nextNarrow === narrow) return;
        const modeChanged = scale !== 0 && nextNarrow !== narrow;
        scale = next;
        narrow = nextNarrow;
        view.style.transform = `translate(-50%,-50%) scale(${scale})`;
        if (modeChanged) ScrollTrigger.refresh();
      };
      fit();
      const resize = new ResizeObserver(fit);
      resize.observe(canvas);

      let step = -1;
      const timeline = buildTimeline(
        root,
        () => narrow,
        () => {
          const time = timeline.time() + 0.0001;
          let next = 0;
          STARTS.forEach((start, index) => {
            if (time >= start) next = index;
          });
          if (next === step) return;
          step = next;
          setStage(next);
        },
      );
      const reduced = window.matchMedia(motionConfig.queries.reduced).matches;
      const trigger = ScrollTrigger.create({
        id: 'solution-workspace',
        trigger: track,
        // The key's runway (110svh) plus a short hold on the opened file before the first stage moves.
        start: () => `top -${Math.round(window.innerHeight * 1.3)}px`,
        end: 'bottom bottom',
        animation: timeline,
        scrub: reduced ? true : 2.2,
        invalidateOnRefresh: true,
      });
      const visibility = () => {
        if (document.hidden) trigger.getTween()?.pause();
        else trigger.getTween()?.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => {
        resize.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        trigger.kill();
        timeline.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative flex h-svh w-full flex-col gap-2 overflow-hidden bg-white p-3 text-start text-ink"
      style={{ backgroundImage: canvasGrid }}
    >
      <ol className="sr-only" aria-label={content.label}>
        {content.stages.map((item) => (
          <li key={item.id}>
            {item.title} {item.line}
          </li>
        ))}
      </ol>
      <Header stage={stage} />
      <FigmaWindow stage={stage} />
    </div>
  );
}

/* ------------------------------------------------------------------ timeline */

function buildTimeline(root: HTMLElement, isNarrow: () => boolean, onUpdate: () => void) {
  const q = gsap.utils.selector(root);
  const el = (name: string) => q(`[data-el="${name}"]`);
  const cursor = (who: Person) => q(`[data-cursor="${who}"]`);
  const world = q('[data-world]');
  const tl = gsap.timeline({ paused: true, onUpdate, defaults: { ease: 'sine.inOut' } });

  const move = (who: Person, x: number, y: number, at: number, duration = 0.3) =>
    tl.to(cursor(who), { x, y, duration }, at);
  const click = (who: Person, at: number) =>
    tl.to(
      q(`[data-cursor="${who}"] svg`),
      { scale: 0.82, duration: 0.04, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      at,
    );
  const show = (name: string, at: number, duration = 0.12) =>
    tl.to(el(name), { autoAlpha: 1, duration }, at);
  const hide = (name: string, at: number, duration = 0.1) =>
    tl.to(el(name), { autoAlpha: 0, duration }, at);
  const pop = (name: string, at: number, from = 0.7, duration = 0.14) =>
    tl.fromTo(
      el(name),
      { autoAlpha: 0, scale: from },
      { autoAlpha: 1, scale: 1, duration, ease: 'back.out(1.6)', immediateRender: false },
      at,
    );
  const draw = (name: string, at: number, duration = 0.12) =>
    tl.fromTo(
      el(name),
      { autoAlpha: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration, ease: 'none', immediateRender: false },
      at,
    );
  // Wide views centre the section; narrow views follow the focus point.
  const camera = (center: number, focus: number, at: number, duration = 0.6) =>
    tl.to(world, { x: () => VIEW.width / 2 - (isNarrow() ? focus : center), duration }, at);

  gsap.set(cursor('client'), { x: 520, y: 170 });
  gsap.set(cursor('osama'), { x: 980, y: 470 });
  gsap.set(cursor('developer'), { x: -260, y: 560 });
  tl.set(world, { x: () => VIEW.width / 2 - (isNarrow() ? 300 : CENTER.brief) }, 0);

  // 0 · idle — the client drops the brief; both join the file.
  move('client', 420, 66, 0.05, 0.42);
  click('client', 0.5);
  pop('pin-brief', 0.52);
  show('thread-brief', 0.6);
  move('osama', 300, 210, 0.55, 0.4);
  move('developer', 170, 520, 0.62, 0.36);

  // 1 · listening — two rows of notes: what Osama heard, what the developer heard.
  hide('thread-brief', 1);
  move('client', 700, -90, 1, 0.5);
  camera(CENTER.brief, 660, 1, 0.3);
  show('heading-osama', 1.05);
  show('heading-developer', 1.1);
  [0, 1, 2].forEach((index) => {
    const x = 529 + index * 130;
    move('osama', x, 152, 1.1 + index * 0.17, 0.13);
    click('osama', 1.23 + index * 0.17);
    pop(`note-osama-${index}`, 1.25 + index * 0.17, 0.4);
    move('developer', x, 384, 1.17 + index * 0.17, 0.13);
    click('developer', 1.3 + index * 0.17);
    pop(`note-developer-${index}`, 1.32 + index * 0.17, 0.4);
  });
  camera(CENTER.brief, 240, 1.66, 0.2);
  move('osama', 130, 320, 1.66, 0.12);
  pop('question', 1.8, 0.4);
  move('osama', 330, 320, 1.8, 0.08);
  pop('persona', 1.88, 0.8);
  move('osama', 230, 470, 1.88, 0.07);
  show('problem', 1.94, 0.06);

  // 2 · thinking — the journey on top, the system below, a conversation on the side.
  camera(CENTER.mapping, 1180, 2, 0.7);
  move('osama', 1050, 122, 2, 0.6);
  move('developer', 1070, 376, 2.05, 0.6);
  show('heading-journey', 2.55);
  [0, 1, 2, 3, 4].forEach((index) => {
    move('osama', 1050 + index * 165, 122, 2.6 + index * 0.12, 0.1);
    pop(`node-${index}`, 2.68 + index * 0.12, 0.5);
    if (index < 4)
      tl.fromTo(
        el(`arrow-${index}`),
        { autoAlpha: 1, scaleX: 0 },
        { scaleX: 1, duration: 0.06, ease: 'none', immediateRender: false },
        2.72 + index * 0.12,
      );
  });
  show('heading-system', 2.7);
  pop('box-screen', 2.8, 0.85);
  draw('line-0', 2.86, 0.05);
  move('developer', 1275, 376, 2.88, 0.1);
  pop('box-api', 2.98, 0.85);
  [0, 1, 2].forEach((index) => {
    draw(`line-${index + 1}`, 3.04 + index * 0.06, 0.05);
    move('developer', 1445, 343 + index * 58, 3.04 + index * 0.06, 0.05);
    pop(`service-${index}`, 3.08 + index * 0.06, 0.85);
  });
  show('problem-calls', 3.28);
  camera(CENTER.mapping, 1560, 3, 0.3);
  draw('curve', 3.18, 0.24);
  move('osama', 1710, 182, 3.18, 0.24);
  tl.fromTo(
    q('[data-feel]'),
    { autoAlpha: 0, y: 6 },
    { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.05, immediateRender: false },
    3.22,
  );
  move('osama', 1545, 90, 3.4, 0.06);
  draw('pay-circle', 3.46, 0.08);
  show('pay-red', 3.5, 0.06);
  move('osama', 1496, 262, 3.55, 0.06);
  click('osama', 3.62);
  pop('pin-mapping', 3.63);
  show('thread-mapping', 3.66, 0.06);
  move('developer', 1500, 470, 3.6, 0.1);
  show('thread-mapping-1', 3.73, 0.06);
  show('thread-mapping-2', 3.8, 0.06);
  show('thread-mapping-3', 3.87, 0.06);
  move('developer', 1275, 452, 3.88, 0.06);
  draw('line-fix', 3.92, 0.04);
  pop('fix-call', 3.94, 0.8);
  tl.to(el('services'), { opacity: 0.35, duration: 0.05 }, 3.96);

  // 3 · reasoning — two options; both vote for one page.
  hide('thread-mapping', 4);
  camera(CENTER.options, 2125, 4, 0.6);
  move('osama', 2100, 250, 4, 0.6);
  move('developer', 2200, 470, 4, 0.6);
  show('heading-options', 4.5);
  show('option-0', 4.55);
  show('option-1', 4.62);
  tl.fromTo(
    q('[data-point]'),
    { autoAlpha: 0, x: -8 },
    { autoAlpha: 1, x: 0, duration: 0.05, stagger: 0.025, immediateRender: false },
    4.66,
  );
  move('developer', 2262, 392, 4.74, 0.05);
  click('developer', 4.79);
  pop('pin-screens', 4.8);
  show('thread-screens', 4.82, 0.05);
  camera(CENTER.options, 2545, 4.82, 0.1);
  move('osama', 2450, 300, 4.8, 0.08);
  click('osama', 4.88);
  show('sel-b', 4.89, 0.02);
  pop('vote-osama', 4.9, 0.4, 0.06);
  move('developer', 2700, 410, 4.88, 0.06);
  pop('vote-developer', 4.94, 0.4, 0.06);
  tl.to(el('option-0'), { opacity: 0.45, duration: 0.04 }, 4.95);
  pop('chosen', 4.96, 1.6, 0.04);

  // 4 · tool-call — a frame is drawn and laid out with auto layout.
  hide('thread-screens', 5);
  hide('sel-b', 5);
  camera(CENTER.build, 2990, 5, 0.7);
  move('osama', 2864, 72, 5.05, 0.65);
  move('developer', 3150, 560, 5.05, 0.7);
  show('frame-label', 5.7, 0.03);
  tl.fromTo(
    el('frame'),
    { autoAlpha: 1, scale: 0 },
    { scale: 1, duration: 0.22, ease: 'none', immediateRender: false },
    5.72,
  );
  move('osama', 3100, 560, 5.72, 0.22);
  show('sel-frame', 5.94, 0.02);
  show('size-badge', 5.94, 0.02);
  show('wire', 5.96, 0.04);

  // 5 · tool-result — the screen fills in; the PayButton component lands, and they joke about it.
  hide('size-badge', 6);
  move('osama', 2950, 200, 6, 0.15);
  hide('wire', 6.15);
  tl.fromTo(
    q('[data-hifi]'),
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.045, immediateRender: false },
    6.2,
  );
  camera(CENTER.build, 3150, 6.42, 0.1);
  move('osama', 3218, 150, 6.45, 0.08);
  show('components', 6.52);
  click('osama', 6.56);
  camera(CENTER.build, 3090, 6.58, 0.12);
  move('osama', 3000, 516, 6.58, 0.1);
  hide('sel-frame', 6.66, 0.02);
  pop('pay-button', 6.68, 0.85);
  show('sel-pay', 6.72, 0.02);
  move('developer', 3150, 540, 6.62, 0.12);
  show('thread-result', 6.74);
  show('thread-result-1', 6.82);
  show('thread-result-2', 6.9);
  show('thread-result-r', 6.95);

  // 6 · streaming — the developer inspects; the PayButton streams into code.
  hide('sel-pay', 7, 0.02);
  hide('thread-result', 7);
  move('developer', 3010, 500, 7, 0.3);
  camera(CENTER.build, 3440, 7.05, 0.3);
  show('tokens', 7.1);
  move('osama', 3200, 280, 7.1, 0.3);
  show('redlines', 7.3);
  click('developer', 7.36);
  pop('code', 7.38, 0.94, 0.08);
  tl.fromTo(
    q('[data-code-line]'),
    { autoAlpha: 0, x: -6 },
    { autoAlpha: 1, x: 0, duration: 0.04, stagger: 0.035, immediateRender: false },
    7.46,
  );
  pop('pin-tokens', 7.72);
  show('thread-tokens', 7.76);
  show('thread-tokens-1', 7.84);
  show('thread-tokens-2', 7.92);
  show('thread-tokens-r', 7.96);

  // 7 · waiting-approval — the client reviews in the file; the team teases each other.
  hide('thread-tokens', 8);
  hide('code', 8);
  hide('redlines', 8);
  hide('pin-tokens', 8, 0.05);
  tl.set(cursor('client'), { x: 3800, y: 300 }, 7.95);
  move('client', 3480, 150, 8.05, 0.3);
  pop('approval', 8.1, 0.94, 0.1);
  click('client', 8.38);
  pop('pin-review', 8.42);
  show('thread-review', 8.46);
  move('osama', 3200, 300, 8.5, 0.15);
  show('thread-review-1', 8.66);
  move('developer', 3250, 540, 8.6, 0.15);
  show('thread-review-2', 8.8);
  show('thread-review-r', 8.86);

  // 8 · error — the small-phone frame overflows; the 360px test fails.
  hide('thread-review', 9);
  hide('approval', 9);
  hide('pin-review', 9, 0.05);
  hide('components', 9);
  hide('tokens', 9);
  camera(CENTER.build, 3460, 9, 0.3);
  move('osama', 3340, 72, 9, 0.25);
  show('frame-sm-label', 9.28, 0.04);
  pop('frame-sm', 9.3, 0.96, 0.1);
  move('osama', 3520, 516, 9.38, 0.12);
  move('developer', 3570, 470, 9.4, 0.15);
  show('sm-outline', 9.5, 0.04);
  pop('error-note', 9.52, 1.5, 0.08);
  click('developer', 9.56);
  pop('pin-small', 9.58);
  pop('test', 9.6, 0.9, 0.08);
  // Narrow views turn from the broken button to the conversation about it.
  camera(CENTER.build, 3225, 9.64, 0.25);
  show('thread-small', 9.62);
  show('thread-small-1', 9.7);
  show('thread-small-2', 9.78);
  show('thread-small-3', 9.86);

  // 9 · done — hug width fixes it; approved, shipped, celebrated.
  hide('thread-small', 10);
  hide('pin-small', 10, 0.05);
  camera(CENTER.build, 3345, 10, 0.3);
  move('osama', 3560, 516, 10.05, 0.15);
  click('osama', 10.22);
  hide('sm-long', 10.25, 0.05);
  show('sm-fixed', 10.3, 0.06);
  hide('sm-outline', 10.3, 0.04);
  hide('error-note', 10.3);
  hide('test-fail', 10.32, 0.04);
  show('test-pass', 10.34, 0.04);
  move('client', 3600, 300, 10.35, 0.2);
  pop('approved', 10.48, 1.6, 0.08);
  pop('live', 10.52, 0.8, 0.08);
  show('thread-done', 10.56);
  show('thread-done-1', 10.66);
  show('thread-done-2', 10.76);
  show('thread-done-r', 10.82);
  tl.fromTo(
    q('[data-confetti]'),
    { autoAlpha: 0, scale: 0.3, y: 20 },
    {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      duration: 0.08,
      stagger: 0.03,
      ease: 'back.out(2)',
      immediateRender: false,
    },
    10.6,
  );
  tl.to({}, { duration: 0.01 }, END - 0.01);
  return tl;
}

/* -------------------------------------------------------------------- header */

function Header({ stage }: { stage: number }) {
  const current = content.stages[stage] ?? content.stages[0];
  const trackRef = useRef<HTMLOListElement>(null);

  // One line of steps: the track slides so the step before the current one
  // leads, and the next steps come in from the overflow on the right.
  useEffect(() => {
    const track = trackRef.current;
    const frame = track?.parentElement;
    if (!track || !frame) return;
    const place = () => {
      const lead = track.children[Math.max(0, stage - 1)];
      const max = Math.max(0, track.scrollWidth - frame.clientWidth);
      const x = lead instanceof HTMLElement ? Math.min(lead.offsetLeft, max) : 0;
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(frame);
    return () => resize.disconnect();
  }, [stage]);

  return (
    <div
      aria-hidden="true"
      className="relative flex flex-col gap-[clamp(0.6rem,1.6svh,1rem)] pe-[clamp(104px,12vw,210px)]"
    >
      {/* The stage's dotted object, in the corner the stickers leave free. */}
      <StepOrb
        state={current.id}
        className="absolute end-[clamp(0px,1vw,12px)] top-0 h-full max-h-[196px] w-auto"
      />
      <p className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            sticker,
            'rotate-[-2deg] bg-ink px-4 py-2 text-[clamp(1rem,1.15vw,1.15rem)] text-secondary max-sm:hidden',
          )}
        >
          {content.eyebrow}
        </span>
        <span
          className={cn(
            sticker,
            'rotate-[1deg] px-4 py-2 text-[clamp(1.1rem,1.5vw,1.5rem)] transition-colors duration-700 motion-reduce:transition-none',
            current.id === 'error' ? 'bg-accent-rose text-white' : 'bg-secondary text-ink',
          )}
        >
          {current.title}
        </span>
      </p>
      <div className="-my-2 overflow-hidden [mask-image:linear-gradient(90deg,#000_88%,transparent)] py-2 ps-1 max-xl:hidden">
        <ol
          ref={trackRef}
          className="flex w-max flex-nowrap items-center gap-2 transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:transition-none"
        >
          {content.stages.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                sticker,
                'flex items-center gap-1 py-1 ps-1.5 pe-3 text-[15px] transition-[background-color,color,rotate,scale,opacity] duration-700 motion-reduce:transition-none',
                index < stage && 'bg-white text-ink',
                index > stage && 'bg-white text-ink opacity-45',
                index === stage &&
                  (item.id === 'error'
                    ? 'scale-110 rotate-[-2deg] bg-accent-rose text-white'
                    : 'scale-110 rotate-[-2deg] bg-primary text-white'),
              )}
            >
              <Image
                src={`/steps/${item.id}.webp`}
                alt={item.id}
                width={42}
                height={42}
                className="size-[42px] shrink-0 object-contain select-none"
              />
              <span>{item.id}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center gap-4 xl:hidden">
        <span
          className={cn(
            sticker,
            'flex shrink-0 rotate-[-1.5deg] items-center gap-2 py-1 ps-1.5 pe-3.5 text-[15px] text-white',
            current.id === 'error' ? 'bg-accent-rose' : 'bg-primary',
          )}
        >
          <Image
            src={`/steps/${current.id}.webp`}
            alt={current.id}
            width={42}
            height={42}
            className="size-[42px] shrink-0 object-contain select-none"
          />
          <span>{current.id}</span>
        </span>
        <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#17284f14]">
          <span
            className="block h-full origin-left rounded-full bg-primary transition-[scale] duration-700 motion-reduce:transition-none"
            style={{ scale: `${(stage + 1) / STAGES} 1` }}
          />
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- figma window */

const avatarTone: Record<Person, string> = {
  osama: 'bg-accent-rose text-white',
  developer: 'bg-primary text-white',
  client: 'bg-accent-warm text-ink',
};

function FigmaWindow({ stage }: { stage: number }) {
  const current = content.stages[stage] ?? content.stages[0];
  const chip = (who: Person, text: string, className?: string) => (
    <span
      className={cn(
        sans,
        'flex min-w-0 items-center gap-2 truncate rounded-full px-[0.75rem] py-[0.35rem] text-[14px] leading-none transition-colors duration-700 motion-reduce:transition-none',
        stage === STAGE.error
          ? 'bg-accent-rose text-white'
          : stage === STAGE.done
            ? 'bg-primary text-white'
            : 'bg-[#17284f0d] text-ink',
        className,
      )}
    >
      <span className={cn('size-[8px] shrink-0 rounded-full', avatarTone[who])} />
      {content.people[who].name} · {text}
    </span>
  );
  return (
    <div
      aria-hidden="true"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#17284f1f] bg-white [box-shadow:0_1px_2px_#17284f14,0_18px_48px_#17284f1f]"
    >
      <div className="flex items-center gap-3 border-b border-[#17284f14] px-[clamp(0.75rem,1.1vw,1rem)] py-[0.55rem]">
        <span className="flex gap-[6px] max-md:hidden">
          <span className="size-[11px] rounded-full bg-accent-rose" />
          <span className="size-[11px] rounded-full bg-accent-warm" />
          <span className="size-[11px] rounded-full bg-primary" />
        </span>
        <span className="shrink-0 text-[clamp(0.95rem,1.05vw,1.05rem)] font-semibold">
          {content.designer.role}
        </span>
        <span className="truncate text-[14px] text-[#17284f80] max-lg:hidden">
          {content.designer.with}
        </span>
        <span className="ms-auto flex min-w-0 gap-2">
          {chip('osama', current.designer)}
          {chip('developer', current.developer, 'max-lg:hidden')}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 text-[12px] text-[#1e1e1e]">
        <LayersPanel stage={stage} />
        <div data-canvas className="relative min-w-0 flex-1 overflow-hidden bg-[#e5e5e5]">
          <div
            data-view
            className="absolute top-1/2 left-1/2 h-[600px] w-[900px] origin-center [transform:translate(-50%,-50%)]"
          >
            <div data-world className="absolute top-0 left-0 h-[600px] w-[3720px]">
              <World />
            </div>
          </div>
          <Toolbar stage={stage} />
        </div>
        <DesignPanel stage={stage} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------- figma chrome (UI3) */

// 24px toolbar glyphs drawn on Figma's 1px stroke grid.
const toolIcons = {
  move: 'M7.5 5.5v12.2l3.1-2.9 2.1 4.7 1.9-.8-2.1-4.7h4.3z',
  frame: 'M9.5 5v14M14.5 5v14M5 9.5h14M5 14.5h14',
  rect: 'M6.5 6.5h11v11h-11z',
  pen: 'M12 5.5l4.5 7-2.5 5h-4l-2.5-5zM12 5.5v6M10 17.5h4',
  text: 'M7 7h10M12 7v10.5M10.5 17.5h3',
  comment: 'M12 5.5a6.5 6.5 0 1 1-3.3 12.1L5.5 18.5l.9-3.1A6.5 6.5 0 0 1 12 5.5z',
} as const;
type Tool = keyof typeof toolIcons;
const withMenu: Tool[] = ['move', 'frame', 'rect', 'pen'];

function ToolGlyph({ tool }: { tool: Tool }) {
  return (
    <svg
      className="size-[24px]"
      viewBox="0 0 24 24"
      fill={tool === 'move' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <path d={toolIcons[tool]} />
    </svg>
  );
}

function Toolbar({ stage }: { stage: number }) {
  const active: Tool =
    stage === 1
      ? 'text'
      : stage === STAGE.mapping
        ? 'rect'
        : stage === STAGE.toolCall
          ? 'frame'
          : stage === 7
            ? 'comment'
            : 'move';
  return (
    <div className="absolute bottom-3 left-1/2 z-40 flex h-[48px] -translate-x-1/2 items-center gap-0.5 rounded-[13px] bg-white px-2 [box-shadow:0_0_0.5px_#0000004d,0_3px_8px_#0000001a,0_1px_3px_#0000001a] max-lg:hidden">
      {(Object.keys(toolIcons) as Tool[]).map((tool) => (
        <span key={tool} className="flex items-center">
          <span
            className={cn(
              'grid size-[32px] place-items-center rounded-[5px] transition-colors duration-500 motion-reduce:transition-none',
              tool === active ? 'bg-[#0d99ff] text-white' : 'text-[#1e1e1e]',
            )}
          >
            <ToolGlyph tool={tool} />
          </span>
          {withMenu.includes(tool) ? (
            <svg className="h-[32px] w-[12px] text-[#1e1e1e]" viewBox="0 0 12 32" fill="none">
              <path d="M3.5 14.5l2.5 2.5 2.5-2.5" stroke="currentColor" />
            </svg>
          ) : null}
        </span>
      ))}
      <span className="mx-1.5 h-[24px] w-px bg-[#e6e6e6]" />
      <span className="flex items-center gap-1 rounded-[5px] px-1">
        <span className="relative h-[16px] w-[28px] rounded-full bg-[#e6e6e6]">
          <span className="absolute top-[2px] left-[2px] size-[12px] rounded-full bg-white [box-shadow:0_1px_2px_#00000033]" />
        </span>
        <svg className="size-[24px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 8.5L5.5 12 9 15.5M15 8.5l3.5 3.5-3.5 3.5M13 7l-2 10" />
        </svg>
      </span>
    </div>
  );
}

const layers = [
  { name: 'Brief & research', icon: 'section', from: 0, depth: 0 },
  { name: 'Mapping', icon: 'section', from: 2, depth: 0 },
  { name: 'Options', icon: 'section', from: 3, depth: 0 },
  { name: 'Checkout', icon: 'section', from: 4, depth: 0 },
  { name: content.figma.frame, icon: 'frame', from: 4, depth: 1 },
  { name: 'Header', icon: 'auto', from: 4, depth: 2 },
  { name: 'Items', icon: 'auto', from: 4, depth: 2 },
  { name: 'PayButton', icon: 'instance', from: 5, depth: 2 },
  { name: 'PayButton', icon: 'component', from: 5, depth: 1 },
  { name: 'Tokens', icon: 'frame', from: 6, depth: 1 },
  { name: content.figma.frameSmall, icon: 'frame', from: 8, depth: 1 },
] as const;

function layerSelected(index: number, stage: number) {
  if (stage < STAGE.mapping) return index === 0;
  if (stage === STAGE.mapping) return index === 1;
  if (stage === STAGE.options) return index === 2;
  if (stage === STAGE.toolCall) return index === 4;
  if (stage >= STAGE.error) return index === 10;
  return index === 7;
}

const layerPaths = {
  section: 'M3.5 5.5h9v7h-9zM3.5 5.5v-2h4v2',
  frame: 'M6 3v10M10 3v10M3 6h10M3 10h10',
  auto: 'M4 4.5h8M4 8h8M4 11.5h8',
  component: 'M8 2.5l2 2-2 2-2-2zM8 9.5l2 2-2 2-2-2zM4.5 6l2 2-2 2-2-2zM11.5 6l2 2-2 2-2-2z',
  instance: 'M8 3l5 5-5 5-5-5z',
} as const;

function LayerIcon({ icon }: { icon: keyof typeof layerPaths }) {
  const purple = icon === 'component' || icon === 'instance';
  return (
    <svg
      className={cn('size-[16px] shrink-0', purple ? 'text-[#9747ff]' : 'text-[#1e1e1eb3]')}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
    >
      <path d={layerPaths[icon]} />
    </svg>
  );
}

function LayersPanel({ stage }: { stage: number }) {
  return (
    <div className="flex w-[241px] shrink-0 flex-col border-e border-[#e6e6e6] bg-white max-lg:hidden">
      <div className="flex h-[48px] items-center gap-2.5 border-b border-[#e6e6e6] px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/figma.svg" alt="" className="h-[18px] w-auto" />
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-semibold">{content.figma.file}</span>
          <span className="block truncate text-[11px] text-[#1e1e1e80]">
            {content.figma.project}
          </span>
        </span>
      </div>
      <div className="flex h-[40px] items-center gap-4 border-b border-[#e6e6e6] px-4 font-semibold">
        <span>File</span>
        <span className="text-[#1e1e1e80]">Assets</span>
      </div>
      <div className="border-b border-[#e6e6e6] px-4 py-2">
        <p className="flex h-[24px] items-center justify-between font-semibold">
          Pages <span className="text-[16px] font-normal text-[#1e1e1e80]">+</span>
        </p>
        <p className="flex h-[32px] items-center gap-2">
          <svg className="size-[16px]" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <path d="M4 8.5l2.5 2.5L12 5.5" />
          </svg>
          {content.figma.page}
        </p>
      </div>
      <p className="flex h-[40px] items-center px-4 font-semibold">Layers</p>
      <ul className="min-h-0 flex-1 overflow-hidden px-2">
        {layers.map((layer, index) => (
          <li
            key={`${layer.name}-${index}`}
            className={cn(
              'flex h-[32px] items-center gap-2 rounded-[5px] pe-2',
              layer.depth === 0 ? 'ps-2' : layer.depth === 1 ? 'ps-6' : 'ps-10',
              stage < layer.from && 'hidden',
              layerSelected(index, stage) && 'bg-[#e5f4ff]',
              (layer.icon === 'component' || layer.icon === 'instance') && 'text-[#9747ff]',
            )}
          >
            <LayerIcon icon={layer.icon} />
            <span className="truncate">{layer.name}</span>
          </li>
        ))}
      </ul>
      {/* The brief stays pinned under the layers, so the file always says why. */}
      <div className="m-2 rounded-[8px] border border-[#e6e6e6] bg-[#fafafa] p-3">
        <p className="flex items-center justify-between text-[11px] font-semibold tracking-[0.08em] text-[#1e1e1e80] uppercase">
          Brief <span className="rounded-full bg-secondary px-1.5 py-px text-ink">Client</span>
        </p>
        <p className="mt-1.5 text-[13px] leading-snug font-semibold">{content.brief}</p>
        <p className="mt-1 text-[12px] leading-snug text-[#1e1e1eb3]">{content.goal}</p>
        <p className="mt-2 flex flex-wrap gap-1">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] ring-1 ring-[#e6e6e6]"
            >
              {tag}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/** The stage in words: what is happening and who is doing what. */
function StageNote({ stage }: { stage: number }) {
  const current = content.stages[stage] ?? content.stages[0];
  return (
    <div className="m-2 mt-auto rounded-[8px] border border-[#e6e6e6] bg-[#fafafa] p-3">
      <p className="flex items-center justify-between text-[11px] font-semibold tracking-[0.08em] text-[#1e1e1e80] uppercase">
        Step {String(stage + 1).padStart(2, '0')} / {String(STAGES).padStart(2, '0')}
        <span className="flex gap-0.5">
          {content.stages.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                'h-[4px] w-[8px] rounded-full transition-colors duration-500',
                index <= stage ? 'bg-primary' : 'bg-[#e6e6e6]',
              )}
            />
          ))}
        </span>
      </p>
      <p className="mt-1.5 text-[14px] leading-tight font-semibold">{current.title}</p>
      <p className="mt-1 text-[12px] leading-snug text-[#1e1e1eb3]">{current.line}</p>
      <p className="mt-2.5 grid gap-1 text-[12px]">
        <span className="flex items-center gap-1.5">
          <span className="size-[6px] rounded-full bg-accent-rose" />
          Osama · {current.designer}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-[6px] rounded-full bg-primary" />
          Developer · {current.developer}
        </span>
      </p>
    </div>
  );
}

function PanelSection({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-b border-[#e6e6e6] px-4 py-3">
      <p className="flex h-[24px] items-center justify-between font-semibold">{title}</p>
      {children ? <div className="mt-1.5">{children}</div> : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex h-[24px] min-w-0 items-center gap-1.5 rounded-[5px] bg-[#f5f5f5] px-2">
      <span className="text-[#1e1e1e80]">{label}</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function Swatch({ fill, value }: { fill: string; value: string }) {
  return (
    <span className="flex h-[24px] items-center gap-2 rounded-[5px] bg-[#f5f5f5] px-2">
      <span className={cn('size-[14px] rounded-[3px] border border-[#0000001a]', fill)} />
      {value}
      <span className="ms-auto text-[#1e1e1e80]">100%</span>
    </span>
  );
}

function DesignPanel({ stage }: { stage: number }) {
  const selection = stage < STAGE.toolCall ? 'page' : stage === STAGE.toolCall ? 'frame' : 'button';
  const people = Object.keys(content.people) as Person[];
  const plus = <span className="text-[16px] font-normal text-[#1e1e1e80]">+</span>;
  return (
    <div className="flex w-[241px] shrink-0 flex-col border-s border-[#e6e6e6] bg-white max-xl:hidden">
      <div className="flex h-[48px] items-center gap-2 border-b border-[#e6e6e6] px-4">
        <span className="flex">
          {people.map((who) => (
            <span
              key={who}
              className={cn(
                '-ms-1.5 grid size-[24px] place-items-center rounded-full border-2 border-white text-[11px] font-bold first:ms-0',
                avatarTone[who],
              )}
            >
              {content.people[who].initial}
            </span>
          ))}
        </span>
        <svg className="ms-auto size-[24px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 7.5v9l7-4.5z" strokeLinejoin="round" />
        </svg>
        <span className="flex h-[24px] items-center rounded-[5px] bg-[#0d99ff] px-2.5 font-semibold text-white">
          Share
        </span>
      </div>
      <div className="flex h-[40px] items-center gap-4 border-b border-[#e6e6e6] px-4 font-semibold">
        <span>Design</span>
        <span className="text-[#1e1e1e80]">Prototype</span>
        <span className="ms-auto font-normal text-[#1e1e1e80]">100%</span>
      </div>
      <div className="min-h-0 shrink overflow-hidden">
        {selection === 'page' ? (
          <>
            <PanelSection title="Page">
              <Swatch fill="bg-[#e5e5e5]" value="E5E5E5" />
            </PanelSection>
            <PanelSection title={<>Variables {plus}</>}>
              <p className="text-[#1e1e1e80]">5 colors · 2 numbers</p>
            </PanelSection>
            <PanelSection title={<>Styles {plus}</>}>
              <p className="text-[#1e1e1e80]">Text · Color · Effect</p>
            </PanelSection>
            <PanelSection title={<>Export {plus}</>} />
          </>
        ) : selection === 'frame' ? (
          <>
            <PanelSection
              title={
                <>
                  Frame <span className="font-normal text-[#1e1e1e80]">iPhone 16</span>
                </>
              }
            >
              <span className="grid grid-cols-2 gap-1.5">
                <Field label="X" value="0" />
                <Field label="Y" value="0" />
                <Field label="W" value="393" />
                <Field label="H" value="852" />
              </span>
            </PanelSection>
            <PanelSection title={<>Auto layout {plus}</>}>
              <span className="grid grid-cols-2 gap-1.5">
                <Field label="↓" value="Vertical" />
                <Field label="Gap" value="16" />
                <Field label="Pad" value="16" />
                <Field label="Align" value="Top" />
              </span>
            </PanelSection>
            <PanelSection title={<>Fill {plus}</>}>
              <Swatch fill="bg-white" value="FFFFFF" />
            </PanelSection>
          </>
        ) : (
          <>
            <PanelSection
              title={
                <span className="flex items-center gap-1.5 text-[#9747ff]">
                  <LayerIcon icon="instance" /> PayButton
                </span>
              }
            >
              <span className="grid gap-1.5">
                <Field label="Language" value={stage >= STAGE.error ? 'AR' : 'EN'} />
                <Field label="State" value="Default" />
              </span>
            </PanelSection>
            <PanelSection title="Layout">
              <span className="grid grid-cols-2 gap-1.5">
                <Field label="W" value={stage === STAGE.done ? 'Hug' : 'Fixed'} />
                <Field label="H" value="48" />
                <Field label="Gap" value="16" />
                <Field label="Radius" value="14" />
              </span>
            </PanelSection>
            <PanelSection title={<>Fill {plus}</>}>
              <Swatch fill="bg-ink" value="17284F" />
            </PanelSection>
          </>
        )}
      </div>
      <StageNote stage={stage} />
    </div>
  );
}

/* ------------------------------------------------------------ canvas world */

function Cursor({ who }: { who: Person }) {
  return (
    <div
      data-cursor={who}
      className="pointer-events-none absolute top-0 left-0 z-30 will-change-transform"
    >
      <svg
        className={cn(
          'block size-[24px] origin-top-left [filter:drop-shadow(0_1px_2px_#0000004d)]',
          who === 'osama'
            ? 'fill-accent-rose'
            : who === 'developer'
              ? 'fill-primary'
              : 'fill-accent-warm',
        )}
        viewBox="0 0 24 24"
      >
        <path
          d="M3 2.5v17.5l5-4.6 3.4 7 3.2-1.5-3.3-6.8 6.9-.3z"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          'absolute top-[22px] left-[16px] rounded-[6px] px-2 py-[3px] text-[14px] font-semibold whitespace-nowrap',
          avatarTone[who],
        )}
      >
        {content.people[who].name}
      </span>
    </div>
  );
}

function Pin({ name, who, className }: { name: string; who: Person; className: string }) {
  return (
    <span
      data-el={name}
      className={cn(
        'absolute z-20 grid size-[34px] origin-bottom-left place-items-center rounded-[50%_50%_50%_4px] border-[2.5px] border-white text-[14px] font-bold [box-shadow:0_2px_8px_#00000033]',
        hidden,
        avatarTone[who],
        className,
      )}
    >
      {content.people[who].initial}
    </span>
  );
}

function Thread({
  name,
  messages,
  reactions,
  className,
}: {
  name: string;
  messages: readonly { who: Person; text: string }[];
  reactions?: readonly string[];
  className: string;
}) {
  return (
    <div
      data-el={name}
      className={cn(
        'absolute z-20 rounded-[14px] bg-white p-3 [box-shadow:0_0_0_1px_#0000000d,0_12px_32px_#00000029]',
        hidden,
        className,
      )}
    >
      {messages.map((message, index) => (
        <div
          key={message.text}
          data-el={index > 0 ? `${name}-${index}` : undefined}
          className={cn(
            'flex gap-2.5',
            index > 0 && 'mt-2.5 border-t border-[#e6e6e6] pt-2.5',
            index > 0 && hidden,
          )}
        >
          <span
            className={cn(
              'grid size-[26px] shrink-0 place-items-center rounded-full text-[12px] font-bold',
              avatarTone[message.who],
            )}
          >
            {content.people[message.who].initial}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">
              {content.people[message.who].name}{' '}
              <span className="font-normal text-[#1e1e1e80]">just now</span>
            </p>
            <p className="mt-0.5 text-[15px] leading-snug">{message.text}</p>
          </div>
        </div>
      ))}
      {reactions ? (
        <p data-el={`${name}-r`} className={cn('mt-2 flex gap-1.5', hidden)}>
          {reactions.map((reaction) => (
            <span
              key={reaction}
              className="rounded-full border border-[#0d99ff33] bg-[#e5f4ff] px-2 py-0.5 text-[13px] font-medium text-[#0d99ff]"
            >
              {reaction}
            </span>
          ))}
        </p>
      ) : (
        <p className="mt-2.5 rounded-[8px] border border-[#e6e6e6] px-2.5 py-1.5 text-[13px] text-[#1e1e1e66]">
          Reply
        </p>
      )}
    </div>
  );
}

function Section({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={cn(
        'absolute top-[20px] h-[560px] w-[860px] rounded-[10px] border border-[#d9d9d9] bg-[#f5f5f5]',
        className,
      )}
    >
      <span className="absolute top-2.5 left-3 rounded-[6px] bg-[#e6e6e6] px-2 py-0.5 text-[13px] font-medium text-[#1e1e1eb3]">
        {name}
      </span>
    </div>
  );
}

function Selection({ name, className }: { name: string; className: string }) {
  const handle = 'absolute size-[8px] border-[1.5px] border-[#0d99ff] bg-white';
  return (
    <span
      data-el={name}
      className={cn(
        'pointer-events-none absolute z-10 border-2 border-[#0d99ff]',
        hidden,
        className,
      )}
    >
      <span className={cn(handle, '-top-[5px] -left-[5px]')} />
      <span className={cn(handle, '-top-[5px] -right-[5px]')} />
      <span className={cn(handle, '-bottom-[5px] -left-[5px]')} />
      <span className={cn(handle, '-right-[5px] -bottom-[5px]')} />
    </span>
  );
}

function MiniScreen({ className, rows }: { className: string; rows: number }) {
  return (
    <div
      className={cn(
        'absolute flex flex-col gap-2 rounded-[12px] border border-[#e6e6e6] bg-white p-2.5',
        className,
      )}
    >
      <span className="h-[10px] w-1/2 rounded-full bg-[#1e1e1e33]" />
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} className="h-[18px] rounded-[5px] bg-[#f0f0f0]" />
      ))}
      <span className="mt-auto h-[22px] rounded-[6px] bg-ink" />
    </div>
  );
}

const noteSpots = ['left-[470px]', 'left-[600px]', 'left-[730px]'] as const;
const noteTilt = ['rotate-[-2deg]', 'rotate-[1.5deg]', 'rotate-[-1deg]'] as const;
const nodeSpots = [
  'left-[990px]',
  'left-[1155px]',
  'left-[1320px]',
  'left-[1485px]',
  'left-[1650px]',
] as const;
const arrowSpots = ['left-[1110px]', 'left-[1275px]', 'left-[1440px]', 'left-[1605px]'] as const;
const feelSpots = [
  'top-[184px] left-[1030px]',
  'top-[214px] left-[1180px]',
  'top-[198px] left-[1360px]',
  'top-[240px] left-[1500px] text-accent-rose',
  'top-[0px] left-[0px] hidden',
] as const;
const serviceSpots = ['top-[322px]', 'top-[380px]', 'top-[438px]'] as const;
const wireBoxes = [
  ['Header', 'top-[40px] h-[32px]'],
  ['Items', 'top-[84px] h-[120px]'],
  ['Payment', 'top-[220px] h-[70px]'],
  ['Total', 'top-[306px] h-[40px]'],
  ['PayButton', 'top-[424px] h-[44px]'],
] as const;

function World() {
  const c = content.comments;
  return (
    <>
      <BriefSection />
      <Thread
        name="thread-brief"
        messages={c.brief}
        className="top-[96px] left-[440px] w-[270px]"
      />

      {/* Section 2 · mapping */}
      <Section name="Mapping" className="left-[960px]" />
      <p
        data-el="heading-journey"
        className={cn(hand, 'absolute top-[52px] left-[1100px] text-[26px] leading-none', hidden)}
      >
        How people check out today
      </p>
      {content.journey.map((item, index) => (
        <span
          key={item.step}
          data-el={`node-${index}`}
          className={cn(
            'absolute top-[96px] grid h-[52px] w-[120px] place-items-center rounded-[12px] border-2 border-ink bg-white text-[18px] font-semibold',
            hidden,
            nodeSpots[index],
          )}
        >
          {item.step}
        </span>
      ))}
      {arrowSpots.map((spot, index) => (
        <svg
          key={spot}
          data-el={`arrow-${index}`}
          className={cn(
            'absolute top-[116px] h-[12px] w-[45px] origin-left text-ink',
            hidden,
            spot,
          )}
          viewBox="0 0 45 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 6h38M35 1.5L40 6l-5 4.5" />
        </svg>
      ))}
      <span
        data-el="pay-red"
        className={cn(
          'absolute top-[96px] left-[1485px] grid h-[52px] w-[120px] place-items-center rounded-[12px] border-2 border-accent-rose bg-[#fde7ee] text-[18px] font-semibold text-accent-rose',
          hidden,
        )}
      >
        Pay
      </span>
      <svg
        className="pointer-events-none absolute top-[160px] left-[990px] h-[80px] w-[780px] overflow-visible"
        viewBox="0 0 780 80"
        fill="none"
      >
        <path
          data-el="curve"
          className={hidden}
          d="M60 14 C140 14 160 44 225 44 S330 28 390 28 S500 70 555 70 S660 20 720 20"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          stroke="#17284f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {content.journey.map((item, index) => (
        <span
          key={item.step}
          data-feel
          className={cn(hand, 'absolute text-[22px] leading-none', hidden, feelSpots[index])}
        >
          {item.feel}
          {item.step === 'Pay' ? ' they give up here' : ''}
        </span>
      ))}
      <svg
        className="pointer-events-none absolute top-[82px] left-[1470px] h-[80px] w-[150px] overflow-visible"
        viewBox="0 0 150 80"
        fill="none"
      >
        <path
          data-el="pay-circle"
          className={hidden}
          d="M20 18 C50 2 120 4 140 30 C152 52 110 76 70 76 C30 76 2 60 6 38 C9 24 30 12 52 9"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          stroke="#e43468"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <SystemDiagram />
      <Pin name="pin-mapping" who="osama" className="top-[250px] left-[1484px]" />
      <Thread
        name="thread-mapping"
        messages={c.mapping}
        className="top-[278px] left-[1515px] w-[300px]"
      />

      {/* Section 3 · options */}
      <OptionsSection />

      {/* Section 4 · build */}
      <BuildSection />

      <Cursor who="client" />
      <Cursor who="developer" />
      <Cursor who="osama" />
    </>
  );
}

function BriefSection() {
  const notes = content.notes;
  return (
    <>
      <Section name="Brief & research" className="left-[20px]" />
      <div className="absolute top-[64px] left-[44px] w-[380px] rounded-[14px] bg-white p-5 [box-shadow:0_1px_3px_#0000001f]">
        <p className={cn(sans, 'text-[13px] text-primary')}>Brief · from Client</p>
        <p className="mt-2 text-[24px] leading-tight font-bold">“{content.brief}”</p>
        <p className="mt-2 text-[16px] text-[#1e1e1eb3]">{content.goal}</p>
        <p className="mt-3 flex flex-wrap gap-1.5">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[13px] font-medium"
            >
              {tag}
            </span>
          ))}
        </p>
      </div>
      <Pin name="pin-brief" who="client" className="top-[46px] left-[410px]" />
      <p
        data-el="heading-osama"
        className={cn(
          hand,
          'absolute top-[62px] left-[470px] text-[26px] text-accent-rose',
          hidden,
        )}
      >
        Osama heard
      </p>
      <p
        data-el="heading-developer"
        className={cn(hand, 'absolute top-[294px] left-[470px] text-[26px] text-primary', hidden)}
      >
        Developer heard
      </p>
      {notes.osama.map((note, index) => (
        <p
          key={note}
          data-el={`note-osama-${index}`}
          className={cn(
            hand,
            'absolute top-[100px] flex h-[104px] w-[118px] items-center p-3 text-[22px] leading-[1.05] [box-shadow:0_6px_14px_#0000001f]',
            hidden,
            index === 1 ? 'bg-accent-warm' : 'bg-secondary',
            noteSpots[index],
            noteTilt[index],
          )}
        >
          {note}
        </p>
      ))}
      {notes.developer.map((note, index) => (
        <p
          key={note}
          data-el={`note-developer-${index}`}
          className={cn(
            hand,
            'absolute top-[332px] flex h-[104px] w-[118px] items-center bg-[#d6e4ff] p-3 text-[22px] leading-[1.05] [box-shadow:0_6px_14px_#0000001f]',
            hidden,
            noteSpots[index],
            noteTilt[2 - index],
          )}
        >
          {note}
        </p>
      ))}
      <p
        data-el="question"
        className={cn(
          hand,
          'absolute top-[262px] left-[44px] flex h-[116px] w-[180px] rotate-[-1.5deg] items-center bg-[#fde7ee] p-4 text-[25px] leading-[1.05] text-accent-rose [box-shadow:0_6px_14px_#0000001f]',
          hidden,
        )}
      >
        {notes.question}
      </p>
      <div
        data-el="persona"
        className={cn(
          'absolute top-[262px] left-[240px] h-[116px] w-[184px] rounded-[12px] bg-white p-3.5 [box-shadow:0_1px_3px_#0000001f]',
          hidden,
        )}
      >
        <p className={cn(sans, 'text-[12px] text-[#1e1e1e80]')}>Persona</p>
        <p className="mt-1 text-[16px] font-bold">{content.persona.title}</p>
        <p className="mt-1 text-[14px] leading-snug text-[#1e1e1eb3]">{content.persona.goal}</p>
      </div>
      <div
        data-el="problem"
        className={cn(
          'absolute top-[404px] left-[44px] w-[380px] rounded-[12px] border-s-4 border-accent-rose bg-white p-4 [box-shadow:0_1px_3px_#0000001f]',
          hidden,
        )}
      >
        <p className={cn(sans, 'text-[12px] text-accent-rose')}>Problem statement</p>
        <p className="mt-1.5 text-[17px] leading-snug font-semibold">
          Shoppers on phones leave at Pay because it is slow and long.
        </p>
      </div>
    </>
  );
}

function SystemDiagram() {
  const s = content.system;
  const box =
    'absolute grid place-items-center rounded-[10px] border-2 border-primary bg-white text-[14px] font-semibold';
  return (
    <>
      <p
        data-el="heading-system"
        className={cn(hand, 'absolute top-[290px] left-[990px] text-[26px] text-primary', hidden)}
      >
        What happens behind Pay
      </p>
      <span
        data-el="box-screen"
        className={cn(box, 'top-[352px] left-[990px] h-[48px] w-[160px]', hidden)}
      >
        {s.screen}
      </span>
      <span
        data-el="box-api"
        className={cn(box, 'top-[352px] left-[1200px] h-[48px] w-[150px]', hidden)}
      >
        {s.api}
      </span>
      <div data-el="services">
        {s.services.map((service, index) => (
          <span
            key={service}
            data-el={`service-${index}`}
            className={cn(box, 'left-[1380px] h-[42px] w-[130px]', hidden, serviceSpots[index])}
          >
            {service}
          </span>
        ))}
        <span
          data-el="problem-calls"
          className={cn(
            sans,
            'absolute top-[500px] left-[1200px] text-[13px] text-accent-rose',
            hidden,
          )}
        >
          {s.problem}
        </span>
      </div>
      <svg
        className="pointer-events-none absolute top-[300px] left-[1150px] h-[220px] w-[240px] overflow-visible"
        viewBox="0 0 240 220"
        fill="none"
        stroke="#5b8dfb"
        strokeWidth="2"
      >
        {[
          'M0 76H50',
          'M200 76C215 76 215 43 230 43',
          'M200 76H230',
          'M200 76C215 76 215 159 230 159',
        ].map((d, index) => (
          <path
            key={d}
            data-el={`line-${index}`}
            className={hidden}
            d={d}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        ))}
        <path
          data-el="line-fix"
          className={hidden}
          d="M125 100V140"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      </svg>
      <span
        data-el="fix-call"
        className={cn(
          'absolute top-[440px] left-[1200px] grid h-[44px] w-[150px] place-items-center rounded-[10px] border-2 border-dashed border-primary bg-[#eef3ff] text-[14px] font-semibold text-primary',
          hidden,
        )}
      >
        ✓ {s.fix}
      </span>
    </>
  );
}

function OptionsSection() {
  return (
    <>
      <Section name="Options" className="left-[1900px]" />
      <p
        data-el="heading-options"
        className={cn(hand, 'absolute top-[52px] left-[2040px] text-[26px] leading-none', hidden)}
      >
        Two ways to fix it
      </p>
      {content.options.map((option, index) => (
        <div
          key={option.name}
          data-el={`option-${index}`}
          className={cn(
            'absolute top-[96px] h-[460px] w-[390px] rounded-[14px] bg-white [box-shadow:0_1px_3px_#0000001f]',
            index === 0 ? 'left-[1930px]' : 'left-[2350px]',
            hidden,
          )}
        >
          <p className="absolute top-[16px] left-[20px] text-[19px] font-bold">{option.name}</p>
          {index === 0 ? (
            <>
              <MiniScreen className="top-[56px] left-[20px] h-[200px] w-[104px]" rows={3} />
              <MiniScreen className="top-[56px] left-[143px] h-[200px] w-[104px]" rows={4} />
              <MiniScreen className="top-[56px] left-[266px] h-[200px] w-[104px]" rows={2} />
            </>
          ) : (
            <MiniScreen className="top-[56px] left-[20px] h-[300px] w-[150px]" rows={8} />
          )}
          <ul
            className={cn(
              'absolute flex flex-col gap-2 text-[17px] font-medium',
              index === 0 ? 'top-[280px] left-[20px]' : 'top-[60px] left-[192px] w-[180px]',
            )}
          >
            {option.points.map((point) => (
              <li
                key={point}
                data-point
                className={cn(hidden, point.startsWith('−') ? 'text-accent-rose' : 'text-ink')}
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Selection name="sel-b" className="top-[92px] left-[2346px] h-[468px] w-[398px]" />
      <span
        data-el="vote-osama"
        className={cn(
          sticker,
          'absolute top-[300px] left-[2545px] bg-accent-rose px-3 py-1.5 text-[15px] text-white',
          hidden,
        )}
      >
        O · votes B
      </span>
      <span
        data-el="vote-developer"
        className={cn(
          sticker,
          'absolute top-[346px] left-[2560px] bg-primary px-3 py-1.5 text-[15px] text-white',
          hidden,
        )}
      >
        D · votes B
      </span>
      <span
        data-el="chosen"
        className={cn(
          sticker,
          'absolute top-[460px] left-[2560px] rotate-[-6deg] bg-ink px-5 py-2.5 text-[22px] text-secondary',
          hidden,
        )}
      >
        ✓ Chosen
      </span>
      <Pin name="pin-screens" who="developer" className="top-[368px] left-[2240px]" />
      <Thread
        name="thread-screens"
        messages={content.comments.screens}
        className="top-[430px] left-[2040px] w-[250px]"
      />
    </>
  );
}

function PhoneFrame({
  name,
  label,
  className,
  labelClassName,
  children,
}: {
  name: string;
  label: string;
  className: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <>
      <p
        data-el={`${name}-label`}
        className={cn('absolute top-[50px] text-[13px] text-[#1e1e1e99]', hidden, labelClassName)}
      >
        {label}
      </p>
      <div
        data-el={name}
        className={cn(
          'absolute top-[72px] h-[488px] w-[236px] origin-top-left bg-white [box-shadow:0_1px_3px_#0000001f]',
          hidden,
          className,
        )}
      >
        <p className="absolute top-[12px] right-[18px] left-[18px] flex justify-between text-[13px] font-semibold">
          <span>9:41</span>
          <span>●●● ▮</span>
        </p>
        {children}
      </div>
    </>
  );
}

function CheckoutScreen({ variant }: { variant: 'main' | 'small' }) {
  const s = variant === 'main' ? content.screen : content.small;
  // The main frame is revealed piece by piece; the small-phone copy lands whole.
  const reveal = variant === 'main' ? hidden : undefined;
  const hifi = variant === 'main' || undefined;
  const thumbs = [
    'bg-[linear-gradient(135deg,#f3d061,#f8fa55)]',
    'bg-[linear-gradient(135deg,#5b8dfb,#b9cffd)]',
  ] as const;
  return (
    <div>
      <div
        data-hifi={hifi}
        className={cn(
          'absolute top-[40px] right-[16px] left-[16px] flex items-center gap-2',
          reveal,
        )}
      >
        <span className="grid size-[26px] place-items-center rounded-full bg-[#f1f3f8] text-[14px] leading-none">
          ‹
        </span>
        <p className="text-[18px] font-bold tracking-[-0.02em]">{s.title}</p>
        <span className="ms-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
          {s.step}
        </span>
      </div>
      {s.items.map((item, index) => (
        <div
          key={item.name}
          data-hifi={hifi}
          className={cn(
            'absolute right-[16px] left-[16px] flex h-[52px] items-center gap-2 rounded-[14px] bg-white px-2 [box-shadow:0_0_0_1px_#17284f14,0_6px_16px_-8px_#17284f40]',
            index === 0 ? 'top-[84px]' : 'top-[152px]',
            reveal,
          )}
        >
          <span
            className={cn(
              'grid size-[36px] shrink-0 place-items-center rounded-[10px] text-[18px]',
              thumbs[index],
            )}
          >
            {item.thumb}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[13px] font-semibold">{item.name}</span>
            <span className="block text-[11px] text-[#17284f80]">{item.meta}</span>
          </span>
          <span className="ms-auto text-[13px] font-bold whitespace-nowrap">{item.price}</span>
        </div>
      ))}
      <div data-hifi={hifi} className={cn('absolute top-[220px] right-[16px] left-[16px]', reveal)}>
        <span className="inline-block rounded-full bg-[#eef3ff] px-2 py-0.5 text-[11px] font-semibold text-primary">
          🚚 {s.delivery}
        </span>
        <span className="mt-2 flex h-[36px] rounded-[11px] bg-[#f1f3f8] p-1 text-[12px] font-semibold">
          {s.methods.map((method, index) => (
            <span
              key={method}
              className={cn(
                'grid flex-1 place-items-center rounded-[8px]',
                index === 0
                  ? 'bg-ink text-white [box-shadow:0_2px_6px_#17284f40]'
                  : 'text-[#17284f80]',
              )}
            >
              {method}
            </span>
          ))}
        </span>
      </div>
      <div
        data-hifi={hifi}
        className={cn(
          'absolute top-[306px] right-[16px] left-[16px] border-t border-dashed border-[#17284f26] pt-2.5',
          reveal,
        )}
      >
        <p className="flex items-baseline justify-between">
          <span className="text-[12px] text-[#17284f99]">{s.totalLabel}</span>
          <strong className="text-[19px] tracking-[-0.02em]">{s.total}</strong>
        </p>
      </div>
      <span className="absolute bottom-[8px] left-1/2 h-[4px] w-[80px] -translate-x-1/2 rounded-full bg-[#17284f33]" />
    </div>
  );
}

const payFill =
  'rounded-[14px] bg-[linear-gradient(120deg,#5b8dfb,#17284f_72%)] [box-shadow:0_10px_22px_-8px_#5b8dfb]';

function BuildSection() {
  const s = content.screen;
  const a = content.small;
  const c = content.comments;
  const r = content.reactions;
  return (
    <>
      <Section name="Checkout" className="left-[2840px]" />
      <PhoneFrame
        name="frame"
        label={content.figma.frame}
        className="left-[2864px]"
        labelClassName="left-[2864px]"
      >
        <div data-el="wire" className={hidden}>
          {wireBoxes.map(([label, box]) => (
            <span
              key={label}
              className={cn(
                sans,
                'absolute right-[16px] left-[16px] rounded-[8px] border-[1.5px] border-dashed border-[#0d99ff] p-1.5 text-[12px] text-[#0d99ff]',
                box,
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <CheckoutScreen variant="main" />
        <div
          data-el="pay-button"
          className={cn('absolute top-[424px] left-[16px] h-[44px] w-[204px]', hidden)}
        >
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-between ps-3.5 pe-1.5 text-[14px] font-semibold text-white',
              payFill,
            )}
          >
            {s.cta}
            <span className="grid size-[32px] place-items-center rounded-[9px] bg-[#ffffff26] text-[16px]">
              →
            </span>
          </span>
          <Selection name="sel-pay" className="-inset-[3px]" />
        </div>
        <div data-el="redlines" className={hidden}>
          <span className="absolute top-[136px] left-[118px] h-[16px] w-px bg-accent-rose" />
          <span className="absolute top-[136px] left-[110px] h-px w-[16px] bg-accent-rose" />
          <span className="absolute top-[152px] left-[110px] h-px w-[16px] bg-accent-rose" />
          <span
            className={cn(
              sans,
              'absolute top-[134px] left-[128px] rounded-[4px] bg-accent-rose px-1 text-[12px] text-white',
            )}
          >
            16
          </span>
          <span className="absolute top-[446px] left-0 h-px w-[16px] bg-accent-rose" />
          <span
            className={cn(
              sans,
              'absolute top-[448px] left-[1px] rounded-[4px] bg-accent-rose px-1 text-[12px] text-white',
            )}
          >
            16
          </span>
        </div>
      </PhoneFrame>
      <Selection name="sel-frame" className="top-[70px] left-[2862px] h-[492px] w-[240px]" />
      <span
        data-el="size-badge"
        className={cn(
          'absolute top-[568px] left-[2936px] rounded-[4px] bg-[#0d99ff] px-1.5 py-0.5 text-[12px] font-medium text-white',
          hidden,
        )}
      >
        {content.figma.size}
      </span>

      {/* The component set, then the variables it is built from. */}
      <div data-el="components" className={hidden}>
        <p className="absolute top-[70px] left-[3130px] flex items-center gap-1.5 text-[14px] font-semibold text-[#9747ff]">
          <LayerIcon icon="component" /> PayButton
        </p>
        <div className="absolute top-[94px] left-[3130px] flex h-[110px] w-[176px] flex-col gap-2.5 rounded-[8px] border-[1.5px] border-dashed border-[#9747ff] p-2.5">
          {[s.cta, s.ctaLoading].map((label, index) => (
            <span
              key={label}
              className={cn(
                'flex h-[40px] items-center justify-between ps-3 pe-1 text-[14px] font-semibold text-white',
                payFill,
              )}
            >
              {label}
              <span className="grid size-[30px] place-items-center rounded-[9px] bg-[#ffffff26]">
                {index ? '◌' : '→'}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div data-el="tokens" className={hidden}>
        <p className="absolute top-[236px] left-[3130px] text-[14px] font-semibold">Color styles</p>
        <span className="absolute top-[262px] left-[3130px] flex gap-1.5">
          {['bg-primary', 'bg-secondary', 'bg-accent-warm', 'bg-accent-rose', 'bg-ink'].map(
            (fill) => (
              <span
                key={fill}
                className={cn('size-[26px] rounded-full border border-[#0000001a]', fill)}
              />
            ),
          )}
        </span>
        <span className={cn(sans, 'absolute top-[300px] left-[3130px] flex gap-1.5 text-[13px]')}>
          <span className="rounded-[6px] bg-white px-2 py-1">space/16</span>
          <span className="rounded-[6px] bg-white px-2 py-1">radius/14</span>
        </span>
      </div>
      <Thread
        name="thread-result"
        messages={c.result}
        reactions={r.result}
        className="top-[236px] left-[3110px] w-[225px]"
      />

      {/* 6 · Dev Mode: the PayButton streams into code. */}
      <div
        data-el="code"
        className={cn(
          'absolute top-[72px] left-[3340px] w-[320px] origin-top-left overflow-hidden rounded-[12px] bg-[#1e1e1e] [box-shadow:0_16px_36px_#00000040]',
          hidden,
        )}
      >
        <p className="flex items-center gap-2 border-b border-[#ffffff1a] px-3 py-2 text-[12px] text-[#ffffffb3]">
          <span className="rounded-[5px] bg-[#0fa958] px-1.5 py-0.5 font-semibold text-white">
            {'</>'} Dev Mode
          </span>
          <span className={code}>{content.code.file}</span>
          <span className="ms-auto text-[#ffffff66]">React</span>
        </p>
        <div className={cn(code, 'px-3 py-2 text-[12.5px] leading-[17px]')}>
          {content.code.lines.map((line, index) => (
            <p key={line} data-code-line className={cn('flex gap-3 whitespace-pre', hidden)}>
              <span className="w-[14px] text-end text-[#ffffff40]">{index + 1}</span>
              <span
                className={
                  line.includes('=')
                    ? 'text-[#f3d061]'
                    : line.includes('{')
                      ? 'text-[#ff8fb1]'
                      : 'text-[#8fb2fd]'
                }
              >
                {line}
              </span>
            </p>
          ))}
        </div>
      </div>
      <Pin name="pin-tokens" who="developer" className="top-[266px] left-[3302px]" />
      <Thread
        name="thread-tokens"
        messages={c.tokens}
        reactions={r.tokens}
        className="top-[264px] left-[3340px] w-[320px]"
      />

      {/* 7 · Waiting for the client's yes. */}
      <div
        data-el="approval"
        className={cn(
          'absolute top-[72px] left-[3340px] w-[320px] origin-top-left rounded-[16px] bg-white p-4 [box-shadow:0_0_0_1px_#0000000d,0_14px_34px_#00000024]',
          hidden,
        )}
      >
        <p className="flex items-center gap-2 text-[16px] font-bold">
          ⏳ {content.approval.title}
          <span className="ms-auto rounded-full bg-accent-warm px-2 py-0.5 text-[11px] font-bold">
            In review
          </span>
        </p>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-[#1e1e1e99]">
          <span
            className={cn(
              'grid size-[22px] place-items-center rounded-full text-[11px] font-bold',
              avatarTone.client,
            )}
          >
            {content.people.client.initial}
          </span>
          {content.approval.by}
          <span className="flex gap-0.5">
            <span className="size-[4px] rounded-full bg-[#1e1e1e66]" />
            <span className="size-[4px] rounded-full bg-[#1e1e1e40]" />
            <span className="size-[4px] rounded-full bg-[#1e1e1e26]" />
          </span>
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {content.approval.items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-[8px] bg-[#f5f5f5] px-2.5 py-1.5"
            >
              <span className="size-[8px] rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Pin name="pin-review" who="client" className="top-[256px] left-[3302px]" />
      <Thread
        name="thread-review"
        messages={c.review}
        reactions={r.review}
        className="top-[254px] left-[3340px] w-[320px]"
      />

      {/* 8 · The small-phone frame breaks; 9 · it is fixed and shipped. */}
      <PhoneFrame
        name="frame-sm"
        label={content.figma.frameSmall}
        className="left-[3340px]"
        labelClassName="left-[3340px]"
      >
        <CheckoutScreen variant="small" />
        <div className="absolute top-[424px] left-[16px] h-[44px] w-[204px]">
          <span className={cn('absolute inset-0', payFill)} />
          <p
            data-el="sm-long"
            className="absolute inset-y-0 left-3 flex items-center text-[14px] font-semibold whitespace-nowrap text-white"
          >
            <span className="rounded-[4px] bg-ink pe-1">{a.ctaLong}</span>
          </p>
          <p
            data-el="sm-fixed"
            className={cn(
              'absolute inset-0 flex items-center justify-between ps-3.5 pe-1.5 text-[14px] font-semibold text-white',
              hidden,
            )}
          >
            {a.cta}
            <span className="grid size-[32px] place-items-center rounded-[9px] bg-[#ffffff26] text-[16px]">
              →
            </span>
          </p>
          <span
            data-el="sm-outline"
            className={cn(
              'absolute -inset-[4px] rounded-[17px] border-2 border-accent-rose',
              hidden,
            )}
          />
        </div>
      </PhoneFrame>
      <span
        data-el="error-note"
        className={cn(
          sticker,
          hand,
          'absolute top-[548px] left-[3380px] rotate-[-4deg] bg-accent-rose px-3 py-1.5 text-[22px] font-bold text-white',
          hidden,
        )}
      >
        {content.errorNote}
      </span>
      <Pin name="pin-small" who="developer" className="top-[452px] left-[3560px] !bg-accent-rose" />
      <Thread
        name="thread-small"
        messages={c.small}
        className="top-[64px] left-[3110px] w-[220px]"
      />
      <div
        data-el="test"
        className={cn(
          code,
          'absolute top-[488px] left-[3110px] w-[220px] origin-top-left rounded-[10px] bg-[#1e1e1e] px-3 py-2 text-[12px] text-[#ffffffb3]',
          hidden,
        )}
      >
        <p>{content.test.name}</p>
        <p data-el="test-fail" className="mt-1 text-[#ff8fb1]">
          {content.test.fail}
        </p>
        <p data-el="test-pass" className={cn('-mt-[18px] text-[#3ddc84]', hidden)}>
          {content.test.pass}
        </p>
      </div>
      <span
        data-el="approved"
        className={cn(
          sticker,
          'absolute top-[236px] left-[3384px] rotate-[-5deg] bg-primary px-5 py-2.5 text-[22px] text-white',
          hidden,
        )}
      >
        ✓ Approved
      </span>
      <span
        data-el="live"
        className={cn(
          sticker,
          'absolute top-[420px] left-[3130px] flex items-center gap-2 bg-white px-3.5 py-2 text-[15px] text-ink',
          hidden,
        )}
      >
        <span className="size-[9px] rounded-full bg-[#3ddc84] [box-shadow:0_0_0_4px_#3ddc8433]" />
        {content.live}
      </span>
      <Thread
        name="thread-done"
        messages={c.done}
        reactions={r.done}
        className="top-[64px] left-[3110px] w-[220px]"
      />
      {content.confetti.map((emoji, index) => (
        <span
          key={emoji}
          data-confetti
          className={cn(
            'absolute text-[34px] leading-none',
            hidden,
            confettiSpots[index % confettiSpots.length],
          )}
        >
          {emoji}
        </span>
      ))}
    </>
  );
}

const confettiSpots = [
  'top-[96px] left-[3610px] rotate-[-12deg]',
  'top-[250px] left-[3620px] rotate-[10deg]',
  'top-[44px] left-[3500px] rotate-[8deg]',
  'top-[392px] left-[3630px] rotate-[-6deg]',
] as const;
