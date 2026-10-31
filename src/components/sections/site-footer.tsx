import StickerSlapFooter from '@/components/ui/sticker-slap-footer';
import { footerSocials, footerWhatsappHref } from '@/content/footer';
import { FooterTangleBooking } from './footer-tangle-booking';

export function SiteFooter() {
  return (
    <StickerSlapFooter
      fontSans="var(--font-sans)"
      // The yellow sheet gets the panel's rounded corners and a warm shadow of its own colour.
      className="z-10 rounded-t-[clamp(28px,3.4vw,52px)] shadow-[0_-18px_48px_-16px_#b5a20f8c,0_-2px_0_#e9d84a]"
      topSlot={<FooterTangleBooking />}
      chatHref={footerWhatsappHref}
      socials={footerSocials}
      credits={[]}
    />
  );
}
