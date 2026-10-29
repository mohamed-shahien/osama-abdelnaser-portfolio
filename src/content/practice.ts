import type { OnyxGlyph } from '@/components/ui/onyx-glyph-preloader';

// Practice areas shown in the "What I do" section. The five stages follow the
// workflow described in the brief; swap each `d` for the final icon path.
export const practiceContent = {
  eyebrow: 'What I do',
  word: 'osama.',
  glyphs: [
    { d: 'M44 20 A24 24 0 1 0 44.1 20 Z M62 62 L82 82', stroke: 9, label: 'UX Research' },
    { d: 'M18 24 H82 V76 H18 Z M18 40 H82', stroke: 8, label: 'UI Design' },
    { d: 'M30 18 L74 54 L53 57 L63 81 L52 86 L42 62 L28 76 Z', label: 'Prototyping' },
    {
      d: 'M20 20 H44 V44 H20 Z M56 20 H80 V44 H56 Z M20 56 H44 V80 H20 Z M56 56 H80 V80 H56 Z',
      label: 'Design Systems',
    },
    {
      d: 'M36 30 L16 50 L36 70 M64 30 L84 50 L64 70 M56 24 L44 76',
      stroke: 8,
      label: 'Dev Handoff',
    },
  ] satisfies OnyxGlyph[],
  mark: { d: 'M50 21 A29 29 0 1 0 50.01 21 Z', stroke: 15, label: 'osama.' } satisfies OnyxGlyph,
} as const;
