'use client';

import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Filter, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';
import { adminApi, type TaskListItem, type TaskSummary } from '@/lib/api/admin';

interface TaskRow {
  id: number;
  taskCode: string;
  type: string;
  retries: number;
  lastTime: string;
  status: '处理中' | '失败' | '成功' | '待处理';
}

function mapTaskTypeLabel(type: TaskListItem['type']): string {
  if (type === 'RESUME_PARSE') {
    return '简历解析';
  }
  if (type === 'JOB_MATCH') {
    return '图谱匹配';
  }
  return '导入任务';
}

function mapTaskStatusLabel(status: TaskListItem['status']): TaskRow['status'] {
  if (status === 'PROCESSING') {
    return '处理中';
  }
  if (status === 'FAILED') {
    return '失败';
  }
  if (status === 'COMPLETED') {
    return '成功';
  }
  return '待处理';
}

function pickLastTime(item: TaskListItem): string {
  return item.completedAt || item.startedAt || item.createdAt || '-';
}

export default function AdminTaskMonitorPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [page] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<TaskSummary>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const totalPages = useMemo(() => {
    if (total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTaskList({
        status: status || undefined,
        type: type || undefined,
        page,
        pageSize,
      });
      setSummary(response.summary);
      setTotal(response.total ?? 0);
      setTasks(
        (response.list ?? []).map((item) => ({
          id: item.id,
          taskCode: `TSK-${item.id}`,
          type: mapTaskTypeLabel(item.type),
          retries: item.failCount ?? 0,
          lastTime: pickLastTime(item),
          status: mapTaskStatusLabel(item.status),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async (task: TaskRow) => {
    if (task.status === '处理中') {
      return;
    }
    await adminApi.retryTask(task.id);
    await loadTasks();
  };

  const handleFilter = async () => {
    await loadTasks();
  };

  const handleRefresh = async () => {
    await loadTasks();
  };

  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold">任务监控</h2>
          <p className="mt-1 text-sm text-outline">实时追踪系统级数据处理任务的执行状态</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { label: '待处理', value: summary.pending, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: '处理中', value: summary.processing, icon: RefreshCw, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/20', animate: 'animate-spin' },
            { label: '成功 (24h)', value: summary.completed.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: '失败', value: summary.failed, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/30' },
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
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mr-2 rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-bold text-on-surface dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="">全部状态</option>
                  <option value="QUEUED">待处理</option>
                  <option value="PROCESSING">处理中</option>
                  <option value="COMPLETED">成功</option>
                  <option value="FAILED">失败</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mr-2 rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-bold text-on-surface dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="">全部类型</option>
                  <option value="RESUME_PARSE">简历解析</option>
                  <option value="JOB_MATCH">图谱匹配</option>
                  <option value="IMPORT">导入任务</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => void handleFilter()}
                className="flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Filter size={14} className="mr-1.5" /> 筛选
              </button>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <RotateCcw size={14} className="mr-1.5" /> 刷新
              </button>
            </div>
          </div>

          <AdminDataTable
            data={tasks}
            pagination={{ currentPage: page, totalPages, totalItems: total }}
            columns={[
              { header: '任务ID', accessor: (task) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{task.taskCode}</span> },
              { header: '任务类型', accessor: (task) => <span className="text-sm text-on-surface">{task.type}</span> },
              { header: '重试次数', accessor: (task) => <span className="inline-block min-w-16 text-center text-sm text-outline">{task.retries}</span> },
              { header: '最后执行时间', accessor: (task) => <span className="font-display text-xs text-slate-600 dark:text-slate-300">{task.lastTime}</span> },
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
                    type="button"
                    onClick={() => void handleRetry(task)}
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
          {loading ? <p className="px-6 pb-4 text-xs text-outline">加载中...</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}
