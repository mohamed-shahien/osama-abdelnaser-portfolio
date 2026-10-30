import type { Metadata } from 'next';

import { ContactInquiry } from '@/components/sections/contact-inquiry';
import { InnerHeader } from '@/components/sections/inner-header';
import { pageMetadata } from '@/config/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Book a meeting — hire a Product Designer',
  description:
    'Hire Osama Abdelnaser, Product Designer (UI/UX) in Cairo and Riyadh. Answer three short questions and send your brief on WhatsApp to book a meeting about your website, app, SaaS platform or Salla, Zid or Shopify store.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-svh bg-background text-ink">
      <InnerHeader current="contact" />
      <h1 className="sr-only">Book a meeting</h1>
      <ContactInquiry />
    </main>
  );
}
