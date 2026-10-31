// Copy for the Interests section at the end of the home page. The sixteen
// interests are Osama's own list; the one-line notes are placeholder copy
// until he confirms or rewrites them. Photos are placeholders until the real
// thirty arrive, each tagged with the interest it belongs to.

/** What the avatar does when an interest is picked. */
export type InterestAct =
  'flash' | 'waves' | 'bubbles' | 'burst' | 'type' | 'steam' | 'stamp' | 'ticks';

export type Interest = {
  id: string;
  label: string;
  note: string;
  act: InterestAct;
  /** Particles for `burst`, words for `bubbles`. */
  glyphs?: readonly string[];
  /** Card color, from the approved palette. */
  tone: 'blue' | 'yellow' | 'warm' | 'rose' | 'ink' | 'white';
  // Each interest's drawn pose lives in public/interests/poses/<id>.webp (see interest-stage).
};

export type InterestPhoto = {
  /** Empty until the real photo arrives; the rings draw a placeholder card. */
  src: string;
  alt: string;
  interest: Interest['id'];
};

const interests = [
  {
    id: 'photography',
    label: 'Photography',
    note: 'Framing light before the shot.',
    act: 'flash',
    tone: 'ink',
  },
  {
    id: 'voiceover',
    label: 'Voiceover',
    note: 'A voice that carries the story.',
    act: 'waves',
    tone: 'rose',
  },
  {
    id: 'languages',
    label: 'Languages',
    note: 'Saying hello in more than one way.',
    act: 'bubbles',
    glyphs: ['Hello', 'مرحبا', 'Hola', 'Bonjour', 'Ciao'],
    tone: 'yellow',
  },
  {
    id: 'chess',
    label: 'Chess',
    note: 'Thinking three moves ahead.',
    act: 'stamp',
    glyphs: ['♞'],
    tone: 'warm',
  },
  {
    id: 'learning',
    label: 'Learning',
    note: 'Always one course into the next.',
    act: 'burst',
    glyphs: ['A+', '+1', '✎', '?'],
    tone: 'blue',
  },
  {
    id: 'writing',
    label: 'Writing',
    note: 'Thinking out loud, one draft at a time.',
    act: 'type',
    tone: 'white',
  },
  {
    id: 'reading',
    label: 'Reading',
    note: 'A book is always half open.',
    act: 'burst',
    glyphs: ['a', '“', 'Z', '”', '?', '!'],
    tone: 'white',
  },
  {
    id: 'playstation',
    label: 'PlayStation',
    note: 'Player one, always ready.',
    act: 'burst',
    glyphs: ['✕', '○', '△', '□'],
    tone: 'ink',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    note: 'The move before the move.',
    act: 'stamp',
    glyphs: ['◎'],
    tone: 'warm',
  },
  {
    id: 'ai',
    label: 'AI',
    note: 'New tools, tested in the real work.',
    act: 'burst',
    glyphs: ['✦', '✧', '⟡', '✦'],
    tone: 'rose',
  },
  {
    id: 'e-commerce',
    label: 'E-Commerce',
    note: 'Stores that make buying feel easy.',
    act: 'burst',
    glyphs: ['+1', '%', '$', '+1'],
    tone: 'yellow',
  },
  {
    id: 'interactions',
    label: 'Interactions',
    note: 'The small motion that says yes.',
    act: 'stamp',
    glyphs: ['➚'],
    tone: 'blue',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    note: 'Fuel for the late-night pixels.',
    act: 'steam',
    tone: 'warm',
  },
  {
    id: 'heritage',
    label: 'Heritage',
    note: 'Roots that shape the eye.',
    act: 'stamp',
    glyphs: ['۞'],
    tone: 'white',
  },
  {
    id: 'community',
    label: 'Community',
    note: 'Sharing what he learns along the way.',
    act: 'burst',
    glyphs: ['♥', '♥', '☺', '♥'],
    tone: 'rose',
  },
  {
    id: 'discipline',
    label: 'Discipline',
    note: 'Showing up, day after day.',
    act: 'ticks',
    tone: 'ink',
  },
] as const satisfies readonly Interest[];

export type InterestId = (typeof interests)[number]['id'];

// Thirty placeholder slots, spread over the interests until the real photos
// and their tags are supplied.
const photoInterests: readonly InterestId[] = [
  'photography',
  'coffee',
  'heritage',
  'community',
  'learning',
  'voiceover',
  'languages',
  'writing',
  'reading',
  'ai',
  'e-commerce',
  'strategy',
  'playstation',
  'interactions',
  'discipline',
  'chess',
];
const photos: readonly InterestPhoto[] = Array.from({ length: 30 }, (_, index) => {
  const interest = photoInterests[index % photoInterests.length] ?? 'photography';
  return { src: '', alt: `Placeholder photo ${index + 1}`, interest };
});

export const interestsContent = {
  label: 'Interests — what Osama Abdelnaser does off the clock',
  kicker: 'Off the clock',
  title: 'Interests',
  lead: 'Sixteen things that keep Osama curious. Hover one and watch.',
  hint: 'Drag the rings',
  interests,
  photos,
} as const;
