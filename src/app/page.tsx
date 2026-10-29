import { Hero } from '@/components/sections/hero';
import { Practice } from '@/components/sections/practice';
import { SelectedWork } from '@/components/sections/selected-work';

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-svh">
      <Hero />
      <Practice />
      <SelectedWork />
    </main>
  );
}
