import type { WorkGroupId } from '@/content/work-groups';

/** Each kind of work wears one brand colour, on its tab and on its cards. */
export const workGroupDot: Record<WorkGroupId | 'all', string> = {
  all: 'bg-ink',
  websites: 'bg-primary',
  company: 'bg-accent-rose',
  platforms: 'bg-accent-warm',
  stores: 'bg-secondary',
  themes: 'bg-[#9db9fd]',
};
