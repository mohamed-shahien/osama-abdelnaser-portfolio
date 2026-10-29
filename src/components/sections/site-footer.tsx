import StickerSlapFooter from '@/components/ui/sticker-slap-footer';
import { TangleFooter } from '@/components/ui/tangle-footer';
import { footerSocials, footerWhatsappHref } from '@/content/footer';

export function SiteFooter() {
  return (
    <div className="w-full shrink-0 bg-secondary" data-site-footer>
      <TangleFooter className="mx-auto max-w-7xl" />
      <StickerSlapFooter chatHref={footerWhatsappHref} socials={footerSocials} />
    </div>
  );
}
