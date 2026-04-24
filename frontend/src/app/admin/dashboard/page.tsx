'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Download, Handshake, Info, Megaphone, Network, UserRound, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminApi, type AdminDashboardStats } from '@/lib/api/admin';
import AdminShell from '@/components/admin/AdminShell';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminStatCard from '@/components/admin/AdminStatCard';

const EMPTY_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalCompanies: 0,
  totalResumes: 0,
  totalJobs: 0,
  todayNewUsers: 0,
  todayNewJobs: 0,
  pendingCompanyAudit: 0,
  pendingTaskCount: 0,
  failedTaskCount: 0,
  matchCount: 0,
  taskSuccessRate: 0,
  weeklyNewCompanies: 0,
  pendingSkillSuggestions: 0,
  trend: [],
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats>(EMPTY_STATS);

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

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const chartData = useMemo(() => {
    const trend = stats.trend.slice(-4);
    if (trend.length === 0) {
      return [
        { name: '第一周', high: 0, success: 0 },
        { name: '第二周', high: 0, success: 0 },
        { name: '第三周', high: 0, success: 0 },
        { name: '第四周', high: 0, success: 0 },
      ];
    }
    return trend.map((item, index) => ({
      name: `第${index + 1}周`,
      high: item.activeUsers,
      success: item.newData,
    }));
  }, [stats.trend]);

  const todoItems = [
    {
      title: '待审核企业入驻',
      desc: `当前待审核 ${stats.pendingCompanyAudit} 家企业，建议优先处理高活跃行业企业。`,
      tag: `需处理: ${stats.pendingCompanyAudit}`,
    },
    {
      title: '失败解析任务预警',
      desc: `过去 24 小时失败任务 ${stats.failedTaskCount} 条，请排查任务监控日志。`,
      tag: '优先级: 高',
    },
    {
      title: '标签词库治理提醒',
      desc: `待处理技能建议 ${stats.pendingSkillSuggestions} 条，建议今日完成合并。`,
      tag: '优先级: 中',
    },
  ];

  return (
    <AdminShell activeItem="dashboard">
      <AdminTopbar />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-800">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">系统公告：知识图谱 V2.0 引擎升级将于今晚 24:00 进行，预计耗时 2 小时。</span>
          </div>
          <button className="rounded-full p-1 text-blue-500 hover:bg-blue-100">
            <Info className="h-4 w-4" />
          </button>
        </div>

        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">概览数据</h1>
            <p className="mt-1 text-sm text-slate-500">更新时间: 今日 08:00 AM</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            导出报表
          </button>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard title="总用户数" value={loading ? '-' : formatNumber(stats.totalUsers)} icon={Users} trend={12.5} subLabel="日活跃度" subValue={formatNumber(stats.todayNewUsers)} />
          <AdminStatCard title="入驻企业" value={loading ? '-' : formatNumber(stats.totalCompanies)} icon={Network} trend={5.2} subLabel="待审核企业" subValue={`${stats.pendingCompanyAudit} 家`} />
          <AdminStatCard title="简历解析数" value={loading ? '-' : formatNumber(stats.totalResumes)} icon={Activity} trend={24.1} subLabel="任务成功率" subValue={`${stats.taskSuccessRate}%`} />
          <AdminStatCard title="活跃职位数" value={loading ? '-' : formatNumber(stats.totalJobs)} icon={UserRound} trend={-1.8} subLabel="今日新增" subValue={`+${stats.todayNewJobs}`} />
          <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-lg">
            <div className="absolute -right-6 -top-6 opacity-15">
              <Handshake className="h-28 w-28" />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">成功匹配数</p>
                <h3 className="mt-1 text-3xl font-bold">{loading ? '-' : formatNumber(stats.matchCount)}</h3>
                <p className="mt-2 text-xs text-emerald-200">+32.4% 较上月</p>
              </div>
              <div className="mt-4 border-t border-white/20 pt-3 text-xs">
                AI 推荐转化率 <span className="font-semibold">{stats.taskSuccessRate}%</span>
              </div>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">近30天平台活跃趋势</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                    }}
                  />
                  <Bar dataKey="high" name="平台活跃度" fill="#dbeafe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="success" name="匹配成功率" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">待办与预警</h2>
              <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">3 项紧急</span>
            </div>
            <div className="divide-y divide-slate-100">
              {todoItems.map((item) => (
                <div key={item.title} className="flex gap-3 px-6 py-4">
                  <div className="mt-1 rounded-full bg-rose-50 p-2 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                    <p className="mt-2 text-[11px] font-semibold text-blue-600">{item.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">热门技能榜单 (Top 5)</h2>
            <div className="mt-5 space-y-4">
              {[
                { name: 'Java 开发', value: 92 },
                { name: 'Python / AI', value: 88 },
                { name: '前端框架 (React/Vue)', value: 75 },
                { name: '数据分析', value: 64 },
                { name: '产品设计', value: 58 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">最近系统动态</h2>
              <button className="text-sm font-semibold text-blue-600">查看更多</button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                `Admin User 批准了 ${stats.pendingCompanyAudit} 家企业中的优先项审核。`,
                `系统完成图谱更新，新增节点 ${stats.pendingSkillSuggestions} 个。`,
                `任务引擎今日新增任务 ${stats.pendingTaskCount} 条。`,
                '安全策略完成一次高风险登录拦截。',
              ].map((item, index) => (
                <div key={item} className={`py-3 ${index === 0 ? 'pt-0' : ''}`}>
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
