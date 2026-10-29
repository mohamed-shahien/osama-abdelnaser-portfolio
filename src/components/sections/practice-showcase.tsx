'use client';

import { useEffect, useRef, useState } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import OnyxGlyphPreloader, { type OnyxGlyph } from '@/components/ui/onyx-glyph-preloader';

type Props = {
  glyphs: OnyxGlyph[];
  mark: OnyxGlyph;
  word: string;
};

const palette = {
  stage: '#ffffff',
  metal: '#5b8dfb',
  shade: '#101c3a',
  rim: '#f8fa55',
  glitter: '#f8fa55',
  ink: '#17284f',
};

// Share of the scroll runway that ignites the tiles; the rest lets the hero tile land.
const IGNITE = 0.6;

/**
 * Pins the stage while the page scrolls past it. Scroll position drives the
 * component's `progress`, so the tiles ignite as you scroll, then the hero tile
 * turns and holds. The runway is kept short (175svh) so the section never drags.
 * Scrolling back above it replays it.
 */
export function PracticeShowcase({ glyphs, mark, word }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const introDone = useSiteIntroReady();
  const [nearby, setNearby] = useState(false);
  const near = nearby && introDone;
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const playedRef = useRef(false);

  // Mount the stage only when it is about a screen away, never during the intro.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearby(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !near) return;

    let frame = 0;
    let inRange = false;
    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.min(1, Math.max(0, -rect.top / span));
      const next = Math.min(100, Math.round((raw / IGNITE) * 100));
      setProgress(next);
      if (next === 100) playedRef.current = true;
      if (raw < 0.02 && playedRef.current) {
        playedRef.current = false;
        setRun((value) => value + 1);
      }
    };
    const onScroll = () => {
      if (inRange && !frame) frame = requestAnimationFrame(update);
    };
    // Only measure while the track is near the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inRange = Boolean(entry?.isIntersecting);
        if (inRange) onScroll();
      },
      { rootMargin: '50% 0px' },
    );
    observer.observe(track);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [near]);

  return (
    <div ref={trackRef} className="h-[175svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {near ? (
          <OnyxGlyphPreloader
            key={run}
            glyphs={glyphs}
            mark={mark}
            word={word}
            caption=""
            showTitle={false}
            palette={palette}
            progress={progress}
            height="100svh"
          />
        ) : null}
      </div>
    </div>
  );
}
