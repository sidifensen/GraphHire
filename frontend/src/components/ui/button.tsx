'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantClassMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-white hover:opacity-90',
  outline: 'border border-outline/30 bg-transparent text-on-surface hover:bg-surface-low',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-low',
};

const sizeClassMap: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3 text-sm',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          variantClassMap[variant],
          sizeClassMap[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
