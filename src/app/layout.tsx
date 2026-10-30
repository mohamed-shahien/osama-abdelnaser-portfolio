import type { Metadata, Viewport } from 'next';
import { Geist_Mono } from 'next/font/google';
import { MotionProvider } from '@/components/providers/motion-provider';
import { SiteIntro } from '@/components/providers/site-intro';
import { PageTransitionLayer } from '@/components/sections/page-transition';
import { SiteFooter } from '@/components/sections/site-footer';
import { JsonLd } from '@/components/sections/json-ld';
import { seoDescription, seoKeywords, siteJsonLd } from '@/config/seo';
import { siteConfig } from '@/config/site';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: siteConfig.metadataBase,
  title: {
    default: `${siteConfig.name} — Product Designer (UI/UX) · Cairo & Riyadh`,
    template: `%s | ${siteConfig.name}`,
  },
  description: seoDescription,
  applicationName: siteConfig.name,
  keywords: seoKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'design',
  ...(siteConfig.metadataBase ? { alternates: { canonical: '/' } } : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  // The share images are the `opengraph-image` and `twitter-image` files in this folder.
  openGraph: {
    type: 'profile',
    url: '/',
    siteName: siteConfig.name,
    locale: 'en_US',
    title: siteConfig.title,
    description: seoDescription,
    firstName: 'Osama',
    lastName: 'Abdelnaser',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@OsAAA98',
    creator: '@OsAAA98',
    title: siteConfig.title,
    description: seoDescription,
  },
};

export const viewport: Viewport = {
  themeColor: '#17284f',
  colorScheme: 'light',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={siteConfig.language}
      dir={siteConfig.direction}
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-foreground px-4 py-3 text-background focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          Skip to content
        </a>
        <JsonLd data={siteJsonLd()} />
        <MotionProvider />
        <PageTransitionLayer />
        <SiteIntro>
          {children}
          <SiteFooter />
        </SiteIntro>
      </body>
    </html>
  );
}
