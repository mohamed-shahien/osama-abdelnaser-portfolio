'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { motionConfig } from '@/lib/motion/config';
import { workDisplay } from '@/config/work-fonts';
import { gsap, useGSAP } from '@/lib/motion/gsap';

const storageKey = 'osama:work-transition';
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

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & {
  href: Route<`/work/${string}`>;
  label: string;
  children: ReactNode;
};

export function WorkPageLink({ href, label, children, ...props }: Props) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const navigatedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || !leaving) return;
      // Next Activity restores cached pages and their state on back navigation.
      if (navigatedRef.current) {
        setLeaving(false);
        return;
      }
      const tween = gsap.fromTo(
        panel,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1,
          ease: bezier(0.42, 0, 0.1, 1),
          onComplete: () => {
            navigatedRef.current = true;
            try {
              sessionStorage.setItem(storageKey, JSON.stringify({ label, time: Date.now() }));
            } catch {
              /* The project is still navigable without storage. */
            }
            router.push(href);
          },
        },
      );
      const visibility = () => {
        if (document.hidden) tween.pause();
        else tween.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => document.removeEventListener('visibilitychange', visibility);
    },
    { scope: panelRef, dependencies: [leaving, href, label, router], revertOnUpdate: true },
  );
  return (
    <>
      <Link
        {...props}
        href={href}
        onNavigate={(event) => {
          if (matchMedia(motionConfig.queries.reduced).matches) return;
          event.preventDefault();
          navigatedRef.current = false;
          setLeaving(true);
        }}
      >
        {children}
      </Link>
      {leaving
        ? createPortal(
            <div
              role="status"
              aria-label={`Opening ${label}`}
              className="fixed inset-0 z-[10000] overflow-hidden"
            >
              <div
                ref={panelRef}
                className="absolute inset-0 [transform:translateY(100%)] bg-[#080808]"
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function WorkCaseEntrance({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      if (visible) return;
      try {
        const raw = sessionStorage.getItem(storageKey);
        sessionStorage.removeItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as { time?: number };
          if (
            typeof saved.time === 'number' &&
            Date.now() - saved.time < 15000 &&
            !matchMedia(motionConfig.queries.reduced).matches
          )
            setVisible(true);
        }
      } catch {
        /* Direct navigation has no transition overlay. */
      }
    },
    { dependencies: [] },
  );
  useGSAP(
    () => {
      const panel = panelRef.current,
        text = textRef.current;
      if (!panel || !text || !visible) return;
      const timeline = gsap.timeline({ onComplete: () => setVisible(false) });
      timeline
        .fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, 0)
        .to(
          panel,
          {
            scaleY: 0,
            transformOrigin: 'bottom center',
            duration: 1.1,
            ease: bezier(0.9, 0, 0.58, 1),
          },
          1.3,
        )
        .to(
          text,
          { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1, ease: bezier(0.9, 0, 0.58, 1) },
          1.3,
        );
      const visibility = () => {
        if (document.hidden) timeline.pause();
        else timeline.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      return () => document.removeEventListener('visibilitychange', visibility);
    },
    { scope: panelRef, dependencies: [visible], revertOnUpdate: true },
  );
  return visible
    ? createPortal(
        <div
          role="status"
          aria-label={`Opening ${label}`}
          className="fixed inset-0 z-[10000] overflow-hidden"
        >
          <div ref={panelRef} className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-5">
            <span
              ref={textRef}
              className={`${workDisplay.className} max-w-full text-center text-[clamp(2rem,6vw,5rem)] leading-[.8] [overflow-wrap:anywhere] text-white uppercase`}
            >
              {label}
            </span>
          </div>
        </div>,
        document.body,
      )
    : null;
}
