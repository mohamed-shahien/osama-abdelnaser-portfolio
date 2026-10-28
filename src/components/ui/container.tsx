import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export function Container({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('mx-auto w-full max-w-site px-6 md:px-10', className)} {...props} />;
}
