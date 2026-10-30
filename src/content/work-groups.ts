import type { WorkProject } from '@/types/work';

/** The kinds of work, in the order they are shown: sites first, store themes last. */
export const workGroups = [
  {
    id: 'websites',
    label: 'Websites',
    categories: ['Website / Landing Page', 'Personal Website (Portfolio)'],
  },
  { id: 'company', label: 'Company sites', categories: ['Corporate Website'] },
  { id: 'platforms', label: 'Platforms & apps', categories: ['Web Platform', 'SaaS Platform'] },
  {
    id: 'stores',
    label: 'Online stores',
    categories: ['Salla Store', 'Zid Store', 'Shopify Store'],
  },
  {
    id: 'themes',
    label: 'Store themes',
    categories: ['Salla Theme', 'Salla Theme (Demo)', 'Store Theme (Salla + Zid)'],
  },
] as const;

export type WorkGroupId = (typeof workGroups)[number]['id'];

export const workGroupRank = (category: string) => {
  const index = workGroups.findIndex((group) =>
    (group.categories as readonly string[]).includes(category),
  );
  return index < 0 ? workGroups.length : index;
};

/** The group a project belongs to; unknown kinds fall in with the stores. */
export const workGroupOf = (project: Pick<WorkProject, 'category'>): WorkGroupId =>
  workGroups[workGroupRank(project.category)]?.id ?? 'stores';

export type WorkBadge = { id: 'desktop' | 'mobile' | 'rtl' | 'live'; label: string; on: boolean };

/**
 * The same four checks for every project, each marked included or not. They are
 * read off the project's support line and links; nothing is assumed.
 */
export const workBadges = (
  project: Pick<WorkProject, 'support' | 'liveUrl'>,
): readonly WorkBadge[] => [
  { id: 'desktop', label: 'Desktop', on: /desktop/i.test(project.support) },
  { id: 'mobile', label: 'Mobile', on: /mobile/i.test(project.support) },
  { id: 'rtl', label: 'Arabic · RTL', on: /rtl|arabic/i.test(project.support) },
  { id: 'live', label: 'Live site', on: Boolean(project.liveUrl) },
];
