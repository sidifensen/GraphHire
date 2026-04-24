'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPages(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push('ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

export default function AdminPagination({ currentPage, totalPages, onPageChange }: AdminPaginationProps) {
  const normalizedCurrent = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const normalizedTotal = Math.max(totalPages, 1);
  const pages = buildPages(normalizedCurrent, normalizedTotal);

  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        aria-label="上一页"
        disabled={normalizedCurrent <= 1}
        onClick={() => onPageChange(normalizedCurrent - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-outline transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-xs text-outline">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`第 ${page} 页`}
            onClick={() => onPageChange(page)}
            className={cn(
              'font-display flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
              page === normalizedCurrent
                ? 'bg-primary font-bold text-white'
                : 'text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="下一页"
        disabled={normalizedCurrent >= normalizedTotal}
        onClick={() => onPageChange(normalizedCurrent + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-outline transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

