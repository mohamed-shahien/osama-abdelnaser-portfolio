import { profile } from '@/content/profile';

export const heroContent = {
  word: 'osama.',
  name: profile.name,
  role: profile.role,
  description: profile.description,
  contactLabel: 'Talk design',
  contactHref: 'mailto:osamaabdelnaser18@gmail.com',
  // The poster spells UX / UI around one giant U. Its heading is the brief's
  // verbatim short bio. The top row names core specialties from section 03; the
  // name and title sit on the bottom row, clear of the character's head.
  poster: {
    title: profile.description,
    top: ['UX research', 'Design systems'],
    bottom: [profile.name, profile.role],
    left: ['', ''],
    giant: 'U',
    right: ['X', 'I'],
    greeting: 'Let’s make it useful!',
  },
  // Review notes paraphrase the brief's bio and its proposed positioning (section 16).
  comments: ['Complex problems, simple experiences.', 'Considered design that can be built.'],
  // The four steps of "How I think" from the brief, section 03.
  method: ['Understand', 'Simplify', 'Design systems', 'Experience'],
  skipIntro: 'Explore the design',
  motionLabel: 'Keep it moving',
  artwork: {
    flow: ['Sign up', 'Valid?', 'Home'],
    tokensLabel: 'Color & type',
    dashboardLabel: 'Dashboard',
    appLabel: 'Mobile app',
  },
  // UX activities from the brief's skill list (section 03), not named collaborators.
  cursors: ['Research', 'User flows', 'Wireframing', 'Prototyping', 'Design systems'],
} as const;
