import { workProjects } from '@/content/work';
import { workContent } from '@/content/work-copy';

export function GET() {
  return Response.json({
    projects: workProjects.slice(workContent.featuredCount),
    total: workProjects.length,
  });
}
