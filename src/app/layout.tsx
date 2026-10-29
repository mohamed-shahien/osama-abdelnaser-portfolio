import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MotionProvider } from '@/components/providers/motion-provider';
import { SiteIntro } from '@/components/providers/site-intro';
import { SiteFooter } from '@/components/sections/site-footer';
import { siteConfig } from '@/config/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: siteConfig.metadataBase,
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={siteConfig.language}
      dir={siteConfig.direction}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-foreground px-4 py-3 text-background focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider />
        <SiteIntro>
          {children}
          <SiteFooter />
        </SiteIntro>
      </body>
    </html>
  );
}
