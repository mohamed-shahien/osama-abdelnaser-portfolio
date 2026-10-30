import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { workProjects } from '@/content/work';
import { workContent } from '@/content/work-copy';
import { workDisplay } from '@/config/work-fonts';
import { WorkShowcase } from './work-showcase';

export function SelectedWork({ children }: { children: ReactNode }) {
  return (
    <section
      id="work"
      aria-label={workContent.title}
      className={`${workDisplay.variable} relative isolate z-10 overflow-x-clip font-sans text-ink`}
    >
      <WorkShowcase
        projects={workProjects.slice(0, workContent.featuredCount)}
        total={workProjects.length}
      >
        {children}
      </WorkShowcase>
      <noscript>
        <div className="mx-auto max-w-7xl bg-[#ededed] px-6 py-20">
          <h2 className="mb-10 text-4xl">{workContent.title}</h2>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {workProjects.map((project) => (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} prefetch={false}>
                  <Image
                    src={project.cover.src}
                    width={project.cover.width}
                    height={project.cover.height}
                    alt={project.cover.alt}
                    unoptimized
                    className="mb-4 h-auto w-full"
                  />
                  <h3 className="text-xl">{project.name}</h3>
                  <p className="mt-2 text-sm">{project.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
      <span id="after-selected-work" className="block" />
    </section>
  );
}
