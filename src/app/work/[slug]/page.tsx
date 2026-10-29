import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { WorkCase } from '@/components/sections/work-case';
import { workProjects } from '@/content/work';

export function generateStaticParams() {
  return workProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = workProjects.find((item) => item.slug === slug);
  return {
    title: project
      ? `${project.name}${project.sourceAuthor ? ' — Reference study' : ''}`
      : 'Project not found',
    description: project?.description,
  };
}

async function ProjectContent({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const index = workProjects.findIndex((project) => project.slug === slug);
  const project = workProjects[index];
  if (!project) notFound();
  return <WorkCase project={project} next={workProjects[(index + 1) % workProjects.length]} />;
}

export default function WorkPage(props: PageProps<'/work/[slug]'>) {
  return (
    <main id="main-content" tabIndex={-1} className="bg-[#ededed]">
      <Suspense
        fallback={
          <div role="status" className="min-h-svh bg-black">
            <span className="sr-only">Opening project…</span>
          </div>
        }
      >
        <ProjectContent {...props} />
      </Suspense>
    </main>
  );
}
