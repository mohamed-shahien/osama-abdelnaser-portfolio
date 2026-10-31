'use client';

import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';

/**
 * A light cue for the footer's "Book a meeting" button: once the rings have
 * drawn it, a soft ring pulses out of it (the ring already reads "Book a meeting"). Nothing
 * takes over the screen or the scroll; scrolling back up plays it in reverse,
 * and the pulse rests while the footer is off screen or the tab is hidden.
 * The pieces are added next to the button, which the footer draws itself.
 */
export function BookingCtaDrop() {
  useGSAP(() => {
    const band = document.querySelector<HTMLElement>('[data-slot="tangle-footer"]');
    if (!band) return;
    const media = gsap.matchMedia();
    media.add(motionConfig.queries.full, () => {
      // The footer draws its button only once it has measured itself, so the
      // pieces are added on the first visit.
      let parts: {
        cta: HTMLElement;
        pulse: HTMLElement;
        beat: gsap.core.Tween;
      } | null = null;
      const place = () => {
        if (!parts) return;
        const { cta, pulse } = parts;
        pulse.style.width = cta.offsetWidth + 'px';
        pulse.style.height = cta.offsetHeight + 'px';
      };
      const build = () => {
        if (parts) return parts;
        const cta = band.querySelector<HTMLElement>('[data-tangle-cta]');
        const host = cta?.parentElement;
        if (!cta || !host) return null;
        const pulse = document.createElement('span');
        pulse.setAttribute('aria-hidden', 'true');
        pulse.className =
          'pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-accent-rose opacity-0';
        host.append(pulse);
        const beat = gsap.fromTo(
          pulse,
          { scale: 1, opacity: 0.85 },
          {
            scale: 1.7,
            opacity: 0,
            duration: 1.4,
            ease: 'power2.out',
            repeat: -1,
            repeatDelay: 1.1,
            transformOrigin: '50% 100%',
            paused: true,
          },
        );
        parts = { cta, pulse, beat };
        place();
        return parts;
      };

      let near = false;
      const run = () => {
        if (!parts) return;
        const { beat, pulse } = parts;
        const on = near && !document.hidden;
        if (on === !beat.paused()) return;
        if (on) beat.restart();
        else {
          beat.pause();
          gsap.set(pulse, { opacity: 0 });
        }
      };
      // Shown once the button has risen with the rings.
      const show = ScrollTrigger.create({
        trigger: band,
        start: () => (window.innerWidth < 768 ? 'top 35%' : 'top 55%'),
        invalidateOnRefresh: true,
        onToggle: (self) => {
          near = self.isActive;
          if (near) build();
          run();
        },
        onRefresh: place,
      });
      document.addEventListener('visibilitychange', run);
      return () => {
        document.removeEventListener('visibilitychange', run);
        show.kill();
        if (parts) {
          parts.beat.kill();
          parts.pulse.remove();
        }
      };
    });
    return () => media.revert();
  });

  return null;
}
