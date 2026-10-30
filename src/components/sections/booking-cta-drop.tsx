'use client';

import { useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { footerBookKicker, footerBookLabel } from '@/content/footer';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

const noop = () => () => {};
const ease = gsap.parseEase('power3.inOut');
const rise = gsap.parseEase('power2.out');
const part = (value: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (value - from) / (to - from)));

/**
 * The portfolio's last word, made big: as the footer's rings scroll in, an ink
 * dome rises from the bottom of the screen until "Book a meeting" fills it,
 * then shrinks, scrubbed by scroll, until it is exactly the semicircle button
 * at the centre of the rings, and hands over to it. A fixed layer in a portal,
 * because the footer clips and contains its own children.
 */
export function BookingCtaDrop() {
  const domeRef = useRef<HTMLDivElement>(null);
  // The portal target exists only in the browser.
  const client = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  useGSAP(
    () => {
      const dome = domeRef.current;
      const band = document.querySelector<HTMLElement>('[data-slot="tangle-footer"]');
      if (!dome || !band) return;
      const words = dome.querySelector<HTMLElement>('[data-drop-words]');
      const media = gsap.matchMedia();
      media.add(motionConfig.queries.full, () => {
        let radius = 0;
        let shown = '';
        const size = () => {
          // The dome's own size: big enough to cover the screen from its bottom centre.
          radius = Math.ceil(Math.hypot(window.innerWidth / 2, window.innerHeight)) + 2;
          dome.style.width = radius * 2 + 'px';
          dome.style.height = radius + 'px';
          dome.style.setProperty('--drop-vh', window.innerHeight + 'px');
        };
        const paint = (progress: number) => {
          const cta = band.querySelector<HTMLElement>('[data-tangle-cta]');
          const visible = progress > 0 && progress < 1 && Boolean(cta);
          const next = visible ? 'on' : 'off';
          if (next !== shown) {
            shown = next;
            dome.style.visibility = visible ? 'visible' : 'hidden';
          }
          if (!visible || !cta) return;
          const rect = cta.getBoundingClientRect();
          const end = rect.height;
          // Rise to fill the screen, hold, then shrink onto the button.
          const grow = rise(part(progress, 0, 0.3));
          const shrink = ease(part(progress, 0.42, 1));
          const r = Math.max(1, radius * grow - (radius - end) * shrink);
          const cx = rect.left + rect.width / 2;
          const bottom = Math.min(window.innerHeight, rect.bottom);
          dome.style.transform = `translate3d(${(cx - radius).toFixed(1)}px,${(bottom - radius).toFixed(1)}px,0) scale(${(r / radius).toFixed(4)})`;
          if (words) words.style.opacity = String(1 - part(progress, 0.8, 0.94));
        };
        size();
        const trigger = ScrollTrigger.create({
          id: 'booking-cta-drop',
          trigger: band,
          start: 'top bottom',
          // Lands as the rings finish drawing round the button; a phone's band is
          // short, so it gets more road.
          end: () => (window.innerWidth < 768 ? 'clamp(bottom 40%)' : 'clamp(bottom 72%)'),
          invalidateOnRefresh: true,
          onUpdate: (self) => paint(self.progress),
          onRefresh: (self) => {
            size();
            paint(self.progress);
          },
        });
        paint(trigger.progress);
        return () => {
          dome.style.visibility = 'hidden';
          dome.style.removeProperty('transform');
        };
      });
      return () => media.revert();
    },
    { dependencies: [client] },
  );

  if (!client) return null;
  return createPortal(
    <div
      ref={domeRef}
      aria-hidden="true"
      className="pointer-events-none [visibility:hidden] fixed start-0 top-0 z-40 origin-bottom overflow-hidden rounded-t-full bg-ink text-secondary motion-reduce:hidden"
    >
      <div
        data-drop-words
        className="absolute inset-x-0 bottom-[calc(var(--drop-vh)*0.5)] flex translate-y-1/2 flex-col items-center text-center"
      >
        <span className="mb-[1.2vw] text-[max(14px,1.6vw)] font-medium tracking-[0.2em] uppercase">
          {footerBookKicker}
        </span>
        <span className="text-[min(11vw,18vh)] leading-[0.9] font-bold tracking-[-0.05em]">
          {footerBookLabel}
        </span>
        <span className="mt-[1.4vw] text-[min(8vw,12vh)] leading-none">↗</span>
      </div>
    </div>,
    document.body,
  );
}
