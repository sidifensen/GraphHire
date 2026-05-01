'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import AdminPagination from './AdminPagination';

interface Column<T> {
  header: ReactNode;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

export default function AdminDataTable<T>({ columns, data, className, pagination }: AdminDataTableProps<T>) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl',
        className
      )}
    >
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
          <tbody className="divide-y divide-outline-variant/30 dark:divide-white/10">
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
            显示 {(pagination.currentPage - 1) * pagination.pageSize + (pagination.totalItems > 0 ? 1 : 0)} 到{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} 条，共 {pagination.totalItems.toLocaleString()} 条记录
          </span>
          <AdminPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={pagination.onPageChange} />
        </div>
      ) : null}
    </div>
  );
}
