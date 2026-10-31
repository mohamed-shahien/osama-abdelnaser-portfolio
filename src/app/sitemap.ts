import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/config/seo';
import { workProjects } from '@/content/work';

// Absolute URLs use the site domain (src/config/site.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  if (!absoluteUrl()) return [];
  const url = (path: string) => absoluteUrl(path) ?? path;
  return [
    { url: url('/'), changeFrequency: 'monthly', priority: 1 },
    { url: url('/playground'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/contact'), changeFrequency: 'yearly', priority: 0.8 },
    ...workProjects.map((project) => ({
      url: url(`/work/${project.slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
      images: [url(project.cover.src)],
    })),
  ];
}
