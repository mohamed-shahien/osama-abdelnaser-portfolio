'use client';

import { useCallback, useState } from 'react';

import { TangleFooter } from '@/components/ui/tangle-footer';
import { footerBookLabel } from '@/content/footer';
import { scrollPageTo } from '@/lib/motion/page-scroll';
import { BookingCtaDrop } from './booking-cta-drop';
import BookingOverlay, { preloadBookingInquiry, type BookingOrigin } from './booking-overlay';

const DIALOG_ID = 'booking-inquiry-dialog';

export function FooterTangleBooking() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<BookingOrigin | null>(null);

  const handlePreload = useCallback(() => {
    void preloadBookingInquiry();
  }, []);
  const handleOpen = useCallback(() => {
    const trigger = document.querySelector<HTMLElement>('[data-tangle-cta]');
    if (!trigger) return;
    scrollPageTo(window.scrollY);
    const rect = trigger.getBoundingClientRect();
    const face = trigger.querySelector<HTMLElement>('[data-tangle-cta-face]') ?? trigger;
    setOrigin({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      color: getComputedStyle(face).backgroundColor,
    });
    void preloadBookingInquiry();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      const trigger = document.querySelector<HTMLButtonElement>('[data-tangle-cta]');
      trigger?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <>
      <TangleFooter
        ctaLabel={footerBookLabel}
        onCtaClick={handleOpen}
        onCtaPreload={handlePreload}
        ctaExpanded={open}
        ctaControls={DIALOG_ID}
      />
      <BookingCtaDrop />
      {open && origin ? (
        <BookingOverlay id={DIALOG_ID} origin={origin} onClose={handleClose} />
      ) : null}
    </>
  );
}
