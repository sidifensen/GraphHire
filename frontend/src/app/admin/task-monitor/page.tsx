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
      const res = await adminApi.getTaskList({ page: 1, pageSize: 10 });
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
    await adminApi.retryTask(id);
  };

  const retryBatch = async () => {
    if (selected.length === 0) return;
    await adminApi.batchRetryTasks({ taskIds: selected });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="task-monitor" />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-surface space-y-4">
          <h2 className="text-2xl font-bold">任务监控</h2>

          <div className="flex gap-2">
            <button onClick={() => void load()}>刷新数据</button>
            <button onClick={retryBatch}>批量重试</button>
          </div>

          {loading && <p>加载中...</p>}
          {!loading && error && <p>{error}</p>}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-4 gap-2">
                <div>{summary.pending}</div>
                <div>{summary.processing}</div>
                <div>{summary.completed}</div>
                <div>失败:{summary.failed}</div>
              </div>

              <div className="space-y-2">
                {list.map((item) => (
                  <div key={item.id} className="border rounded p-3 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label={`select-${item.id}`}
                        checked={selectedSet.has(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <div>
                        <p>{item.id}</p>
                        <p>{item.type}</p>
                      </div>
                    </div>
                    <button aria-label={`重试-${item.id}`} onClick={() => retryOne(item.id)}>
                      重试
                    </button>
                  </div>
                ))}

                {list.length === 0 && <p>暂无数据</p>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
