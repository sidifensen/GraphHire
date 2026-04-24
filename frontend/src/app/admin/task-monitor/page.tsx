'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
import { adminApi, type TaskListItem, type TaskSummary } from '@/lib/api/admin';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable, { type AdminDataTableColumn } from '@/components/admin/AdminDataTable';

const EMPTY_SUMMARY: TaskSummary = {
  pending: 0,
  processing: 0,
  completed: 0,
  failed: 0,
};

const TASK_TYPE_LABELS: Record<TaskListItem['type'], string> = {
  RESUME_PARSE: '简历解析',
  JOB_MATCH: '图谱匹配',
  IMPORT: '批量导入',
};

const STATUS_LABELS: Record<TaskListItem['status'], string> = {
  QUEUED: '待处理',
  PROCESSING: '处理中',
  COMPLETED: '成功',
  FAILED: '失败',
};

export default function AdminTaskMonitorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TaskSummary>(EMPTY_SUMMARY);
  const [list, setList] = useState<TaskListItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTaskList({ page: 1, pageSize: 20 });
      setSummary(res.summary ?? EMPTY_SUMMARY);
      setList(res.list ?? []);
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const retryOne = async (id: number) => {
    try {
      await adminApi.retryTask(id);
      await load();
    } catch {
      setError('重试失败，请重试');
    }
  };

  const retryBatch = async () => {
    if (selected.length === 0) return;
    try {
      await adminApi.batchRetryTasks({ taskIds: selected });
      setSelected([]);
      await load();
    } catch {
      setError('批量重试失败，请重试');
    }
  };

  const columns: AdminDataTableColumn<TaskListItem>[] = [
    {
      key: 'select',
      header: '选择',
      className: 'w-16',
      render: (item) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedSet.has(item.id)}
            onChange={() => toggle(item.id)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </div>
      ),
    },
    {
      key: 'id',
      header: '任务ID',
      render: (item) => <span className="font-mono text-xs font-semibold text-slate-700">TSK-{item.id.toString().padStart(5, '0')}</span>,
    },
    {
      key: 'type',
      header: '任务类型',
      render: (item) => <span className="text-sm text-slate-700">{TASK_TYPE_LABELS[item.type]}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (item) => {
        const cls =
          item.status === 'FAILED'
            ? 'bg-rose-100 text-rose-700'
            : item.status === 'PROCESSING'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-700';
        return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{STATUS_LABELS[item.status]}</span>;
      },
    },
    {
      key: 'progress',
      header: '进度',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {item.successCount + item.failCount} / {item.total}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: (item) =>
        item.status === 'FAILED' ? (
          <button onClick={() => void retryOne(item.id)} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            重试
          </button>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
  ];

  return (
    <AdminShell activeItem="task-monitor">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">任务监控</h1>
            <p className="mt-1 text-sm text-slate-500">实时追踪系统级数据处理任务的执行状态</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => void load()}>
              <RotateCcw className="h-4 w-4" />
              刷新
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              onClick={() => void retryBatch()}
              disabled={selected.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
              批量重试
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">待处理</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{summary.pending}</p>
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">处理中</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-700">{summary.processing}</p>
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">成功</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-emerald-700">{summary.completed}</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">失败</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-rose-700">{summary.failed}</p>
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
          </article>
        </section>

        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <AdminDataTable columns={columns} rows={list} rowKey={(row) => row.id} emptyText={loading ? '加载中...' : '暂无任务数据'} />
      </div>
    </AdminShell>
  );
}
