import { Inter } from 'next/font/google';
import Link from 'next/link';

import { heroContent } from '@/content/hero';
import { cn } from '@/lib/utils';
import { HeroScene } from './hero-scene';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export function Hero() {
  return (
    <section
      className={cn(
        'group/hero [overflow:clip] bg-white text-ink [--hero-header-height:88px]',
        inter.className,
      )}
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
          className="pointer-events-auto text-[22px] font-[750] tracking-[-1.3px] [@media(max-width:480px)]:text-[20px]"
          href="/"
          aria-label="Osama Abdelnaser, home"
        >
          osama
        </Link>
        <a
          className={cn(
            'pointer-events-auto rounded-[999px] bg-ink px-[16px] py-[6px] text-[14px] leading-[20px] font-semibold text-white [transition:background_180ms_ease] hover:bg-primary hover:text-ink',
            '[@media(max-width:480px)]:px-[8px] [@media(max-width:480px)]:py-[4px] [@media(max-width:480px)]:text-[12px] [@media(max-width:480px)]:leading-[18px]',
          )}
          href={heroContent.contactHref}
        >
          {heroContent.contactLabel}
        </a>
      </header>
      <HeroScene />
    </section>
  );
}
