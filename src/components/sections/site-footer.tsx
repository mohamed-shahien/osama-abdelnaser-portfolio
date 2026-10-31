import StickerSlapFooter from '@/components/ui/sticker-slap-footer';
import { footerSocials, footerWhatsappHref } from '@/content/footer';
import { FooterTangleBooking } from './footer-tangle-booking';

export function SiteFooter() {
  return (
    <StickerSlapFooter
      fontSans="var(--font-sans)"
      topSlot={<FooterTangleBooking />}
      chatHref={footerWhatsappHref}
      socials={footerSocials}
      credits={[]}
    />
  );
}
