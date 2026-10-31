import Link from 'next/link';
import type { ReactNode } from 'react';

import { Arrow } from '@/components/ui/arrow';
import { profile } from '@/content/profile';
import { cn } from '@/lib/utils';
import { NavLogo } from './nav-logo';
import { TransitionLink } from './page-transition';

type Current = 'work' | 'playground' | 'contact';

const linkClass =
  'inline-flex items-center gap-1 py-1 [transition:color_160ms_ease] hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current=page]:text-primary';

/**
 * The bar every inner page shares: one short row with the logo, the menu (the
 * current page marked), the role, and an optional corner for the page's own links.
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
  const mark = (page: Current) =>
    page === current ? <Arrow dir="right" className="size-[0.8em]" /> : null;
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-8 gap-y-1 px-5 py-3 text-ink md:py-4',
        className,
      )}
    >
      <div className="flex items-start gap-x-4 md:gap-x-10">
        <Link
          href="/"
          prefetch={false}
          aria-label="Osama Abdelnaser, home"
          className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <NavLogo />
        </Link>
        <nav
          aria-label="Pages"
          className="flex gap-4 text-base leading-none font-semibold tracking-[-.04em] uppercase md:gap-6 md:text-xl"
        >
          {/* On phones the logo is the way home, so the row stays one line. */}
          <Link href="/" prefetch={false} className={cn(linkClass, 'max-md:hidden')}>
            Home
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
      <div className="flex items-center gap-6 text-[10px] leading-tight">
        <p className="max-md:hidden">
          {profile.role}
          <br />
          <span className="text-ink/75">Cairo · Riyadh · Remote</span>
        </p>
        {aside ? <div className="md:text-end">{aside}</div> : null}
      </div>
    </header>
  );
}
