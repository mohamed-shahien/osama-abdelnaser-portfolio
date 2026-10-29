import { practiceContent } from '@/content/practice';
import { PracticeShowcase } from './practice-showcase';

export function Practice() {
  return (
    <section aria-label={practiceContent.eyebrow} className="bg-white text-ink">
      <PracticeShowcase
        glyphs={[...practiceContent.glyphs]}
        mark={practiceContent.mark}
        word={practiceContent.word}
      />
    </section>
  );
}
