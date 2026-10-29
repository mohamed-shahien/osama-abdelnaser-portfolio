'use client';

import { useEffect, useRef } from 'react';

import NoiseDissolveReveal from '@/components/ui/noise-dissolve-reveal';
import WireboundInquiry from '@/components/ui/wirebound-inquiry';

type BookingOverlayProps = {
  id: string;
  onClose: () => void;
};

export default function BookingOverlay({ id, onClose }: BookingOverlayProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    closeBtnRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Book a meeting with Osama Abdelnaser"
      className="fixed inset-0 z-50 h-svh w-screen overflow-hidden bg-ink"
    >
      <NoiseDissolveReveal veilColor="#17284F" durationMs={1100} delayMs={80} height="100svh">
        <div
          data-lenis-prevent
          className="relative h-full w-full overflow-x-hidden overflow-y-auto"
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close booking inquiry"
            className="fixed end-4 top-4 z-30 inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-extrabold tracking-[0.06em] text-secondary uppercase shadow-[0_4px_16px_rgba(23,40,79,0.28)] [transition:background-color_180ms_ease,color_180ms_ease,transform_180ms_ease] hover:scale-105 hover:bg-accent-rose hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            <span>Close</span>
            <span aria-hidden="true" className="text-sm leading-none">
              &times;
            </span>
          </button>
          <WireboundInquiry height="100svh" />
        </div>
      </NoiseDissolveReveal>
    </div>
  );
}
