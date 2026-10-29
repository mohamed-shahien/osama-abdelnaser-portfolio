import { profile } from '@/content/profile';

export const heroContent = {
  word: 'osama.',
  name: profile.name,
  role: profile.role,
  description: profile.description,
  contactLabel: 'Talk design',
  contactHref: 'mailto:osamaabdelnaser18@gmail.com',
  // Editorial copy based on the brief's Understand / Simplify / Systems / Experience approach.
  poster: {
    title: 'Digital products, made more human.',
    eyebrow: 'Product Designer',
    left: ['', 'HU'],
    giant: 'M',
    right: ['ORE', 'AN'],
    labels: ['Less friction.', 'More clarity.'],
    greeting: 'Let’s make it useful!',
  },
  comments: ['Complex problems. Clear experiences.', 'Thoughtful UX. Interfaces built to work.'],
  processNotes: `Ask better questions.\nMap the real problem.\nMake every step clear.\nDesign a useful experience.`,
  skipIntro: 'Explore the design',
  motionLabel: 'Keep it moving',
  artwork: {
    canvasLabel: 'IDEAS INTO INTERFACES',
    canvasLines: ['Clear.', 'By design.'],
    laptopLabel: 'PRODUCT THINKING',
    laptopLines: ['Less friction.', 'More flow.'],
    phoneLabel: 'MADE FOR PEOPLE',
  },
  // Roles describe a design workflow, not named colleagues or a claimed team.
  cursors: [
    'Ask why',
    'Find the friction',
    'Shape the flow',
    'Make it clear',
    'Prototype',
    'Connect the system',
    'Refine the detail',
  ],
} as const;
