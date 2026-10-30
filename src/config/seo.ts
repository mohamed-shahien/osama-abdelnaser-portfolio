import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';
import { contactContent } from '@/content/contact';
import { footerSocials } from '@/content/footer';
import { profile } from '@/content/profile';
import type { WorkProject } from '@/types/work';

// Search copy built from the master brief (sections 01, 03 and 07–09): the
// role, the services, the cities and the platforms he ships on. Nothing here
// claims a client, a metric or a price.

export const seoKeywords = [
  'Osama Abdelnaser',
  'أسامة عبد الناصر',
  'Product Designer',
  'UI/UX Designer',
  'UX Designer Egypt',
  'UI/UX Designer Saudi Arabia',
  'Product Designer Cairo',
  'UI/UX Designer Riyadh',
  'Arabic RTL UI design',
  'Design systems',
  'Salla store design',
  'Salla theme designer',
  'Zid store design',
  'Shopify store design',
  'SaaS dashboard design',
  'Mobile app UI/UX',
  'Website and landing page design',
  'Figma designer',
  'مصمم UI/UX',
  'مصمم واجهات وتجربة المستخدم',
  'تصميم متجر سلة',
  'تصميم متجر زد',
];

export const seoDescription =
  'Osama Abdelnaser is a Product Designer (UI/UX) in Cairo and Riyadh. He designs websites, SaaS platforms, mobile apps, Salla, Zid and Shopify stores and Arabic RTL design systems that turn complex problems into simple experiences.';

export const whatsappUrl = `https://wa.me/${contactContent.whatsappNumber}`;

/** An absolute URL on the site's domain, or null until NEXT_PUBLIC_SITE_URL is set. */
export function absoluteUrl(path = '/') {
  return siteConfig.metadataBase ? new URL(path, siteConfig.metadataBase).toString() : null;
}

/** "Mar 2026" → "2026-03"; anything else is left out. */
export function isoMonth(date: string) {
  const parsed = new Date(`1 ${date}`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

/** A page's own title, description, canonical path and share card. */
export function pageMetadata({
  title,
  description,
  path,
  images,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  images?: { url: string; width: number; height: number; alt: string }[];
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  return {
    title,
    description,
    // A canonical link must be absolute, so it waits for the domain.
    ...(siteConfig.metadataBase ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      title: `${title} | ${siteConfig.name}`,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}

const personId = '#osama-abdelnaser';

/** Osama as a person and the site as his website; rendered once, in the root layout. */
export function siteJsonLd() {
  const home = absoluteUrl('/');
  const person = {
    '@type': 'Person',
    '@id': (home ?? '') + personId,
    name: profile.name,
    alternateName: profile.nameAr,
    jobTitle: profile.role,
    description: seoDescription,
    ...(home ? { url: home, image: absoluteUrl('/opengraph-image.jpg') } : {}),
    email: `mailto:${contactContent.email}`,
    address: [
      { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
      { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
    ],
    knowsLanguage: ['ar', 'en'],
    knowsAbout: [
      'Product design',
      'UI/UX design',
      'Design systems',
      'Arabic RTL interfaces',
      'E-commerce design',
      'Salla',
      'Zid',
      'Shopify',
      'Figma',
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Port Said University' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Project inquiries',
      url: whatsappUrl,
      email: contactContent.email,
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: footerSocials.filter((social) => social.kind !== 'whatsapp').map((s) => s.href),
  };
  const website = {
    '@type': 'WebSite',
    name: siteConfig.name,
    description: seoDescription,
    inLanguage: siteConfig.language,
    ...(home ? { url: home } : {}),
    publisher: { '@id': (home ?? '') + personId },
  };
  return { '@context': 'https://schema.org', '@graph': [person, website] };
}

/** One case study: the work itself and where it sits in the site. */
export function projectJsonLd(project: WorkProject) {
  const home = absoluteUrl('/');
  const page = absoluteUrl(`/work/${project.slug}`);
  const work = {
    '@type': 'CreativeWork',
    name: project.name,
    headline: `${project.name} — ${project.category}`,
    description: project.description,
    genre: project.category,
    dateCreated: isoMonth(project.date),
    inLanguage: /rtl|arabic/i.test(project.support) ? ['ar', 'en'] : 'en',
    creator: { '@type': 'Person', '@id': (home ?? '') + personId, name: profile.name },
    ...(page ? { url: page, image: absoluteUrl(project.cover.src) } : {}),
    ...(project.liveUrl || project.behanceUrl
      ? { sameAs: [project.liveUrl, project.behanceUrl].filter(Boolean) }
      : {}),
  };
  const graph: object[] = [work];
  if (home && page)
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: home },
        { '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/playground') },
        { '@type': 'ListItem', position: 3, name: project.name, item: page },
      ],
    });
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Every project as an ordered list, for the playground. */
export function collectionJsonLd(projects: readonly WorkProject[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profile.name} — all projects`,
    ...(absoluteUrl('/playground') ? { url: absoluteUrl('/playground') } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: project.name,
        ...(absoluteUrl(`/work/${project.slug}`)
          ? { url: absoluteUrl(`/work/${project.slug}`) }
          : {}),
      })),
    },
  };
}

/** A JSON-LD script body with `<` escaped, as the Next.js guide recommends. */
export const jsonLdHtml = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
