'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type TaskListItem, type TaskSummary } from '@/lib/api/admin';

const EMPTY_SUMMARY: TaskSummary = {
  pending: 0,
  processing: 0,
  completed: 0,
  failed: 0,
};

// Task type display mapping
const TASK_TYPE_LABELS: Record<TaskListItem['type'], string> = {
  RESUME_PARSE: '简历 AI 解析',
  JOB_MATCH: '职位语义分析',
  IMPORT: '批量导入',
};

// Status display mapping
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

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="task-monitor" />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-surface">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">任务监控</h2>
                <p className="text-on-surface-variant font-body text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                  AI 处理引擎实时监控中
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void load()}
                  className="px-5 py-2.5 rounded-lg bg-surface-container-highest text-primary font-semibold text-sm transition-all hover:bg-surface-tint/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  刷新数据
                </button>
                <button
                  onClick={() => void retryBatch()}
                  disabled={selected.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  批量重试
                </button>
              </div>
            </div>

            {/* Status Bento Grid */}
            <div className="grid grid-cols-4 gap-6">
              {/* Pending */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-surface-variant font-medium">待处理</span>
                  <span className="material-symbols-outlined text-outline">pending_actions</span>
                </div>
                <div className="text-4xl font-headline font-bold text-on-surface">{summary.pending}</div>
              </div>
              {/* Processing */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary font-medium">处理中</span>
                  <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                </div>
                <div className="text-4xl font-headline font-bold text-primary">{summary.processing}</div>
              </div>
              {/* Success (Highlight) */}
              <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between col-span-1 relative overflow-hidden">
                {/* Decorative gradient blob */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-on-surface font-medium">成功</span>
                  <span className="material-symbols-outlined text-secondary-container">check_circle</span>
                </div>
                <div className="text-4xl font-headline font-bold text-on-surface relative z-10">{summary.completed.toLocaleString()}</div>
              </div>
              {/* Failed (Critical) */}
              <div className="bg-error-container p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-error-container font-medium">失败</span>
                  <span className="material-symbols-outlined text-error icon-fill">error</span>
                </div>
                <div className="text-4xl font-headline font-bold text-error">{summary.failed}</div>
              </div>
            </div>

            {/* Task List Section */}
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4">最近运行任务</h3>

              {loading && (
                <div className="flex items-center justify-center py-16">
                  <span className="material-symbols-outlined text-primary animate-spin text-4xl">sync</span>
                  <span className="ml-4 text-on-surface-variant">加载中...</span>
                </div>
              )}

              {!loading && error && (
                <div className="bg-error-container/20 p-6 rounded-xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-error icon-fill">error</span>
                  <p className="text-on-error-container">{error}</p>
                </div>
              )}

              {!loading && !error && list.length === 0 && (
                <div className="bg-surface-container-lowest p-12 rounded-xl flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-outline text-5xl">inbox</span>
                  <p className="text-on-surface-variant">暂无任务数据</p>
                </div>
              )}

              {!loading && !error && list.length > 0 && (
                <div className="flex flex-col gap-3">
                  {list.map((item) => {
                    const isFailed = item.status === 'FAILED';
                    const isProcessing = item.status === 'PROCESSING';
                    const isCompleted = item.status === 'COMPLETED';
                    const isQueued = item.status === 'QUEUED';
                    const isSelected = selectedSet.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`
                          p-5 rounded-xl flex items-start gap-4 transition-all
                          ${isFailed ? 'bg-error-container/20 hover:bg-error-container/30' : 'bg-surface-container-lowest hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]'}
                          ${isSelected ? 'ring-2 ring-primary' : ''}
                        `}
                      >
                        {/* Checkbox */}
                        <div className="mt-1 flex items-center">
                          <input
                            type="checkbox"
                            aria-label={`select-${item.id}`}
                            checked={isSelected}
                            onChange={() => toggle(item.id)}
                            className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                          />
                        </div>

                        {/* Status Icon */}
                        <div>
                          {isFailed && <span className="material-symbols-outlined text-error icon-fill">warning</span>}
                          {isProcessing && <span className="material-symbols-outlined text-primary animate-spin">sync</span>}
                          {(isCompleted || isQueued) && <span className="material-symbols-outlined text-tertiary">check_circle</span>}
                        </div>

                        {/* Task Details Grid */}
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <span className="text-xs text-on-surface-variant block mb-1">任务 ID</span>
                            <span className={`font-mono text-sm font-semibold ${isFailed ? 'text-on-error-container' : 'text-on-surface'}`}>
                              TSK-{item.id.toString().padStart(5, '0')}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs text-on-surface-variant block mb-1">任务类型</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isCompleted
                                  ? 'bg-surface-variant text-on-surface-variant'
                                  : 'bg-primary-fixed text-on-primary-fixed'
                              }`}
                            >
                              {TASK_TYPE_LABELS[item.type]}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs text-on-surface-variant block mb-1">任务状态</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isFailed
                                  ? 'bg-error text-on-error'
                                  : isProcessing
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-secondary-container text-on-secondary-container'
                              }`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs text-on-surface-variant block mb-1">进度</span>
                            <div className="text-sm text-on-surface">
                              {item.successCount + item.failCount} / {item.total}
                            </div>
                          </div>
                          <div className="col-span-4 text-right">
                            {isFailed && (
                              <button
                                onClick={() => void retryOne(item.id)}
                                className="text-sm font-semibold text-primary hover:text-primary-container mr-4 transition-colors"
                              >
                                立即重试
                              </button>
                            )}
                            {isProcessing && (
                              <span className="text-sm font-medium text-outline mr-4">处理中...</span>
                            )}
                            <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                              查看详情
                            </button>
                          </div>

                          {/* Error Log Sub-row (only for failed tasks) */}
                          {isFailed && item.errorMessage && (
                            <div className="col-span-12 mt-2 pt-2 flex items-start gap-2">
                              <span className="text-xs font-semibold text-error uppercase tracking-wider mt-0.5">最后失败原因:</span>
                              <p className="text-sm text-on-error-container/80 font-mono bg-error-container/50 px-3 py-1.5 rounded-md flex-1 truncate" title={item.errorMessage}>
                                {item.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
