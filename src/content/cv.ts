// Copy for the CV chapter after Skills: one slide per Type Remix take, each
// with a fact sheet full enough to stand in for the PDF. Facts come from the
// master brief (sections 01, 03, 07, 08 and 09); prices and contact details
// are left out until they are approved.

import type {
  RemixDecal,
  RemixLabelMap,
  RemixSlides,
  RemixTake,
} from '@/components/ui/type-remix-preloader';

export const cvContent = {
  label: 'CV — Osama Abdelnaser, Product Designer',
  title: 'Curriculum Vitae',
  // Shared copy each slide falls back to.
  shared: {
    word: 'CURRICULUM',
    name: 'Osama Abdelnaser',
    discipline: 'Product Designer',
    year: '2026',
    period: 'Sep 2023 — Now',
    handle: 'Cairo · Riyadh · Remote',
    roles: ['Product Design', 'UX / UI', 'Design Systems', 'E-commerce'],
    kicker: 'The CV of',
    tagline: 'Product Designer',
    motto: 'complex → simple',
  },
  slides: {
    sticker: {
      word: 'ABOUT ME',
      year: 'Since 2023',
      motto: 'complex → simple • product designer •',
      facts: [
        { k: 'Role', v: 'Product Designer — UI/UX' },
        { k: 'Now', v: 'UI/UX Team Lead at Serajj' },
        { k: 'Based', v: 'Cairo · Riyadh · Remote' },
        { k: 'Teams', v: '9 in Egypt & Saudi Arabia' },
        { k: 'Projects', v: '20+ designed · 60 on Behance' },
        { k: 'Languages', v: 'Arabic native · English professional' },
      ],
    },
    felt: {
      word: 'EXPERIENCE',
      name: 'Sep 2023 — Now · 9 teams',
      facts: [
        { k: 'Jun 2026 — Now', v: 'Serajj · UI/UX Team Lead · Riyadh', icon: '/cv/badges/01.webp' },
        { k: 'May — Jun 2026', v: 'EYouth · UI/UX Instructor at DECI', icon: '/cv/badges/02.webp' },
        { k: 'Jan — Jun 2026', v: 'Moharb · UI/UX Designer', icon: '/cv/badges/03.webp' },
        {
          k: 'Oct 2024 — Jun 2026',
          v: 'Bitwise Solutions · UI/UX Designer',
          icon: '/cv/badges/04.webp',
        },
        {
          k: 'Aug — Nov 2025',
          v: 'Virtual Dimensions · UI/UX · Jeddah',
          icon: '/cv/badges/05.webp',
        },
        { k: 'Apr — Nov 2025', v: 'TAR · In-house UI Designer', icon: '/cv/badges/06.webp' },
        {
          k: 'Apr — Jul 2025',
          v: 'Arkaan Al Motamer · UI/UX Consultant',
          icon: '/cv/badges/07.webp',
        },
        { k: 'Sep 2024 — Apr 2025', v: 'TeraVerse · UI/UX Designer', icon: '/cv/badges/08.webp' },
        { k: 'Sep — Nov 2023', v: 'MYM · UI/UX Designer, intern', icon: '/cv/badges/09.webp' },
      ],
    },
    bubble: {
      word: 'WHAT I DO',
      discipline: 'Services',
      year: 'Web · Stores · Apps',
      // `Cv` stamps each fact with its count of shipped projects (`serviceProof`).
      facts: [
        {
          k: 'Websites & company sites',
          v: 'TruePath · Via · Vlora · Nile Soul',
          icon: '/cv/services/01.webp',
        },
        { k: 'Platforms & SaaS', v: 'GoLynk · Nokhbat Almabani', icon: '/cv/services/02.webp' },
        {
          k: 'Online stores',
          v: 'Salla · Zid · Shopify: Mahsoul, Battal, Dragon',
          icon: '/cv/services/03.webp',
        },
        {
          k: 'Store themes',
          v: 'Salla themes with demos: Qimmah, Tamim, Ra7a',
          icon: '/cv/services/04.webp',
        },
        { k: 'Mobile apps', v: 'iOS & Android UI/UX that scales', icon: '/cv/services/05.webp' },
        {
          k: 'Design systems & support',
          v: 'Bilingual systems, edits and upkeep',
          icon: '/cv/services/06.webp',
        },
      ],
    },
    script: {
      word: 'How I think',
      name: 'Osama',
      discipline: 'Understand · Simplify · Systems · Experience',
      year: '04',
      facts: [
        { k: 'Understand', v: 'The problem before the interface' },
        { k: 'Simplify', v: 'Complexity into a clear, easy flow' },
        { k: 'Systems', v: 'One consistent product that scales' },
        { k: 'Experience', v: 'Interactions, not just screens' },
      ],
    },
    stretch: {
      word: 'ENGINEER',
      name: 'Computer Engineering',
      discipline: 'Port Said University · 2018 — 2023',
      year: 'B.Sc.',
      facts: [
        { k: 'Degree', v: 'B.Sc. Computer Engineering' },
        { k: 'University', v: 'Port Said University' },
        { k: 'Years', v: '2018 — 2023' },
        { k: 'Graduation project', v: 'Excellent' },
        { k: 'Technical', v: 'HTML · CSS · Sass · JavaScript' },
        { k: 'Also', v: 'Python · C++ · React basics' },
      ],
    },
    vector: {
      word: 'UX DESIGN',
      kicker: 'Certified in',
      roles: ['Google UX Design', 'Graphic Design', 'Figma Like a Pro', 'ITI UI & UX'],
      facts: [
        { k: 'Coursera · Dec 2023', v: 'Graphic Design' },
        { k: 'Coursera · Jul 2023', v: 'Google UX Design Certificate' },
        { k: 'Udemy · Sep 2022', v: 'Learn Figma Like a Pro, UI/UX' },
        { k: 'ITI · Jul 2022', v: 'Fundamental UI & UX Design' },
        { k: 'Chosen for', v: 'Teaching UI/UX at DECI' },
      ],
    },
    cutout: {
      word: 'RESUME',
      tagline: 'Download the full CV',
      handle: 'Product Designer · Arabic / English',
      facts: [
        { k: 'Tools', v: 'Figma · Adobe XD · Framer · Canva' },
        { k: 'Teamwork', v: 'Notion · Miro · ClickUp · Slack' },
        { k: 'Craft', v: 'Research · IA · Flows · Prototypes' },
        { k: 'Strengths', v: 'Critique · Presenting · Detail' },
      ],
    },
  } satisfies RemixSlides,
  labels: {
    sticker: 'About',
    felt: 'Experience',
    bubble: 'Services',
    script: 'Process',
    stretch: 'Education',
    vector: 'Certificates',
    cutout: 'Résumé',
  } satisfies RemixLabelMap,
  // Stickers laid out per take, in each one's free corners (the About take has its own four).
  // The last four takes stay clean until their image stickers arrive.
  decals: {
    felt: [
      { kind: 'star', x: 22, y: 40, rot: -12, mx: 14, my: 62 },
      { kind: 'heart', x: 79, y: 40, rot: 10, mx: 86, my: 62 },
      { kind: 'hi', x: 86, y: 84, rot: -8 },
      {
        kind: 'image',
        src: '/cv/stickers/briefcase.webp',
        x: 11,
        y: 78,
        rot: -8,
        size: 1.1,
        mx: 22,
        my: 76,
      },
      {
        kind: 'image',
        src: '/cv/stickers/luggage-tag.webp',
        x: 27,
        y: 74,
        rot: -14,
        size: 0.8,
        mx: 46,
        my: 66,
      },
      {
        kind: 'image',
        src: '/cv/stickers/paper-plane.webp',
        x: 68,
        y: 74,
        rot: 8,
        size: 1.1,
        mx: 70,
        my: 71,
      },
    ],
    bubble: [
      { kind: 'flower', x: 10, y: 64, rot: -10, mx: 14, my: 24 },
      { kind: 'bolt', x: 88, y: 60, rot: 12, mx: 86, my: 26 },
    ],
  } satisfies { [K in RemixTake]?: RemixDecal[] },
  // The work groups each Services fact counts, in fact order; null shows no count.
  serviceProof: [
    { groups: ['websites', 'company'], unit: 'shipped' },
    { groups: ['platforms'], unit: 'shipped' },
    { groups: ['stores'], unit: 'stores' },
    { groups: ['themes'], unit: 'themes' },
    null,
    null,
  ] as const,
  // The PDF lives at public/cv/osama-abdelnaser-cv.pdf.
  cta: {
    href: '/cv/osama-abdelnaser-cv.pdf',
    label: 'Download',
    kicker: 'Résumé',
    note: 'PDF · English',
    download: true,
  },
};
