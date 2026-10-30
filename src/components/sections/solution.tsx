import { solutionContent } from '@/content/solution';
import { ScrollDissolve } from './scroll-dissolve';
import { SolutionShowcase } from './solution-showcase';

export function Solution() {
  return (
    <section
      id="process"
      aria-label={solutionContent.label}
      className="relative bg-secondary text-ink"
    >
      <ScrollDissolve />
      <SolutionShowcase />
    </section>
  );
}
