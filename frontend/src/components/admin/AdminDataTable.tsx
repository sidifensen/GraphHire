'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function AdminDataTable<T>({ columns, data, pagination }: AdminDataTableProps<T>) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/50 bg-slate-50/50 dark:border-white/10 dark:bg-white/5">
              {columns.map((col, idx) => (
                <th key={idx} className={cn('px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-outline', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {data.map((item, rowIdx) => (
              <tr key={rowIdx} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-6 py-4', col.className)}>
                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between border-t border-outline-variant/50 bg-white px-6 py-4 dark:border-white/10 dark:bg-transparent">
          <span className="text-xs font-medium text-outline">
            显示 1 到 {data.length} 条，共 {pagination.totalItems.toLocaleString()} 条记录
          </span>
          <div className="flex items-center space-x-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-outline transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">
              <ChevronLeft size={16} />
            </button>
            <button className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {pagination.currentPage}
            </button>
            {[...Array(2)].map((_, i) => (
              <button
                key={i}
                className="font-display flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-on-surface transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {pagination.currentPage + i + 1}
              </button>
            ))}
            <span className="flex h-8 w-8 items-center justify-center text-xs text-outline">...</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-outline transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
