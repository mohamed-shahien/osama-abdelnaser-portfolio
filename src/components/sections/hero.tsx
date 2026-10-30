import Link from 'next/link';

import { heroContent } from '@/content/hero';
import { cn } from '@/lib/utils';
import { HeroScene } from './hero-scene';
import { TransitionLink } from './page-transition';
import { SiteNav } from './site-nav';

export function Hero() {
  return (
    <section
      className="group/hero [overflow:clip] bg-white text-ink [--hero-header-height:88px]"
      aria-label="Osama Abdelnaser — Product Designer"
      data-hero
    >
      {/* Hidden during the poster intro; transparent once the docked poster is active. */}
      <header
        className={cn(
          'relative z-30 flex h-(--hero-header-height) items-center justify-between bg-white px-[clamp(80px,calc(15vmin_+_16px),184px)] [transition:opacity_700ms_ease] motion-reduce:[transition:none]',
          'group-data-[portfolio-phase=intro]/hero:invisible group-data-[portfolio-phase=intro]/hero:opacity-0',
          'group-data-[portfolio-active=true]/hero:pointer-events-none group-data-[portfolio-active=true]/hero:bg-transparent',
        )}
      >
        <Link
          className="pointer-events-auto text-[22px] font-[750] tracking-[-1.3px] max-sm:sr-only [@media(max-width:480px)]:text-[20px]"
          href="/"
          aria-label="Osama Abdelnaser, home"
        >
          osama
        </Link>
        <SiteNav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-sm:left-[calc(50%_+_4px)]" />
        <TransitionLink
          className={cn(
            'pointer-events-auto rounded-[999px] bg-ink px-[16px] py-[6px] text-[14px] leading-[20px] font-semibold text-white [transition:background_180ms_ease] hover:bg-primary hover:text-ink max-md:hidden',
            '[@media(max-width:480px)]:px-[8px] [@media(max-width:480px)]:py-[4px] [@media(max-width:480px)]:text-[12px] [@media(max-width:480px)]:leading-[18px]',
          )}
          href="/contact"
          label={heroContent.contactLabel}
        >
          {heroContent.contactLabel}
        </TransitionLink>
      </header>
      <HeroScene />
    </section>
  );
}
