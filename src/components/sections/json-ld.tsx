import { jsonLdHtml } from '@/config/seo';

/** Structured data for search engines, rendered as a JSON-LD script. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />
  );
}
