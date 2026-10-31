'use client';

import { useEffect, useRef } from 'react';

import type { Skill } from '@/content/skills';
import { cn } from '@/lib/utils';

// Skill tags — adapted from the supplied Gravity Tags: the same solid pills,
// the same physics (axis-aligned bodies separated along their smaller
// overlap), the same pointer push and the same loop that parks once the pile
// is at rest. Adapted for the skills stage: brand colours, the whole stage as
// the box, the title as a solid keep-out, a round halo the size of the closing
// iris round the glasses that tags may pile over but never cover, a drop
// released by scroll, and every tag can be grabbed, dragged and thrown.

/** Driven by the parent's scroll: above 0 the tags drop, back at 0 they lift away. */
export class BubbleDriver {
  progress = 0;
  private listener: ((progress: number) => void) | undefined;
  set(progress: number) {
    if (progress === this.progress) return;
    this.progress = progress;
    this.listener?.(progress);
  }
  listen(listener: (progress: number) => void) {
    this.listener = listener;
    return () => {
      if (this.listener === listener) this.listener = undefined;
    };
  }
}

/** A box the tags keep clear of, in px from the stage's top-left corner. */
export type BubbleKeepOut = { left: number; top: number; right: number; bottom: number };

/** A round keep-out, in px from the stage's top-left corner. */
export type BubbleHalo = { x: number; y: number; r: number };

// The brand's three tag colours, cycled through the list.
const COLORS = ['#F5FB5D', '#698BF9', '#DB3E69'] as const;
const INK = '#17284F';

/** Ink or white, whichever reads better on the hex colour (WCAG contrast). */
function readableInk(hex: string) {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  // The ink's own luminance is about 0.022.
  return (lum + 0.05) / 0.072 >= 1.05 / (lum + 0.05) ? INK : '#ffffff';
}

// Clear space kept round the keep-outs.
const HALO = 18;
const GRAVITY = 0.42;
const BOUNCE = 0.35;

interface Body {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  spin: number;
}

export function SkillBubbles({
  skills,
  driver,
  keepOut,
  halo,
  label = 'Skills',
  className,
}: {
  skills: readonly Skill[];
  driver: BubbleDriver;
  /** Solid boxes the pile rests on and flows round, measured from the tags' own box. */
  keepOut: (root: HTMLElement) => BubbleKeepOut[];
  /** A solid circle the tags may pile over but never cover. */
  halo?: (root: HTMLElement) => BubbleHalo | null;
  label?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-gravity]'));
    let bodies: Body[] = [];
    let walls: BubbleKeepOut[] = [];
    let ring: BubbleHalo | null = null;
    let width = 0;
    let height = 0;
    let frame = 0;
    let idle = 0;
    let ticks = 0;
    let dropped = false;
    const pointer = { x: -9999, y: -9999, active: false };
    const grab = { body: null as Body | null, dx: 0, dy: 0, lastX: 0, lastY: 0, id: -1 };

    const write = (body: Body) => {
      body.el.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0) rotate(${body.angle.toFixed(1)}deg)`;
    };

    const measure = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      walls = keepOut(root).map((k) => ({
        left: k.left - HALO,
        top: k.top - HALO,
        right: k.right + HALO,
        bottom: k.bottom + HALO,
      }));
      ring = halo?.(root) ?? null;
    };

    // Anywhere across the stage: a tag over the title falls past it, and one
    // over the halo slides off either side, so the pile lands somewhere new.
    const column = (w: number) => 12 + Math.random() * Math.max(1, width - w - 24);

    // Staggered over the top of the stage in a shuffled order, out of sight,
    // a tag height apart so no two start overlapped.
    const spawn = () => {
      measure();
      const order = elements.map((_, index) => index);
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = order[i] ?? i;
        order[i] = order[j] ?? j;
        order[j] = swap;
      }
      bodies = elements.map((el, index) => ({
        el,
        x: column(el.offsetWidth),
        y: -el.offsetHeight - 20 - (order[index] ?? index) * (el.offsetHeight + 12),
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
        w: el.offsetWidth,
        h: el.offsetHeight,
        angle: (Math.random() - 0.5) * 24,
        spin: (Math.random() - 0.5) * 1.6,
      }));
      for (const body of bodies) write(body);
    };

    // The halo: a solid circle the size of the iris's last hold round the
    // glasses. A tag may land on it and pile over it, never inside it: out
    // along the normal, losing the speed it had into the circle.
    const collideHalo = (body: Body, { x: cx, y: cy, r }: BubbleHalo) => {
      const nx = Math.max(body.x, Math.min(cx, body.x + body.w));
      const ny = Math.max(body.y, Math.min(cy, body.y + body.h));
      let dx = nx - cx;
      let dy = ny - cy;
      let distance = Math.hypot(dx, dy);
      if (distance >= r) return;
      if (distance < 0.5) {
        dx = 0;
        dy = -1;
        distance = 1;
      }
      const ux = dx / distance;
      const uy = dy / distance;
      body.x += ux * (r - distance);
      body.y += uy * (r - distance);
      const into = body.vx * ux + body.vy * uy;
      if (into < 0) {
        body.vx -= (1 + BOUNCE) * into * ux;
        body.vy -= (1 + BOUNCE) * into * uy;
        body.spin *= 0.7;
      }
      // Balanced on the crown, it is nudged off so no tower stands on it.
      if (uy < -0.92) body.vx += (body.x + body.w / 2 < cx ? -1 : 1) * 0.35;
    };

    const step = () => {
      let moving = false;
      // The title and the glasses settle while the tags fall: re-read them.
      ticks += 1;
      if (ticks % 12 === 0) measure();
      for (const body of bodies) {
        if (body === grab.body) continue;
        body.vy += GRAVITY;
        body.x += body.vx;
        body.y += body.vy;
        body.angle += body.spin;
        body.spin *= 0.98;

        if (pointer.active && !grab.body) {
          const dx = body.x + body.w / 2 - pointer.x;
          const dy = body.y + body.h / 2 - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 90 && distance > 0.5) {
            const push = (1 - distance / 90) * 3.2;
            body.vx += (dx / distance) * push;
            body.vy += (dy / distance) * push;
            body.spin += (dx / distance) * 0.5;
          }
        }

        // Walls and floor.
        if (body.x < 0) {
          body.x = 0;
          body.vx = -body.vx * BOUNCE;
        }
        if (body.x + body.w > width) {
          body.x = width - body.w;
          body.vx = -body.vx * BOUNCE;
        }
        if (body.y + body.h > height) {
          body.y = height - body.h;
          body.vy = -body.vy * BOUNCE;
          body.vx *= 0.86;
          body.spin *= 0.7;
        }

        // The keep-outs (the title) are solid from below only: the rain falls
        // past them, and nothing piles up into them.
        for (const k of walls) {
          const overlapX = Math.min(body.x + body.w, k.right) - Math.max(body.x, k.left);
          const overlapY = Math.min(body.y + body.h, k.bottom) - Math.max(body.y, k.top);
          if (overlapX <= 0 || overlapY <= 0) continue;
          if (body.y - body.vy < k.bottom - 1) continue;
          body.y = k.bottom;
          body.vy = Math.max(0, body.vy);
        }

        if (ring) collideHalo(body, ring);
      }

      // Pairwise, separated along the *smaller* overlap.
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = bodies[i];
          const b = bodies[j];
          if (!a || !b) continue;
          const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          // A held tag does not give way; the other takes the whole push.
          const aHeld = a === grab.body;
          const bHeld = b === grab.body;
          const shareA = aHeld ? 0 : bHeld ? 1 : 0.5;
          const shareB = 1 - shareA;

          if (overlapX < overlapY) {
            const shift = overlapX * (a.x < b.x ? -1 : 1);
            a.x += shift * shareA;
            b.x -= shift * shareB;
            const swap = a.vx;
            if (!aHeld) a.vx = b.vx * BOUNCE;
            if (!bHeld) b.vx = swap * BOUNCE;
          } else {
            const shift = overlapY * (a.y < b.y ? -1 : 1);
            a.y += shift * shareA;
            b.y -= shift * shareB;
            const swap = a.vy;
            if (!aHeld) a.vy = b.vy * BOUNCE;
            if (!bHeld) b.vy = swap * BOUNCE;
            a.spin *= 0.8;
            b.spin *= 0.8;
          }
        }
      }

      for (const body of bodies) {
        write(body);
        if (Math.abs(body.vx) > 0.12 || Math.abs(body.vy) > 0.12) moving = true;
      }

      // A pile at rest should not cost a frame.
      idle = moving || pointer.active || grab.body ? 0 : idle + 1;
      if (idle > 40 || document.hidden) {
        frame = 0;
        root.dataset.moving = 'false';
        return;
      }
      frame = requestAnimationFrame(step);
    };

    const wake = () => {
      if (!frame && dropped && !document.hidden) {
        idle = 0;
        // Bubbles get their own layers only while they move.
        root.dataset.moving = 'true';
        frame = requestAnimationFrame(step);
      }
    };

    const local = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dropped) return;
      const at = local(event);
      pointer.x = at.x;
      pointer.y = at.y;
      pointer.active = true;
      if (grab.body && event.pointerId === grab.id) {
        const body = grab.body;
        body.vx = (at.x - grab.lastX) * 0.9;
        body.vy = (at.y - grab.lastY) * 0.9;
        body.x = Math.max(0, Math.min(width - body.w, at.x - grab.dx));
        body.y = Math.max(-body.h, Math.min(height - body.h, at.y - grab.dy));
        grab.lastX = at.x;
        grab.lastY = at.y;
      }
      wake();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-gravity]');
      const body = bodies.find((b) => b.el === target);
      if (!dropped || !body || event.button !== 0) return;
      event.preventDefault();
      target?.setPointerCapture(event.pointerId);
      const at = local(event);
      grab.body = body;
      grab.id = event.pointerId;
      grab.dx = at.x - body.x;
      grab.dy = at.y - body.y;
      grab.lastX = at.x;
      grab.lastY = at.y;
      body.el.dataset.held = 'true';
      body.spin = 0;
      wake();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== grab.id || !grab.body) return;
      const body = grab.body;
      delete body.el.dataset.held;
      // Let go: it keeps the throw.
      body.spin = body.vx * 0.4;
      grab.body = null;
      grab.id = -1;
      wake();
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const drop = () => {
      if (dropped) return;
      dropped = true;
      spawn();
      root.dataset.dropped = 'true';
      wake();
    };
    const lift = () => {
      if (!dropped) return;
      dropped = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      grab.body = null;
      root.dataset.dropped = 'false';
    };
    const sync = (progress: number) => (progress > 0 ? drop() : lift());

    // A new size keeps the pile but re-reads the box and the keep-outs.
    const resize = new ResizeObserver(() => {
      if (!dropped) return;
      measure();
      for (const body of bodies) {
        body.w = body.el.offsetWidth;
        body.h = body.el.offsetHeight;
      }
      wake();
    });
    resize.observe(root);
    const visibility = () => {
      if (!document.hidden) wake();
    };

    const stop = driver.listen(sync);
    sync(driver.progress);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointerup', onPointerUp);
    root.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stop();
      resize.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('visibilitychange', visibility);
      for (const el of elements) el.style.removeProperty('transform');
    };
  }, [skills, driver, keepOut, halo]);

  return (
    <ul
      ref={rootRef}
      aria-label={label}
      data-dropped="false"
      className={cn(
        'group/tags pointer-events-none absolute inset-0 data-[dropped=true]:pointer-events-auto',
        className,
      )}
    >
      {skills.map((skill, index) => {
        const color = COLORS[index % COLORS.length] ?? COLORS[0];
        return (
          <li
            key={skill.label}
            data-gravity=""
            className="absolute start-0 top-0 inline-flex cursor-grab touch-none items-center rounded-full px-3 py-1.5 text-[12px] font-bold whitespace-nowrap opacity-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.75)] transition-[opacity,box-shadow] duration-300 select-none group-data-[dropped=true]/tags:opacity-100 group-data-[moving=true]/tags:will-change-transform data-[held=true]:cursor-grabbing data-[held=true]:shadow-[0_22px_40px_-14px_rgba(0,0,0,0.85)] md:px-6 md:py-3 md:text-[19px]"
            style={{ background: color, color: readableInk(color) }}
          >
            {skill.label}
          </li>
        );
      })}
    </ul>
  );
}
