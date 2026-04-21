'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type AdminDashboardStats } from '@/lib/api/admin';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    adminApi
      .getDashboardStats()
      .then((data) => {
        if (!mounted) return;
        setStats(data);
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
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="dashboard" />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-surface space-y-4">
          <h1 className="text-2xl font-bold">数据总览</h1>

          {loading && <p>加载中...</p>}
          {!loading && error && <p>{error}</p>}

          {!loading && !error && stats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>用户总数</p>
                  <p>{stats.totalUsers}</p>
                </div>
                <div>
                  <p>企业总数</p>
                  <p>{stats.totalCompanies}</p>
                </div>
                <div>
                  <p>简历总数</p>
                  <p>{stats.totalResumes}</p>
                </div>
                <div>
                  <p>在招职位</p>
                  <p>{stats.totalJobs}</p>
                </div>
              </div>

              <div>
                <p>任务成功率</p>
                <p>{stats.taskSuccessRate}%</p>
              </div>

              {stats.trend.length === 0 ? (
                <p>暂无趋势数据</p>
              ) : (
                <ul>
                  {stats.trend.map((point) => (
                    <li key={point.date}>{point.date}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
