import type { Metadata } from 'next';

import { InnerHeader } from '@/components/sections/inner-header';
import { JsonLd } from '@/components/sections/json-ld';
import { PlaygroundGallery } from '@/components/sections/playground-gallery';
import { workGroupDot } from '@/components/sections/work-group-dot';
import { collectionJsonLd, pageMetadata } from '@/config/seo';
import { workDisplay } from '@/config/work-fonts';
import { playgroundFilters, playgroundIntro } from '@/content/playground';
import type { WorkGroupId } from '@/content/work-groups';
import { workProjects } from '@/content/work';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: `All ${workProjects.length} projects — UI/UX design work`,
  description: `${workProjects.length} UI/UX projects by Osama Abdelnaser: websites, company sites, SaaS platforms, Salla and Zid stores and store themes, in Arabic RTL and English. Filter by kind and open any case.`,
  path: '/playground',
});

export default function PlaygroundPage() {
  const groups = playgroundFilters.filter((item) => item.id !== 'all');
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${workDisplay.variable} min-h-svh bg-background text-ink`}
    >
      <JsonLd data={collectionJsonLd(workProjects)} />
      <InnerHeader current="playground" />
      <div className="px-4 pb-24 md:grid md:grid-cols-[24%_1fr] md:gap-5">
        <aside className="mb-10 flex flex-col gap-6 md:sticky md:top-5 md:mb-0 md:h-[calc(100svh-40px)] md:justify-between">
          <h1 className="sr-only">Playground — all projects</h1>
          <div>
            <p
              aria-label={`${workProjects.length} projects`}
              className="text-[clamp(6rem,15vw,16rem)] leading-[.75] font-medium tracking-[-.1em] text-primary"
            >
              {workProjects.length}
            </p>
            <p className="mt-3 inline-flex rotate-[-3deg] rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-[0.04em] text-ink uppercase [box-shadow:0_2px_0_#17284f]">
              projects so far
            </p>
          </div>
          <div className="grid gap-5">
            <ul className="grid list-none gap-1.5 p-0 text-xs" aria-label="By kind">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex items-center gap-2 border-b border-ink/10 pb-1.5"
                >
                  <span
                    aria-hidden="true"
                    className={cn('size-[8px] rounded-full', workGroupDot[group.id as WorkGroupId])}
                  />
                  <span className="flex-1">{group.label}</span>
                  <span className="text-ink/70 tabular-nums">
                    {String(group.count).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>
            <p className="max-w-56 text-xs leading-tight font-medium max-md:max-w-64">
              {playgroundIntro}
            </p>
          </div>
        </aside>
        <PlaygroundGallery />
      </div>
    </main>
  );
}
