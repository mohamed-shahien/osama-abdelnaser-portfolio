'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { useSiteIntroReady } from '@/components/providers/site-intro-context';
import { motionConfig } from '@/lib/motion/config';

/**
 * The logo video, whole and at its own ratio, looping while it is on screen
 * and the tab is visible. Under reduced motion, or before the video has a
 * frame, the still of its last frame shows.
 */
export function NavLogo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = useSiteIntroReady();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready || window.matchMedia(motionConfig.queries.reduced).matches) return;
    let onScreen = false;
    const sync = () => {
      if (onScreen && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };
    // The still steps aside once the video draws.
    const live = () => {
      if (video.parentElement) video.parentElement.dataset.live = 'true';
    };
    video.addEventListener('playing', live, { once: true });
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      video.removeEventListener('playing', live);
      video.pause();
    };
  }, [ready]);

  return (
    <span className="group relative block aspect-[1070/1302] h-24 overflow-hidden rounded-xl md:h-36">
      <Image
        src="/brand/osama-logo.webp"
        alt=""
        width={330}
        height={402}
        priority
        className="absolute inset-0 size-full group-data-[live=true]:opacity-0"
      />
      {/* Multiply drops the video's paper onto any page ground. */}
      <video
        ref={videoRef}
        src="/intro/logo-intro.mp4"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 size-full mix-blend-multiply motion-reduce:hidden"
      />
    </span>
  );
}
