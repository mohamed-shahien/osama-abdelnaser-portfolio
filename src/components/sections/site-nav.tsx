'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { TransitionLink } from './page-transition';

const pages = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/contact', label: 'Contact', match: (path: string) => path.startsWith('/contact') },
  {
    href: '/playground',
    label: 'Playground',
    match: (path: string) => path.startsWith('/playground'),
  },
] as const;

/** A small capsule of the site's pages; the current one wears the ink pill. */
export function SiteNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Pages" className={cn('pointer-events-auto', className)}>
      <ul className="m-0 flex list-none items-center gap-[2px] rounded-full border border-[#17284f1f] bg-[#ffffffcc] p-[4px] [box-shadow:0_1px_4px_#17284f14]">
        {pages.map((page, index) => {
          const current = page.match(pathname);
          const link = {
            href: page.href,
            'aria-current': current ? ('page' as const) : undefined,
            className: cn(
              'group/link relative flex items-center gap-[6px] rounded-full px-[14px] py-[6px] text-[13px] leading-[18px] font-semibold text-ink [transition:background_200ms_ease,color_200ms_ease] hover:bg-[#17284f0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-rose',
              'max-sm:px-[10px] max-sm:text-[12px]',
              current && 'bg-ink text-secondary hover:bg-ink',
            ),
            children: (
              <>
                <span
                  className={cn(
                    'text-[9px] tabular-nums opacity-50 max-sm:hidden',
                    current && 'opacity-80',
                  )}
                  aria-hidden="true"
                >
                  0{index + 1}
                </span>
                {page.label}
                <span
                  className="absolute -top-[2px] right-[8px] size-[5px] scale-0 rounded-full bg-accent-rose [transition:scale_200ms_cubic-bezier(.3,1.6,.5,1)] group-hover/link:scale-100"
                  aria-hidden="true"
                />
              </>
            ),
          };
          return (
            <li key={page.href}>
              {/* The inner pages open behind the curtain; home restores in place. */}
              {page.href === '/' ? (
                <Link {...link} />
              ) : (
                <TransitionLink {...link} label={page.label} />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
