import * as React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HotSearchDropdownItem {
  keyword: string;
  score?: number | null;
}

interface HotSearchDropdownProps {
  open: boolean;
  loading?: boolean;
  items: HotSearchDropdownItem[];
  onSelect: (keyword: string) => void;
  className?: string;
  emptyText?: string;
}

export function HotSearchDropdown({
  open,
  loading = false,
  items,
  onSelect,
  className,
  emptyText = '暂无热门搜索',
}: HotSearchDropdownProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      data-testid="hot-search-dropdown"
      className={cn(
        'absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-surface-mid/60 bg-surface-lowest shadow-lg',
        className,
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-on-surface-variant border-b border-surface-mid/50">
        <TrendingUp size={14} className="text-primary" />
        热门搜索
      </div>

      {loading ? (
        <div className="px-3 py-3 text-sm text-on-surface-variant">加载中...</div>
      ) : items.length === 0 ? (
        <div className="px-3 py-3 text-sm text-on-surface-variant">{emptyText}</div>
      ) : (
        <div className="max-h-64 overflow-y-auto p-2">
          {items.map((item, index) => (
            <button
              key={`${item.keyword}-${index}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(item.keyword)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-on-surface hover:bg-primary/5"
            >
              <span className="truncate">{item.keyword}</span>
              <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs text-on-surface-variant">
                <Flame size={12} className="text-primary" />
                {Math.round(item.score ?? 0)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

