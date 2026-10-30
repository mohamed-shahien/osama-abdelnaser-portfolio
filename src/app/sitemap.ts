import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/config/seo';
import { workProjects } from '@/content/work';

// Absolute URLs need the domain; the sitemap stays empty until NEXT_PUBLIC_SITE_URL is set.
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
