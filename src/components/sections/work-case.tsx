import Link from 'next/link';

import type { WorkProject } from '@/types/work';
import { WorkCaseGallery } from './work-case-gallery';

export function WorkCase({
  project,
  next,
}: {
  project: WorkProject;
  next: WorkProject | undefined;
}) {
  const images = project.images.length ? project.images : [project.cover];
  return (
    <article className="relative bg-[#ededed] text-[#181818]">
      <div className="pointer-events-none sticky top-0 z-20 -mb-[100svh] flex h-svh items-end justify-center overflow-hidden pb-5">
        <h1 className="max-w-full text-center font-serif text-[clamp(2.75rem,9vw,10rem)] leading-[0.8] tracking-[-0.055em] [overflow-wrap:anywhere] text-primary uppercase max-lg:pb-5">
          {project.name}
        </h1>
      </div>
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-5 p-5 text-xs">
        <Link
          href="/#work-viewer"
          prefetch={false}
          className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          ← Back to work
        </Link>
        {project.sourceUrl ? (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-end text-[10px] leading-snug underline underline-offset-4"
          >
            Reference study
            <br />
            {project.sourceAuthor} ↗
          </a>
        ) : (
          <span>{project.category}</span>
        )}
      </header>
      <div className="pt-32 lg:pt-[30svh]">
        <WorkCaseGallery key={project.slug} images={images}>
          <dl className="grid grid-cols-[72px_1fr] gap-x-7 gap-y-10 leading-tight">
            <dt className="text-black/45">About</dt>
            <dd className="max-w-64">{project.description}</dd>
            <dt className="text-black/45">Role</dt>
            <dd>{project.role}</dd>
            <dt className="text-black/45">Launch</dt>
            <dd>{project.launch}</dd>
            {project.sourceAuthor ? (
              <>
                <dt className="text-black/45">Original work</dt>
                <dd>{project.sourceAuthor}</dd>
              </>
            ) : null}
          </dl>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="ms-[100px] mt-12 inline-block text-base underline underline-offset-4"
            >
              Visit site ↗
            </a>
          ) : null}
        </WorkCaseGallery>
      </div>
      {next ? (
        <Link
          href={`/work/${next.slug}`}
          prefetch={false}
          className="relative z-30 flex min-h-[50svh] flex-col items-center justify-center gap-5 border-t border-ink/10 px-6 pb-12 text-center focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="text-xs">Next project</span>
          <span className="font-serif text-[clamp(2.5rem,6vw,7rem)] leading-none tracking-tight uppercase">
            {next.name} ↗
          </span>
        </Link>
      ) : null}
    </article>
  );
}
