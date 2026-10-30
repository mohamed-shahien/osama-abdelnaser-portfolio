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
          wheelMultiplier: motionConfig.scroll.wheelMultiplier,
          smoothWheel: true,
          syncTouch: false,
          stopInertiaOnNavigate: true,
        });
        const unregisterScroll = registerPageScroll((position) =>
          lenis.scrollTo(position, { immediate: true, force: true }),
        );

        let disposed = false;
        let refreshFrame = 0;
        let refreshTimer: ReturnType<typeof setTimeout> | undefined;

        const tick = (seconds: number) => lenis.raf(seconds * 1000);
        const refresh = () => {
          if (disposed) return;
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => {
            lenis.resize();
            ScrollTrigger.refresh();
          });
        };
        // An image with its size in its attributes reserves its space before it
        // loads, so it cannot move anything; only the others call for a refresh,
        // and a burst of them (a gallery loading in) is measured once.
        const onAssetLoad = (event: Event) => {
          const image = event.target;
          if (!(image instanceof HTMLImageElement)) return;
          if (image.hasAttribute('width') && image.hasAttribute('height')) return;
          if (image.closest('[data-nimg="fill"]') || image.dataset.nimg === 'fill') return;
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(refresh, 160);
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
          clearTimeout(refreshTimer);
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
