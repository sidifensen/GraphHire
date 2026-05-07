'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(({ className, ...props }, ref) => {
  return <label ref={ref} className={cn('text-sm font-medium text-on-surface', className)} {...props} />;
});

Label.displayName = 'Label';

export { Label };
