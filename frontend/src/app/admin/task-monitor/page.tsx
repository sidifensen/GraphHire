'use client';

import { RotateCcw, Filter, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  type: string;
  retries: number;
  lastTime: string;
  status: '处理中' | '失败' | '成功' | '待处理';
}

const mockTasks: Task[] = [
  { id: 'TSK-8922-A1', type: '简历解析', retries: 0, lastTime: '2023-10-27 14:32:10', status: '处理中' },
  { id: 'TSK-8921-B4', type: '图谱匹配', retries: 3, lastTime: '2023-10-27 14:30:05', status: '失败' },
  { id: 'TSK-8920-C9', type: '职位解析', retries: 1, lastTime: '2023-10-27 14:28:44', status: '成功' },
  { id: 'TSK-8919-A1', type: '简历解析', retries: 0, lastTime: '-', status: '待处理' },
  { id: 'TSK-8918-B2', type: '图谱匹配', retries: 5, lastTime: '2023-10-27 14:15:22', status: '失败' },
];

export default function AdminTaskMonitorPage() {
  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold">任务监控</h2>
          <p className="mt-1 text-sm text-outline">实时追踪系统级数据处理任务的执行状态</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { label: '待处理', value: 124, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: '处理中', value: 38, icon: RefreshCw, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/20', animate: 'animate-spin' },
            { label: '成功 (24h)', value: '8,402', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: '失败', value: 12, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/30' },
          ].map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-all hover:scale-[1.02] dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl',
                item.border
              )}
            >
              <div>
                <p className="mb-2 text-xs font-medium text-outline">{item.label}</p>
                <p className={cn('font-display text-3xl font-bold', item.color)}>{item.value}</p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-full opacity-80', item.bg, item.color)}>
                <item.icon size={26} className={item.animate} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-outline-variant bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-black/20">
            <h3 className="text-sm font-bold opacity-80">最近任务队列</h3>
            <div className="flex gap-2">
              <button className="flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Filter size={14} className="mr-1.5" /> 筛选
              </button>
              <button className="flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
                <RotateCcw size={14} className="mr-1.5" /> 刷新
              </button>
            </div>
          </div>

          <AdminDataTable
            data={mockTasks}
            pagination={{ currentPage: 1, totalPages: 35, totalItems: 174 }}
            columns={[
              { header: '任务ID', accessor: 'id', className: 'font-mono text-xs font-bold text-slate-700 dark:text-slate-300' },
              { header: '任务类型', accessor: 'type', className: 'text-sm text-on-surface' },
              { header: '重试次数', accessor: 'retries', className: 'w-16 text-center text-sm text-outline' },
              { header: '最后执行时间', accessor: (task) => <span className="font-display text-xs text-outline-variant">{task.lastTime}</span> },
              {
                header: '状态',
                accessor: (task) => (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset',
                      task.status === '处理中'
                        ? 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900/30'
                        : task.status === '失败'
                          ? 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-900/30'
                          : task.status === '成功'
                            ? 'bg-slate-50 text-slate-500 ring-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
                            : 'bg-slate-50 text-slate-400 ring-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700'
                    )}
                  >
                    {task.status === '处理中' ? <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" /> : null}
                    {task.status}
                  </span>
                ),
              },
              {
                header: '操作',
                className: 'text-right',
                accessor: (task) => (
                  <button
                    disabled={task.status === '处理中'}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-bold transition-all',
                      task.status === '失败' ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-outline-variant text-slate-400 disabled:opacity-40 dark:border-slate-800'
                    )}
                  >
                    重试
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </AdminShell>
  );
}
