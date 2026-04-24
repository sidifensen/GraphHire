'use client';

import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  subLabel?: string;
  subValue?: string;
}

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  subLabel,
  subValue,
}: AdminStatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof trend === 'number' ? (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={`inline-flex items-center gap-0.5 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend > 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          <span className="text-slate-500">较上月</span>
        </div>
      ) : null}

      {subLabel && subValue ? (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">{subLabel}</span>
          <span className="font-semibold text-slate-700">{subValue}</span>
        </div>
      ) : null}
    </article>
  );
}
