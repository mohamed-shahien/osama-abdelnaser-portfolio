'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { footerBookLabel } from '@/content/footer';
import { navigateWithTransition } from './page-transition';

// Both draw only on the home page, at the very bottom; their code waits for it.
const TangleFooter = dynamic(() =>
  import('@/components/ui/tangle-footer').then((module) => module.TangleFooter),
);
const BookingCtaDrop = dynamic(() =>
  import('./booking-cta-drop').then((module) => module.BookingCtaDrop),
);

const CONTACT = '/contact';

/** The footer's "Book a meeting" button opens the contact page. It shows on the home page only. */
export function FooterTangleBooking() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePreload = useCallback(() => router.prefetch(CONTACT), [router]);
  const handleOpen = useCallback(() => {
    if (!navigateWithTransition(CONTACT, footerBookLabel)) router.push(CONTACT);
  }, [router]);

  // Inner pages carry their own way to book; their footer starts at the stickers.
  if (pathname !== '/') return null;
  return (
    <>
      <TangleFooter
        ctaLabel={footerBookLabel}
        onCtaClick={handleOpen}
        onCtaPreload={handlePreload}
      />
      <BookingCtaDrop />
    </>
  );
}
