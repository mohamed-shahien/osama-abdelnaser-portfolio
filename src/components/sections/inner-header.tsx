import Link from 'next/link';
import type { ReactNode } from 'react';

import { heroContent } from '@/content/hero';
import { profile } from '@/content/profile';
import { cn } from '@/lib/utils';
import { TransitionLink } from './page-transition';

type Current = 'work' | 'playground' | 'contact';

const linkClass =
  'w-max py-[3px] [transition:color_160ms_ease] hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-[3px] aria-[current=page]:underline-offset-4';

/**
 * The header every inner page shares: the vertical wordmark, the menu with the
 * current page marked, the role, and a corner that defaults to the inquiry email.
 */
export function InnerHeader({
  current,
  aside,
  className,
}: {
  current: Current;
  aside?: ReactNode;
  className?: string;
}) {
  const mark = (page: Current) => (page === current ? '→ ' : '');
  return (
    <header
      className={cn(
        'grid min-h-56 grid-cols-[auto_1fr] items-start gap-x-8 gap-y-6 p-5 text-ink md:min-h-[30svh] md:grid-cols-[11%_24%_1fr_1fr]',
        className,
      )}
    >
      <Link
        href="/"
        prefetch={false}
        aria-label="Osama Abdelnaser, home"
        className="row-span-2 text-2xl leading-none font-extrabold tracking-tighter uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:rotate-180 md:[writing-mode:vertical-rl]"
      >
        Osama©
        <span className="mt-2 block text-[9px] font-medium tracking-normal normal-case md:ms-2">
          Independent {profile.role} · 2026
        </span>
      </Link>
      <div className="row-span-2">
        <p className="mb-6 text-[10px] text-ink/75">Menu</p>
        <nav
          aria-label="Pages"
          className="flex flex-col text-xl leading-[.95] font-semibold tracking-[-.06em] uppercase"
        >
          <Link href="/" prefetch={false} className={linkClass}>
            Home
          </Link>
          <Link
            href="/#work-viewer"
            prefetch={false}
            aria-current={current === 'work' ? 'page' : undefined}
            className={linkClass}
          >
            {mark('work')}Work
          </Link>
          <Link href="/#cv" prefetch={false} className={linkClass}>
            About
          </Link>
          <TransitionLink
            href="/playground"
            label="Playground"
            aria-current={current === 'playground' ? 'page' : undefined}
            className={linkClass}
          >
            {mark('playground')}Playground
          </TransitionLink>
          <TransitionLink
            href="/contact"
            label="Contact"
            aria-current={current === 'contact' ? 'page' : undefined}
            className={linkClass}
          >
            {mark('contact')}Contact
          </TransitionLink>
        </nav>
      </div>
      <p className="text-[10px] leading-tight max-md:col-start-2">
        {profile.role}
        <br />
        <span className="text-ink/75">Cairo · Riyadh · Remote</span>
      </p>
      <div className="text-[10px] leading-tight max-md:col-start-2 md:text-end">
        {aside ?? (
          <>
            <p className="text-ink/75">For inquiries</p>
            <a
              href={heroContent.contactHref}
              className="font-semibold underline underline-offset-2"
            >
              {heroContent.contactHref.replace('mailto:', '')}
            </a>
          </>
        )}
      </div>
    </header>
  );
}
