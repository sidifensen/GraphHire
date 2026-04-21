'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type SkillTagItem } from '@/lib/api/admin';

export default function AdminSkillTagsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<SkillTagItem[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    adminApi
      .getSkillList({ page: 1, pageSize: 10 })
      .then((res) => {
        if (!mounted) return;
        setList(res.list);
      })
      .catch(() => {
        if (!mounted) return;
        setError('加载失败，请重试');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <AdminSidebar activeItem="skill-tags" />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <AdminHeader />
        <main className="flex-1 p-8 space-y-4">
          <h2 className="text-2xl font-bold">认知图谱与标签治理</h2>

          {loading && <p>加载中...</p>}
          {!loading && error && <p>{error}</p>}

          {!loading && !error && (
            <div className="space-y-2">
              {list.map((item) => (
                <div key={item.id} className="border rounded p-3">
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>{item.jobCount}</p>
                </div>
              ))}
              {list.length === 0 && <p>暂无数据</p>}
            </div>
          )}

          <aside>
            <h3>图谱健康度</h3>
            <p>暂无数据</p>
          </aside>
        </main>
      </div>
    </div>
  );
}
