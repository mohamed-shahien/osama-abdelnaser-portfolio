import { Hero } from '@/components/sections/hero';
import { SelectedWork } from '@/components/sections/selected-work';
import { Solution } from '@/components/sections/solution';
import { Skills } from '@/components/sections/skills';

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-svh">
      <Hero />
      <SelectedWork>
        <Solution />
      </SelectedWork>
      <Skills />
    </main>
  );
}
