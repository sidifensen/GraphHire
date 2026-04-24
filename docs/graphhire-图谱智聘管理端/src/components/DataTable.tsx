import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function DataTable<T>({ columns, data, pagination }: DataTableProps<T>) {
  return (
    <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl rounded-xl border border-outline-variant/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-outline-variant/50 dark:border-white/10">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {data.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn("px-6 py-4", col.className)}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-outline-variant/50 dark:border-white/10 flex items-center justify-between bg-white dark:bg-transparent">
          <span className="text-xs font-medium text-outline">
            显示 1 到 {data.length} 条，共 {pagination.totalItems.toLocaleString()} 条记录
          </span>
          <div className="flex items-center space-x-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-slate-100 transition-colors disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold font-display">
              {pagination.currentPage}
            </button>
            {[...Array(2)].map((_, i) => (
              <button key={i} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface hover:bg-slate-100 text-xs font-medium font-display transition-colors">
                {pagination.currentPage + i + 1}
              </button>
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-outline text-xs">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-slate-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
