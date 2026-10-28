'use client';

import { Container } from '@/components/ui/container';

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="py-24">
      <Container>
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-muted">Please try loading this page again.</p>
        <button type="button" onClick={retry} className="mt-6 underline underline-offset-4">
          Try again
        </button>
      </Container>
    </main>
  );
}
