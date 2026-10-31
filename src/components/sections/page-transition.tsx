'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ComponentProps } from 'react';

import { workDisplay } from '@/config/work-fonts';
import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';

type Pending = { href: string; label: string };

// The layer mounted in the root layout registers itself here, so a link on a
// page that is about to be hidden never owns the overlay.
let begin: ((pending: Pending) => void) | null = null;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (time: number) => {
    const sample = (t: number, a: number, b: number) =>
      3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
    let low = 0,
      high = 1,
      t = time;
    for (let i = 0; i < 14; i++) {
      if (sample(t, x1, x2) < time) low = t;
      else high = t;
      t = (low + high) * 0.5;
    }
    return sample(t, y1, y2);
  };
}

/**
 * Opens an inner page behind the curtain: the panel rises with the page's
 * name, the route changes under it, and the panel lifts off the new page.
 * Falls back to a plain navigation under reduced motion.
 */
export function navigateWithTransition(href: string, label: string) {
  if (!begin || matchMedia(motionConfig.queries.reduced).matches) return false;
  begin({ href, label });
  return true;
}

type Props<T extends string> = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & {
  href: Route<T>;
  label: string;
};

export function TransitionLink<T extends string>({ href, label, ...props }: Props<T>) {
  return (
    <Link
      {...props}
      href={href}
      onNavigate={(event) => {
        if (navigateWithTransition(href, label)) event.preventDefault();
      }}
    />
  );
}

export function PageTransitionLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState<Pending | null>(null);
  const [arrived, setArrived] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const coveredRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    begin = (next) => {
      if (busyRef.current) return;
      busyRef.current = true;
      coveredRef.current = false;
      setArrived(false);
      setPending(next);
    };
    return () => {
      begin = null;
    };
  }, []);

  // The new route has rendered under the closed curtain.
  useEffect(() => {
    if (pending && coveredRef.current && pathname === pending.href.split(/[?#]/)[0])
      setArrived(true);
  }, [pathname, pending]);

  // Cover: the panel rises and the name comes up with it.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !pending) return;
      const panel = root.querySelector('[data-transition-panel]');
      const text = root.querySelector('[data-transition-text]');
      let fallback = 0;
      const timeline = gsap
        .timeline({
          onComplete: () => {
            coveredRef.current = true;
            if (pathname === pending.href.split(/[?#]/)[0]) setArrived(true);
            else {
              router.push(pending.href as Route);
              // A route that never settles still lifts the curtain.
              fallback = window.setTimeout(() => setArrived(true), 5000);
            }
          },
        })
        .fromTo(
          panel,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.95, ease: bezier(0.65, 0, 0.35, 1) },
        )
        .fromTo(
          text,
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.4,
        );
      const visibility = () => {
        if (document.hidden) timeline.pause();
        else timeline.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => {
        clearTimeout(fallback);
        document.removeEventListener('visibilitychange', visibility);
      };
    },
    // Only a new navigation restarts the cover; arriving must not revert it.
    { scope: rootRef, dependencies: [pending] },
  );

  // Reveal: straight away, the panel folds down off the new page.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !arrived) return;
      const timeline = gsap
        .timeline({
          delay: 0.08,
          onComplete: () => {
            busyRef.current = false;
            setArrived(false);
            setPending(null);
          },
        })
        .to('[data-transition-panel]', {
          scaleY: 0,
          transformOrigin: '50% 0%',
          duration: 1.1,
          ease: bezier(0.65, 0, 0.35, 1),
        })
        .to(
          '[data-transition-text]',
          { yPercent: -40, opacity: 0, duration: 0.6, ease: 'power2.inOut' },
          0,
        );
      const visibility = () => {
        if (document.hidden) timeline.pause();
        else timeline.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => document.removeEventListener('visibilitychange', visibility);
    },
    { scope: rootRef, dependencies: [arrived] },
  );

  if (!pending) return null;
  return (
    <div
      ref={rootRef}
      role="status"
      aria-label={`Opening ${pending.label}`}
      className="pointer-events-auto fixed inset-0 z-[10000] overflow-hidden"
    >
      <div data-transition-panel className="absolute inset-0 bg-ink will-change-transform" />
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-5">
        <span
          data-transition-text
          className={`${workDisplay.className} max-w-full text-center text-[clamp(2rem,6vw,5rem)] leading-[.8] [overflow-wrap:anywhere] text-secondary uppercase opacity-0`}
        >
          {pending.label}
        </span>
      </div>
    </div>
  );
}
