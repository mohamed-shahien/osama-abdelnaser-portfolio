import { workDisplay } from '@/config/work-fonts';
import { interestsContent } from '@/content/interests';
import { InterestsShowcase } from './interests-showcase';

/** Interests, the last chapter before the footer, on a dotted paper ground. */
export function Interests() {
  return (
    <section
      id="interests"
      aria-label={interestsContent.label}
      className={`${workDisplay.variable} relative bg-[#fbf7ec]`}
    >
      <InterestsShowcase />
    </section>
  );
}
