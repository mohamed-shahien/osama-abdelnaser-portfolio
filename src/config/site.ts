import { profile } from '@/content/profile';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

// Do not invent a canonical production domain during setup.
function getMetadataBase() {
  if (!siteUrl) return undefined;

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
