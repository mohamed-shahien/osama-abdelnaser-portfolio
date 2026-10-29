'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import AmourSunrisePreloader from '@/components/ui/amour-sunrise-preloader';
import { SiteIntroReadyContext } from '@/components/providers/site-intro-context';
import { ScrollTrigger } from '@/lib/motion/gsap';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SiteIntro({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [complete, setComplete] = useState(false);
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

  const finish = useCallback(() => {
    setComplete(true);
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    });
  }, []);

  return (
    <SiteIntroReadyContext value={hydrated && !active}>
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
          <AmourSunrisePreloader onComplete={finish} />
        </div>
      ) : null}
    </SiteIntroReadyContext>
  );
}
