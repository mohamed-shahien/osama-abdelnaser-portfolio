import { workProjects } from './work';
import { workGroupOf, workGroups } from './work-groups';

export const playgroundIntro =
  'Every project in one place: websites, company sites, platforms, Salla and Zid stores, and store themes. Filter by kind and open any of them.';

export const playgroundFilters = [
  { id: 'all', label: 'All', count: workProjects.length },
  ...workGroups
    .map((group) => ({
      id: group.id,
      label: group.label,
      count: workProjects.filter((project) => workGroupOf(project) === group.id).length,
    }))
    .filter((group) => group.count > 0),
];
