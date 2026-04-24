'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  emptyText?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPrev?: () => void;
    onNext?: () => void;
  };
  rowKey: (row: T) => string | number;
}

export default function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = '暂无数据',
  pagination,
}: AdminDataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="group transition hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 align-middle ${column.className ?? ''}`}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
          <span className="text-xs text-slate-500">
            显示 {rows.length === 0 ? 0 : 1} 到 {rows.length} 条，共 {pagination.totalItems.toLocaleString()} 条记录
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={pagination.onPrev}
              disabled={pagination.currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white">
              {pagination.currentPage}
            </span>
            <button
              onClick={pagination.onNext}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
