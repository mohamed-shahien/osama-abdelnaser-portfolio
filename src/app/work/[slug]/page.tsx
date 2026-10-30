import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { JsonLd } from '@/components/sections/json-ld';
import { WorkCase } from '@/components/sections/work-case';
import { pageMetadata, projectJsonLd } from '@/config/seo';
import { workProjects } from '@/content/work';

export function generateStaticParams() {
  return workProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = workProjects.find((item) => item.slug === slug);
  if (!project) return { title: 'Project not found', robots: { index: false } };
  return pageMetadata({
    title: `${project.name} — ${project.category} design`,
    description: `${project.description} ${project.category} UI/UX by Osama Abdelnaser, Product Designer.`,
    path: `/work/${project.slug}`,
    type: 'article',
    images: [
      {
        url: project.cover.src,
        width: project.cover.width,
        height: project.cover.height,
        alt: project.cover.alt,
      },
    ],
  });
}

async function ProjectContent({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const index = workProjects.findIndex((project) => project.slug === slug);
  const project = workProjects[index];
  if (!project) notFound();
  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <WorkCase project={project} next={workProjects[(index + 1) % workProjects.length]} />
    </>
  );
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
