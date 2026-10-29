import referenceProjects from './work-reference.json';
import type { WorkProject } from '@/types/work';

// Temporary examples explicitly requested by the user. Their author is shown in
// the gallery and detail pages; these are not Osama's claimed client projects.
export const workProjects: readonly WorkProject[] = referenceProjects;
