'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { WorkImage } from '@/types/work';
import { cn } from '@/lib/utils';

export function WorkCaseGallery({
  images,
  children,
}: {
  images: readonly WorkImage[];
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let observer: IntersectionObserver;
    let resizeTimer = 0;
    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries.find((item) => item.isIntersecting);
          if (!entry) return;
          const index = Number((entry.target as HTMLElement).dataset.caseImage);
          if (Number.isFinite(index) && index !== activeRef.current) {
            activeRef.current = index;
            setActive(index);
          }
        },
        {
          rootMargin: `-${Math.round(innerHeight * 0.35)}px 0px -${Math.round(innerHeight * 0.64)}px 0px`,
          threshold: 0,
        },
      );
      root.querySelectorAll('[data-case-image]').forEach((image) => observer.observe(image));
    };
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(observe, 150);
    };
    observe();
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
    };
  }, [images]);

  return (
    <div
      ref={rootRef}
      className="relative grid items-start gap-10 px-5 lg:grid-cols-[27%_47%_1fr] lg:gap-0"
    >
      <aside className="self-start text-xs lg:sticky lg:top-[40svh] lg:pe-10">{children}</aside>
      <div className="space-y-16 pb-[30svh] lg:space-y-[9svh]">
        {images.map((image, index) => (
          <figure
            key={`${image.src}-${index}`}
            id={`work-image-${index + 1}`}
            data-case-image={index}
            className="scroll-mt-[15svh]"
          >
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              unoptimized
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="(min-width: 1024px) 47vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-[10px] text-ink/45 lg:sr-only">
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </figcaption>
          </figure>
        ))}
      </div>
      <nav
        aria-label="Project image thumbnails"
        className="sticky top-[30svh] flex max-h-[55svh] [scrollbar-width:thin] flex-col items-end gap-1 overflow-y-auto pe-3 max-lg:hidden"
      >
        {images.map((image, index) => (
          <a
            key={`${image.src}-${index}`}
            href={`#work-image-${index + 1}`}
            aria-label={`View interface image ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
            className={cn(
              'block w-14 shrink-0 border p-1 focus-visible:outline-2 focus-visible:outline-primary',
              active === index ? 'border-ink/40' : 'border-transparent',
            )}
          >
            <Image
              src={image.thumbnail ?? image.src}
              alt=""
              width={48}
              height={30}
              loading="lazy"
              unoptimized
              className="h-[30px] w-12 object-cover"
            />
          </a>
        ))}
      </nav>
    </div>
  );
}
