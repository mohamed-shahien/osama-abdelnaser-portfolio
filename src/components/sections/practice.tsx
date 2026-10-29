import { practiceContent } from '@/content/practice';
import { PracticeShowcase } from './practice-showcase';

export function Practice() {
  return (
    <section aria-label={practiceContent.eyebrow} className="bg-white text-[#17284F]">
      <PracticeShowcase
        glyphs={[...practiceContent.glyphs]}
        mark={practiceContent.mark}
        word={practiceContent.word}
        caption={practiceContent.caption}
      >
        <div className="grid h-full place-items-center bg-white px-6 text-center">
          <p className="max-w-3xl text-3xl font-bold tracking-tight text-[#17284F] sm:text-6xl">
            {practiceContent.closing}
          </p>
        </div>
      </PracticeShowcase>
    </section>
  );
}
