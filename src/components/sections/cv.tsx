import { cvContent } from '@/content/cv';
import { workProjects } from '@/content/work';
import { workGroupOf } from '@/content/work-groups';
import { CvShowcase } from './cv-showcase';

// Services show how many projects of each kind shipped, counted from the work data
// here on the server so the project list stays out of the client bundle.
const pad = (n: number) => String(n).padStart(2, '0');
const slides = {
  ...cvContent.slides,
  bubble: {
    ...cvContent.slides.bubble,
    facts: cvContent.slides.bubble.facts.map((fact, index) => {
      const proof = cvContent.serviceProof[index];
      if (!proof) return fact;
      const groups: readonly string[] = proof.groups;
      const count = workProjects.filter((project) => groups.includes(workGroupOf(project))).length;
      return count ? { ...fact, n: `${pad(count)} ${proof.unit}` } : fact;
    }),
  },
};

/** The CV chapter after Skills: the iris closes onto its navy ground. */
export function Cv() {
  return (
    <section id="cv" aria-label={cvContent.label} className="relative bg-[#17284f]">
      <h2 className="sr-only">{cvContent.title}</h2>
      <CvShowcase slides={slides} />
      <noscript>
        <p className="px-6 py-20 text-center text-white">
          <a href={cvContent.cta.href} className="underline">
            {cvContent.cta.label} the CV ({cvContent.cta.note})
          </a>
        </p>
      </noscript>
    </section>
  );
}
