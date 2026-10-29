'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import WavingPortfolioLanding from '@/components/ui/waving-portfolio-landing';
import { heroContent } from '@/content/hero';
import { motionConfig } from '@/lib/motion/config';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import styles from './hero.module.css';

type Phase = 'intro' | 'docking' | 'ready';
type Controls = { start?: () => void; finish?: () => void };

export function HeroPortfolioEntrance({
  reducedMotion,
  onReady,
  onReplay,
}: {
  reducedMotion: boolean;
  onReady: () => void;
  onReplay: () => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>('intro');
  const controlsRef = useRef<Controls>({});
  const [phase, setPhase] = useState<Phase>('intro');
  const [skip, setSkip] = useState(false);

  const start = useCallback(() => {
    phaseRef.current = 'intro';
    setPhase('intro');
    onReplay();
    controlsRef.current.start?.();
  }, [onReplay]);
  const drawn = useCallback(() => {
    phaseRef.current = 'docking';
    setPhase('docking');
    controlsRef.current.finish?.();
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      const layer = layerRef.current;
      if (!layer || !contextSafe) return;
      const landing = layer.querySelector('.wpl-root');
      const media = gsap.matchMedia();

      media.add(
        { full: motionConfig.queries.full, reduced: motionConfig.queries.reduced },
        (context) => {
          const reduce = Boolean(context.conditions?.reduced);
          let transition: gsap.core.Timeline | undefined;

          const dock = () => {
            const desktop = window.matchMedia('(min-width: 1024px)').matches;
            const height = layer.clientHeight;
            const header = parseFloat(
              getComputedStyle(layer).getPropertyValue('--hero-header-height'),
            );
            const center = desktop ? (height + header) / 2 - 50 : 336;
            return {
              '--portfolio-poster-scale': desktop ? 0.43 : Math.min(0.82, 360 / layer.clientWidth),
              '--portfolio-poster-shift': `${center - height * 0.45}px`,
            };
          };

          const reset = () => {
            transition?.kill();
            gsap.set(layer, {
              '--portfolio-poster-scale': 1,
              '--portfolio-poster-shift': '0px',
            });
            gsap.set(landing, { backgroundColor: '#ffffff' });
          };

          const finish = () => {
            transition?.kill();
            // Keep one context throughout the zoom; the canvas and corners never scale.
            transition = gsap.timeline({
              onComplete: () => {
                phaseRef.current = 'ready';
                setPhase('ready');
                ScrollTrigger.refresh();
              },
            });
            transition
              .to(layer, { ...dock(), duration: reduce ? 0 : 1.5, ease: 'power3.inOut' }, 0)
              .to(landing, { backgroundColor: 'transparent', duration: reduce ? 0 : 1 }, 0)
              .call(onReady, [], reduce ? 0 : 0.2);
          };

          controlsRef.current = { start: contextSafe(reset), finish: contextSafe(finish) };
          if (phaseRef.current === 'ready') {
            gsap.set(layer, dock());
            gsap.set(landing, { backgroundColor: 'transparent' });
          } else if (phaseRef.current === 'docking') {
            finish();
          } else {
            reset();
          }

          const resize = contextSafe(() => {
            if (phaseRef.current === 'ready') gsap.set(layer, dock());
            else if (phaseRef.current === 'docking') finish();
          });
          const observer = new ResizeObserver(resize);
          observer.observe(layer);
          return () => {
            observer.disconnect();
            transition?.kill();
            controlsRef.current = {};
          };
        },
      );
      return () => media.revert();
    },
    { scope: layerRef, dependencies: [onReady], revertOnUpdate: true },
  );

  // Pause the poster's endless CSS animations while the hero is off screen.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) layer.dataset.offscreen = String(!entry.isIntersecting);
    });
    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={layerRef}
        className={styles.portfolioLayer}
        data-portfolio-layer
        data-phase={phase}
        inert={phase !== 'ready'}
      >
        <WavingPortfolioLanding
          name={heroContent.name}
          year={heroContent.poster.eyebrow}
          roles={[...heroContent.poster.labels]}
          lettersLeft={[...heroContent.poster.left]}
          giantLetter={heroContent.poster.giant}
          lettersRight={[...heroContent.poster.right]}
          title={heroContent.poster.title}
          signature="OSA/MA"
          greeting={heroContent.poster.greeting}
          height="100%"
          intro={!skip && !reducedMotion}
          onIntroStart={start}
          onIntroComplete={drawn}
        />
      </div>
      {phase !== 'ready' ? (
        <button
          type="button"
          className={styles.skipPortfolio}
          onClick={() => {
            setSkip(true);
            layerRef.current?.closest('main')?.focus({ preventScroll: true });
          }}
        >
          {heroContent.skipIntro}
        </button>
      ) : null}
    </>
  );
}
