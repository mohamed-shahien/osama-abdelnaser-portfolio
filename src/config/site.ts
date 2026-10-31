import { profile } from '@/content/profile';

// The production domain. Previews (the vercel.app address) still point their
// canonical links and social images here; NEXT_PUBLIC_SITE_URL can override it.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://osama-abdelnaser.com';

function getMetadataBase() {
  const url = new URL(siteUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL.');
  }
  return url;
}

export const siteConfig = {
  name: profile.name,
  title: `${profile.name} | ${profile.role}`,
  description: profile.description,
  metadataBase: getMetadataBase(),
  language: 'en',
  direction: 'ltr',
} as const;
