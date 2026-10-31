'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { SiteCursor } from '@/components/providers/site-cursor';
import { SiteIntroReadyContext } from '@/components/providers/site-intro-context';
import { ScrollTrigger } from '@/lib/motion/gsap';

// Loaded only for a visit that opens on the home page; the paper it starts on
// covers the page while its code arrives.
const AmourSunrisePreloader = dynamic(() => import('@/components/ui/amour-sunrise-preloader'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#F8FA55]" />,
});

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SiteIntro({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  // The loader opens the site from the home page only; a visit that lands on an
  // inner page (a project from search, the contact link) opens on its content.
  const pathname = usePathname();
  const [entry] = useState(pathname);
  const [complete, setComplete] = useState(entry !== '/');
  // The page starts its own entrance as the loader lifts, so the two overlap.
  const [lifted, setLifted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const active = hydrated && !complete;

  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const gate = overlayRef.current?.querySelector<HTMLElement>('[role="progressbar"]');
    root.style.overflow = 'hidden';
    gate?.focus({ preventScroll: true });

    const keepFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        gate?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', keepFocus);

    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keepFocus);
    };
  }, [active]);

  const lift = useCallback(() => setLifted(true), []);
  const finish = useCallback(() => {
    setComplete(true);
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    });
  }, []);

  return (
    <SiteIntroReadyContext value={hydrated && (lifted || !active)}>
      <div className="flex min-h-svh flex-1 flex-col" inert={active}>
        {children}
      </div>
      {active ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Opening Osama Abdelnaser’s portfolio"
          data-lenis-prevent
        >
          <AmourSunrisePreloader
            caption="complex → simple"
            mark="➚"
            fontFamily="var(--font-sans)"
            onLift={lift}
            onComplete={finish}
          />
        </div>
      ) : null}
      {/* The loader's arrow becomes the pointer as the loader lifts. */}
      <SiteCursor waiting={!hydrated || (active && !lifted)} handoff={entry === '/'} />
    </SiteIntroReadyContext>
  );
}
