import type { MetadataRoute } from 'next';

import { seoDescription } from '@/config/seo';
import { profile } from '@/content/profile';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} — ${profile.role}`,
    short_name: profile.name,
    description: seoDescription,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#17284f',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
