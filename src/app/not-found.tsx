import Link from 'next/link';

import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="py-24">
      <Container>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-4 text-muted">The page you requested could not be found.</p>
        <Link href="/" className="mt-6 inline-block underline underline-offset-4">
          Back to home
        </Link>
      </Container>
    </main>
  );
}
