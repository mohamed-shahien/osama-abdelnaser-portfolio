import { Cv } from '@/components/sections/cv';
import { Hero } from '@/components/sections/hero';
import { Interests } from '@/components/sections/interests';
import { SelectedWork } from '@/components/sections/selected-work';
import { Solution } from '@/components/sections/solution';
import { Skills } from '@/components/sections/skills';
import { SectionDock } from '@/components/sections/section-dock';

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-svh">
      <Hero />
      <SelectedWork>
        <Solution />
      </SelectedWork>
      <Skills />
      <Cv />
      <Interests />
      <SectionDock />
    </main>
  );
}
