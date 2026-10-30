import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl('/sitemap.xml');
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    ...(sitemap ? { sitemap, host: absoluteUrl('/') ?? undefined } : {}),
  };
}
