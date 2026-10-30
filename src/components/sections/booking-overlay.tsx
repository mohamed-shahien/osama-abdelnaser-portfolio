'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { motionConfig } from '@/lib/motion/config';
import { gsap, useGSAP } from '@/lib/motion/gsap';

export type BookingOrigin = {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
};
export const preloadBookingInquiry = () => import('./booking-inquiry-content');
const InquiryContent = dynamic(preloadBookingInquiry, {
  ssr: false,
  loading: () => (
    <div role="status" className="h-svh bg-ink">
      <span className="sr-only">Opening the inquiry…</span>
    </div>
  ),
});

type Props = { id: string; origin: BookingOrigin; onClose: () => void };

export default function BookingOverlay({ id, origin, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null),
    faceRef = useRef<HTMLDivElement>(null),
    contentRef = useRef<HTMLDivElement>(null),
    closeRef = useRef<HTMLButtonElement>(null);
  const [covered, setCovered] = useState(false),
    [closing, setClosing] = useState(false),
    [ready, setReady] = useState(false);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const coveredRef = useRef(false);
  const closeActionRef = useRef<() => void>(() => {});
  const requestClose = useCallback(() => closeActionRef.current(), []);
  const revealed = useCallback(() => {
    if (closingRef.current) return;
    setReady(true);
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    rootRef.current?.focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]',
        ) ?? [],
      ).filter(
        (node) =>
          node.tabIndex >= 0 &&
          node.getBoundingClientRect().width > 0 &&
          getComputedStyle(node).opacity !== '0' &&
          !node.closest('[inert]'),
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        rootRef.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === rootRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === rootRef.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener('keydown', key);
    };
  }, [requestClose]);

  const { contextSafe } = useGSAP({ scope: rootRef });
  useGSAP(
    () => {
      const face = faceRef.current,
        content = contentRef.current,
        close = closeRef.current;
      if (!face || !content || !close) return;
      const measure = () => {
        const rect =
          document.querySelector<HTMLElement>('[data-tangle-cta]')?.getBoundingClientRect() ??
          origin;
        const scale =
          (Math.hypot(window.innerWidth / 2, window.innerHeight) / Math.max(rect.width / 2, 1)) *
          1.06;
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          x: window.innerWidth / 2 - (rect.left + rect.width / 2),
          y: window.innerHeight - (rect.top + rect.height),
          scale,
        };
      };
      const geometry = measure();
      gsap.set(face, {
        left: geometry.left,
        top: geometry.top,
        width: geometry.width,
        height: geometry.height,
        transformOrigin: '50% 100%',
      });
      const resize = contextSafe(() => {
        if (!coveredRef.current || closingRef.current) return;
        gsap.set(face, { ...measure(), backgroundColor: '#17284F' });
      });
      const finishOpening = () => {
        coveredRef.current = true;
        resize();
        setCovered(true);
      };
      const reduced = matchMedia(motionConfig.queries.reduced).matches;
      const enter = gsap.timeline();
      enterRef.current = enter;
      if (reduced) {
        gsap.set(face, {
          x: geometry.x,
          y: geometry.y,
          scale: geometry.scale,
          backgroundColor: '#17284F',
        });
        finishOpening();
      } else
        enter.fromTo(
          face,
          { x: 0, y: 0, scale: 1, backgroundColor: origin.color },
          {
            x: geometry.x,
            y: geometry.y,
            scale: geometry.scale,
            backgroundColor: '#17284F',
            duration: 0.85,
            ease: 'power3.inOut',
            onComplete: finishOpening,
          },
        );
      closeActionRef.current = contextSafe(() => {
        if (closingRef.current) return;
        if (coveredRef.current) resize();
        closingRef.current = true;
        setClosing(true);
        enterRef.current?.kill();
        if (matchMedia(motionConfig.queries.reduced).matches) {
          onClose();
          return;
        }
        const sourceFace = document.querySelector<HTMLElement>('[data-tangle-cta-face]');
        const returnColor = sourceFace ? getComputedStyle(sourceFace).backgroundColor : '#17284F';
        const exit = gsap.timeline();
        enterRef.current = exit;
        exit
          .to([content, close], {
            opacity: 0,
            y: 10,
            duration: 0.2,
            ease: 'power1.out',
            overwrite: 'auto',
          })
          .to(
            face,
            {
              x: 0,
              y: 0,
              scale: 1,
              backgroundColor: returnColor,
              duration: 0.72,
              ease: 'power3.inOut',
              onComplete: onClose,
            },
            0.1,
          );
      });
      const visibility = () => {
        if (document.hidden) enterRef.current?.pause();
        else enterRef.current?.resume();
      };
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('resize', resize);
      return () => {
        enterRef.current?.kill();
        closeActionRef.current = () => {};
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('resize', resize);
      };
    },
    { scope: rootRef, dependencies: [origin, onClose, contextSafe], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!covered || closingRef.current || !closeRef.current) return;
      gsap.to(closeRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    },
    { scope: rootRef, dependencies: [covered], revertOnUpdate: true },
  );
  return createPortal(
    <div
      ref={rootRef}
      id={id}
      data-booking-phase={
        closing ? 'closing' : ready ? 'open' : covered ? 'revealing' : 'expanding'
      }
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="Book a meeting with Osama Abdelnaser"
      tabIndex={-1}
      className="fixed inset-0 z-[10000] h-svh w-full overflow-hidden outline-none"
    >
      <div
        ref={faceRef}
        aria-hidden="true"
        className="pointer-events-none absolute rounded-t-full bg-ink will-change-transform"
        style={{
          left: origin.left,
          top: origin.top,
          width: origin.width,
          height: origin.height,
          transformOrigin: '50% 100%',
        }}
      />
      <div ref={contentRef} inert={!ready || closing} className="absolute inset-0">
        {covered ? <InquiryContent onReveal={revealed} /> : null}
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={requestClose}
        disabled={!covered || closing}
        aria-label="Close booking inquiry"
        tabIndex={covered ? 0 : -1}
        className="absolute end-4 top-4 z-30 inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-extrabold tracking-[0.06em] text-secondary uppercase opacity-0 shadow-[0_4px_16px_rgba(23,40,79,0.28)] transition-colors hover:bg-accent-rose hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        <span>Close</span>
        <span aria-hidden="true" className="text-sm leading-none">
          &times;
        </span>
      </button>
    </div>,
    document.body,
  );
}
