import projects from './work-projects.json';
import type { WorkProject } from '@/types/work';
import { workGroupRank as rank } from './work-groups';

// Osama's projects from `Osama_Portfolio_Projects_EN.md` (Notion, Behance, Drive and the
// CV), grouped by kind and newest first within each group. Projects without images or
// without a confirmed name are left out.
export const workProjects: readonly WorkProject[] = [...(projects as WorkProject[])].sort(
  (a, b) => rank(a.category) - rank(b.category),
);
