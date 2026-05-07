'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalendarProps = {
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
};

function getMonthDays(viewDate: Date): Array<Date | null> {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const startWeekDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startWeekDay; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function isSameDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState<Date>(selected ?? new Date());

  React.useEffect(() => {
    if (selected) {
      setViewDate(selected);
    }
  }, [selected]);

  const monthDays = React.useMemo(() => getMonthDays(viewDate), [viewDate]);
  const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
  const monthLabel = `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`;

  return (
    <div className={cn('w-[280px] rounded-xl border border-outline/20 bg-surface-lowest p-3', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-outline/20 text-on-surface-variant hover:bg-surface-low"
          aria-label="上个月"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-on-surface">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-outline/20 text-on-surface-variant hover:bg-surface-low"
          aria-label="下个月"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-on-surface-variant">
        {weekLabels.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {monthDays.map((dateCell, index) => {
          if (!dateCell) {
            return <div key={`empty-${index}`} className="h-9" />;
          }
          const active = isSameDay(dateCell, selected);
          return (
            <button
              key={dateCell.toISOString()}
              type="button"
              onClick={() => onSelect?.(dateCell)}
              className={cn(
                'h-9 rounded-md text-sm font-medium transition-colors',
                active ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-low',
              )}
            >
              {dateCell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
