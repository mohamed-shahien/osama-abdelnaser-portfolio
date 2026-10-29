'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import OnyxGlyphPreloader, { type OnyxGlyph } from '@/components/ui/onyx-glyph-preloader';

type Props = {
  glyphs: OnyxGlyph[];
  mark: OnyxGlyph;
  word: string;
  caption: string;
  /** Scroll distance the pinned stage lasts, as a multiple of the viewport height. */
  runway?: number;
  children?: ReactNode;
};

const palette = {
  stage: '#ffffff',
  metal: '#5b8dfb',
  shade: '#101c3a',
  rim: '#f8fa55',
  glitter: '#f8fa55',
  ink: '#17284f',
};

/**
 * Pins the stage while the page scrolls past it. Scroll position drives the
 * component's `progress`, so the tiles ignite as you scroll, then the hero tile
 * turns, the gate lifts and `children` take over. Scrolling back to the top replays it.
 */
export function PracticeShowcase({ glyphs, mark, word, caption, runway = 2, children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.min(1, Math.max(0, -rect.top / span));
      // The first 70% of the runway loads the tiles; the rest is breathing room.
      setProgress(Math.min(100, Math.round((raw / 0.7) * 100)));
      if (raw < 0.02 && doneRef.current) {
        doneRef.current = false;
        setRun((value) => value + 1);
      }
      setNear(true);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={trackRef} style={{ height: `${runway * 100}svh` }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: '100svh' }}>
        {near ? (
          <OnyxGlyphPreloader
            key={run}
            glyphs={glyphs}
            mark={mark}
            word={word}
            caption={caption}
            palette={palette}
            progress={progress}
            height="100svh"
            onComplete={() => {
              doneRef.current = true;
            }}
          >
            {children}
          </OnyxGlyphPreloader>
        ) : null}
      </div>
    </div>
  );
}
