import { Inter } from 'next/font/google';
import Link from 'next/link';

import { heroContent } from '@/content/hero';
import { HeroScene } from './hero-scene';
import styles from './hero.module.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export function Hero() {
  return (
    <section
      className={`${styles.hero} ${inter.className}`}
      aria-label="Osama Abdelnaser — Product Designer"
    >
      <header className={styles.header}>
        <Link className={styles.logo} href="/" aria-label="Osama Abdelnaser, home">
          osama
        </Link>
        <a className={styles.contact} href={heroContent.contactHref}>
          {heroContent.contactLabel}
        </a>
      </header>
      <HeroScene />
    </section>
  );
}
