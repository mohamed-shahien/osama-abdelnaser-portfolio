'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { registerPageScroll } from '@/lib/motion/page-scroll';

function MotionRuntime() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(motionConfig.queries.full, () => {
        const lenis = new Lenis({
          autoRaf: false,
          anchors: true,
          lerp: motionConfig.scroll.lerp,
          smoothWheel: true,
          syncTouch: false,
          stopInertiaOnNavigate: true,
        });
        const unregisterScroll = registerPageScroll((position) =>
          lenis.scrollTo(position, { immediate: true, force: true }),
        );

        let disposed = false;
        let refreshFrame = 0;

        const tick = (seconds: number) => lenis.raf(seconds * 1000);
        const refresh = () => {
          if (disposed) return;
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => {
            lenis.resize();
            ScrollTrigger.refresh();
          });
        };
        const onAssetLoad = (event: Event) => {
          if (event.target instanceof HTMLImageElement) refresh();
        };

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(tick);
        document.addEventListener('load', onAssetLoad, true);
        void document.fonts.ready.then(refresh);
        refresh();

        return () => {
          unregisterScroll();
          disposed = true;
          cancelAnimationFrame(refreshFrame);
          document.removeEventListener('load', onAssetLoad, true);
          gsap.ticker.remove(tick);
          lenis.off('scroll', ScrollTrigger.update);
          lenis.destroy();
        };
      });

      return () => media.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}

export function MotionProvider() {
  // Keep route-dependent client work inside its own boundary, away from page HTML.
  return (
    <Suspense fallback={null}>
      <MotionRuntime />
    </Suspense>
  );
}
