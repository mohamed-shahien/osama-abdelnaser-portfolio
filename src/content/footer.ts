import type { Social } from '@/components/ui/sticker-slap-footer';
import { profile } from '@/content/profile';

// Sourced from the master brief, sections 01 and 03.
export const footerLines = [
  profile.description,
  'Product Design · UX Design · UI Design · Design Systems',
  'Understand · Simplify · Design systems · Experience',
];

export const footerWhatsappHref =
  'https://api.whatsapp.com/send/?phone=%2B201223165082&text&type=phone_number&app_absent=0';

export const footerBookLabel = 'Book a meeting';
export const footerBookKicker = 'Talk to Osama';

export const footerSocials: Social[] = [
  {
    kind: 'linkedin',
    href: 'https://www.linkedin.com/in/osama-abdelnaser/',
    label: 'Osama on LinkedIn',
  },
  {
    kind: 'behance',
    href: 'https://www.behance.net/osamaabdelnaser1',
    label: 'Osama on Behance',
  },
  {
    kind: 'whatsapp',
    href: footerWhatsappHref,
    label: 'Message Osama on WhatsApp',
  },
  {
    kind: 'x',
    href: 'https://x.com/OsAAA98',
    label: 'Osama on X',
  },
  {
    kind: 'figma',
    href: 'https://www.figma.com/@osamaabdelnaser',
    label: 'Osama on Figma',
  },
  {
    kind: 'instagram',
    href: 'https://www.instagram.com/osamaabdelnaser.official/',
    label: 'Osama on Instagram',
  },
  {
    kind: 'tiktok',
    href: 'https://www.tiktok.com/@osamaabdelnaser.official',
    label: 'Osama on TikTok',
  },
  {
    kind: 'facebook',
    href: 'https://www.facebook.com/osamaabdelnaser.official',
    label: 'Osama on Facebook',
  },
  {
    kind: 'upwork',
    href: 'https://www.upwork.com/freelancers/~01bb3b2ee27ac86af8?mp_source=share',
    label: 'Osama on Upwork',
  },
  {
    kind: 'medium',
    href: 'https://medium.com/@osamaabdelnaser',
    label: 'Osama on Medium',
  },
];
