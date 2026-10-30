import { solutionContent } from '@/content/solution';
import { SolutionShowcase } from './solution-showcase';

export function Solution() {
  return (
    <section aria-label={solutionContent.label} className="bg-secondary text-ink">
      <SolutionShowcase />
    </section>
  );
}
