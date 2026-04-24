'use client';

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'indigo' | 'purple' | 'amber';
  subValue?: string;
  subLabel?: string;
}

export default function AdminStatCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  variant = 'primary',
  subValue,
  subLabel,
}: AdminStatCardProps) {
  const variants = {
    primary: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    secondary: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-outline-variant/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-soft dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-outline">{title}</p>
          <h3 className="font-display text-3xl font-bold">{value}</h3>
        </div>
        <div className={cn('rounded-lg p-2 transition-transform group-hover:scale-110', variants[variant])}>
          <Icon size={24} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center text-xs">
          <span className={cn('flex items-center gap-0.5 font-bold', trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span className="ml-2 text-outline">{trendLabel}</span>
        </div>

        {subValue ? (
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-white/5">
            <span className="text-slate-500">{subLabel}</span>
            <span className={cn('font-medium', variant === 'primary' ? 'text-slate-700 dark:text-slate-300' : 'text-amber-600 dark:text-amber-400')}>
              {subValue}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-current opacity-30 transition-transform duration-300 group-hover:scale-x-100',
          variants[variant].split(' ')[1]
        )}
      />
    </div>
  );
}
