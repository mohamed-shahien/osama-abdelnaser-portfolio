import Link from 'next/link';

import { Arrow } from '@/components/ui/arrow';
import type { WorkProject } from '@/types/work';
import { workDisplay } from '@/config/work-fonts';
import { WorkCaseGallery } from './work-case-gallery';
import { InnerHeader } from './inner-header';
import { WorkBadges } from './work-badges';
import { TransitionLink } from './page-transition';

export function WorkCase({
  project,
  next,
}: {
  project: WorkProject;
  next: WorkProject | undefined;
}) {
  const images = project.images.length ? project.images : [project.cover];
  return (
    <article className={`${workDisplay.variable} relative bg-[#ededed] font-sans text-[#181818]`}>
      <div className="pointer-events-none sticky top-0 z-20 -mb-[100lvh] flex h-lvh items-end justify-center overflow-hidden pb-5">
        <h1 className="max-w-full text-center [font-family:var(--font-work-display)] text-[clamp(2.75rem,9vw,10rem)] leading-[0.8] tracking-[-0.055em] [overflow-wrap:anywhere] text-primary uppercase max-lg:pb-5">
          {project.name}
        </h1>
      </div>
      <InnerHeader
        current="work"
        className="absolute inset-x-0 top-0 z-30"
        aside={
          <>
            <p className="text-ink/75">{project.category}</p>
            <Link
              href="/#work-viewer"
              prefetch={false}
              className="font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Arrow dir="left" className="me-1" />
              Back to work
            </Link>
          </>
        }
      />
      <div className="pt-28 lg:pt-[16svh]">
        <WorkCaseGallery key={project.slug} images={images}>
          <dl className="grid grid-cols-[72px_1fr] gap-x-7 gap-y-10 leading-tight">
            <dt className="text-black/60">About</dt>
            <dd className="max-w-64">{project.description}</dd>
            <dt className="text-black/60">Built for</dt>
            <dd>
              <WorkBadges project={project} className="max-w-64" />
            </dd>
            <dt className="text-black/60">Delivered</dt>
            <dd>{project.date}</dd>
          </dl>
          {project.liveUrl || project.behanceUrl ? (
            <p className="ms-[100px] mt-12 flex flex-wrap gap-x-6 gap-y-3 text-base">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Visit site <Arrow />
                </a>
              ) : null}
              {project.behanceUrl ? (
                <a
                  href={project.behanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Behance <Arrow />
                </a>
              ) : null}
            </p>
          ) : null}
        </WorkCaseGallery>
      </div>
      {next ? (
        <TransitionLink
          href={`/work/${next.slug}`}
          label={next.name}
          prefetch={false}
          className="relative z-30 flex min-h-[50svh] flex-col items-center justify-center gap-5 border-t border-ink/10 px-6 pb-12 text-center focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="text-xs">Next project</span>
          <span className="[font-family:var(--font-work-display)] text-[clamp(2.5rem,6vw,7rem)] leading-none tracking-tight uppercase">
            {next.name} <Arrow className="size-[0.7em] align-[0.05em]" />
          </span>
        </TransitionLink>
      ) : null}
    </article>
  );
}
