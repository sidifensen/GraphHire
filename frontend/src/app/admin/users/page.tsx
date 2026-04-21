'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type UserItem } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUserList({ page: 1, pageSize: 10 });
      setList(res.list);
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

  const disableOne = async (user: UserItem) => {
    if (user.status === 'DISABLED') {
      await adminApi.updateUserStatus(user.id, 'ACTIVE');
      return;
    }
    await adminApi.updateUserStatus(user.id, 'DISABLED');
  };

  const batchDisable = async () => {
    if (selected.length === 0) return;
    await adminApi.batchDisableUsers({ userIds: selected });
  };

  return (
    <div className="ml-64 flex flex-col min-h-screen">
      <AdminSidebar activeItem="users" />
      <div className="flex flex-col min-h-screen">
        <AdminHeader />
        <main className="p-8 space-y-4">
          <h2 className="text-2xl font-bold">用户治理与分析</h2>

          <div className="flex gap-2">
            <button onClick={batchDisable}>批量禁用</button>
            <button disabled>批量导出（暂未开放）</button>
          </div>

          {loading && <p>加载中...</p>}
          {!loading && error && <p>{error}</p>}

          {!loading && !error && (
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
                      <p>{item.username}</p>
                      <p>{item.email}</p>
                    </div>
                  </div>
                  <button onClick={() => disableOne(item)}>{item.status === 'DISABLED' ? '启用' : '禁用'}</button>
                </div>
              ))}
              {list.length === 0 && <p>暂无数据</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
