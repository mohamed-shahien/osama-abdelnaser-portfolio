import { Container } from '@/components/ui/container';
import { profile } from '@/content/profile';

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center py-24">
      <Container>
        <h1 className="text-3xl font-semibold">{profile.name}</h1>
        <p className="mt-3 text-lg text-muted">{profile.role}</p>
        <p className="mt-8 text-sm text-muted">Portfolio in progress.</p>
      </Container>
    </main>
  );
}
