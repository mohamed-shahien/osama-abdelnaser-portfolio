'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

import { TangleFooter } from '@/components/ui/tangle-footer';
import { footerBookLabel } from '@/content/footer';

const loadBookingOverlay = () => import('./booking-overlay');

const BookingOverlay = dynamic(loadBookingOverlay, {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 bg-ink" aria-hidden="true" />,
});

const DIALOG_ID = 'booking-inquiry-dialog';

export function FooterTangleBooking() {
  const [open, setOpen] = useState(false);

  const handlePreload = useCallback(() => {
    void loadBookingOverlay();
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
        onCtaClick={() => setOpen(true)}
        onCtaPreload={handlePreload}
        ctaExpanded={open}
        ctaControls={DIALOG_ID}
      />
      {open ? <BookingOverlay id={DIALOG_ID} onClose={handleClose} /> : null}
    </>
  );
}
