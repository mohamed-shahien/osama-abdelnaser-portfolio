'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

import {
  getMusicPlaying,
  getServerMusicPlaying,
  readMusicLevels,
  subscribeMusic,
  toggleMusic,
} from '@/lib/audio/lofi';
import { cn } from '@/lib/utils';

export function useMusicPlaying() {
  return useSyncExternalStore(subscribeMusic, getMusicPlaying, getServerMusicPlaying);
}

const BINS = [2, 4, 6, 9, 13];

/**
 * Five bars that follow the music. The frame loop runs only while the music
 * plays, the bars are on screen and the tab is visible.
 */
export function MusicBars({ className }: { className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const playing = useMusicPlaying();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !playing) return;
    const bars = [...root.children] as HTMLElement[];
    const levels = new Uint8Array(32);
    let frame = 0;
    let seen = true;
    const tick = () => {
      if (readMusicLevels(levels)) {
        bars.forEach((bar, index) => {
          const level = (levels[BINS[index] ?? 0] ?? 0) / 255;
          bar.style.transform = `scaleY(${(0.18 + level * 0.82).toFixed(3)})`;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (seen && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      seen = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      bars.forEach((bar) => (bar.style.transform = ''));
    };
  }, [playing]);

  return (
    <span
      ref={rootRef}
      className={cn('flex h-[16px] items-end gap-[2px]', className)}
      aria-hidden="true"
    >
      {BINS.map((bin) => (
        <span
          key={bin}
          className="block h-full w-[3px] origin-bottom [transform:scaleY(0.22)] rounded-full bg-current [transition:transform_90ms_linear]"
        />
      ))}
    </span>
  );
}

/** The hero's record player: a vinyl that spins while Osama's studio radio plays. */
export function HeroMusic({ className }: { className?: string }) {
  const playing = useMusicPlaying();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The record rests while it is off screen.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) button.dataset.offscreen = String(!entry.isIntersecting);
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);
  return (
    <button
      ref={buttonRef}
      type="button"
      className={cn(
        'group/music flex h-[50px] cursor-pointer items-center gap-[10px] rounded-[20px] bg-[#fffffff2] ps-[6px] pe-[14px] text-[13px] text-ink [box-shadow:0_1px_4px_#17284f1a] [border:0] max-lg:h-[38px] max-lg:gap-[6px] max-lg:pe-[10px] max-lg:text-[11px]',
        className,
      )}
      aria-pressed={playing}
      aria-label={
        playing
          ? 'Pause Osama’s studio radio'
          : 'Play Osama’s studio radio, a calm generated lo-fi loop'
      }
      onClick={toggleMusic}
    >
      <span
        className="relative grid size-[38px] shrink-0 animate-[spin_3.2s_linear_infinite] place-items-center rounded-full bg-ink [background-image:repeating-radial-gradient(circle,#ffffff14_0_1px,transparent_1px_4px)] [animation-play-state:paused] group-aria-pressed/music:[animation-play-state:running] group-data-[offscreen=true]/music:[animation-play-state:paused]! motion-reduce:animate-none max-lg:size-[28px]"
        aria-hidden="true"
      >
        <span className="grid size-[15px] place-items-center rounded-full bg-secondary text-[5px] font-bold text-ink max-lg:size-[11px]">
          oa.
        </span>
        <span className="absolute top-[5px] left-[9px] size-[4px] rounded-full bg-[#ffffff55]" />
      </span>
      <span className="flex flex-col items-start leading-[14px]">
        <span className="font-semibold whitespace-nowrap">Studio radio</span>
        <span className="text-[10px] whitespace-nowrap text-[#6d7583] max-lg:hidden">
          {playing ? 'lo-fi · on air' : 'lo-fi · tap to play'}
        </span>
      </span>
      <MusicBars className="text-primary group-aria-pressed/music:text-accent-rose" />
    </button>
  );
}
