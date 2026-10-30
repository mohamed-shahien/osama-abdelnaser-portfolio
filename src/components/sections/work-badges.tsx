import { workBadges } from '@/content/work-groups';
import { cn } from '@/lib/utils';
import type { WorkProject } from '@/types/work';

/**
 * A project's support checks: what it was built for, ticked when included and
 * struck through when not, so a client sees both at a glance.
 */
export function WorkBadges({
  project,
  size = 'sm',
  className,
}: {
  project: Pick<WorkProject, 'support' | 'liveUrl'>;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  return (
    <ul className={cn('flex list-none flex-wrap gap-1.5 p-0', className)} aria-label="Support">
      {workBadges(project).map((badge) => (
        <li
          key={badge.id}
          className={cn(
            'flex items-center gap-1.5 rounded-full ps-1 pe-2.5 leading-none',
            size === 'xs' ? 'py-[3px] text-xs' : 'py-1 text-xs',
            badge.on && badge.id === 'rtl' && 'bg-secondary text-ink',
            badge.on && badge.id === 'live' && 'bg-ink text-white',
            badge.on &&
              (badge.id === 'desktop' || badge.id === 'mobile') &&
              'bg-primary/12 text-ink',
            !badge.on && 'text-ink/70 [box-shadow:inset_0_0_0_1px_#17284f2e]',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid shrink-0 place-items-center rounded-full',
              size === 'xs' ? 'size-[13px]' : 'size-[15px]',
              badge.on ? 'bg-ink text-secondary' : 'bg-ink/8 text-ink/70',
              badge.on && badge.id === 'live' && 'bg-[#3ddc84] text-ink',
            )}
          >
            <svg
              viewBox="0 0 12 12"
              className="size-[8px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {badge.on ? <path d="M2.5 6.2 5 8.5l4.5-5" /> : <path d="M3 6h6" />}
            </svg>
          </span>
          <span className={cn(!badge.on && 'line-through decoration-ink/40')}>{badge.label}</span>
          <span className="sr-only">{badge.on ? ', included' : ', not included'}</span>
        </li>
      ))}
    </ul>
  );
}
