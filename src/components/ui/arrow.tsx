import { cn } from '@/lib/utils';

const turn = {
  right: '',
  'up-right': '-rotate-45',
  down: 'rotate-90',
  left: 'rotate-180',
} as const;

/**
 * The site's one arrow: a bold, round-capped stroke that takes the text color
 * and sits on the text line at 1em. `both` draws a two-way arrow.
 */
export function Arrow({
  dir = 'up-right',
  className,
}: {
  dir?: keyof typeof turn | 'both';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'inline-block size-[1em] shrink-0 align-[-0.14em]',
        dir === 'both' ? '' : turn[dir],
        className,
      )}
    >
      {dir === 'both' ? (
        <path d="M4.5 12h15M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" />
      ) : (
        <path d="M5 12h13.5M13 6.5l5.5 5.5-5.5 5.5" />
      )}
    </svg>
  );
}
