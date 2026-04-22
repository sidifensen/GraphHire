'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type AdminDashboardStats } from '@/lib/api/admin';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid } from 'recharts';
import { adminAuthStore } from '@/lib/stores/auth-store';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  // 检查登录状态，未登录则重定向到登录页
  useEffect(() => {
    const state = adminAuthStore.getState();
    if (!state.isAuthenticated || !state.accessToken) {
      router.replace('/admin/login');
    }
  }, [router]);

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
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  const chartConfig: ChartConfig = {
    activeUsers: { label: '日活用户', color: '#0052D9' },
    newData: { label: '新增数据', color: '#DDE1FF' },
    date: { label: '日期' },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="dashboard" />

      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8 pb-16 bg-surface">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">数据总览</h1>
              <p className="text-on-surface-variant font-body">系统运行状态与核心业务指标监控。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 flex flex-col gap-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">用户总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">
                        {loading ? '-' : formatNumber(stats?.totalUsers ?? 0)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>今日 +{stats?.todayNewUsers ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">企业总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">domain</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">
                        {loading ? '-' : formatNumber(stats?.totalCompanies ?? 0)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>本周 +{stats?.weeklyNewCompanies ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">简历总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">
                        {loading ? '-' : formatNumber(stats?.totalResumes ?? 0)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+{stats?.todayNewJobs ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">在招职位</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">work</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">
                        {loading ? '-' : formatNumber(stats?.totalJobs ?? 0)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                        <span>今日 +{stats?.todayNewJobs ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 h-[400px] flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h3 className="text-lg font-headline font-semibold text-on-surface">近 30 天趋势图</h3>
                      <p className="text-sm text-on-surface-variant mt-1">日活用户与新增数据对比分析</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs text-on-surface-variant">日活用户</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary-fixed"></div>
                        <span className="text-xs text-on-surface-variant">新增数据</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <AreaChart data={stats?.trend ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052D9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0052D9" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNewData" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DDE1FF" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#DDE1FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EEFF" />
                        <Area
                          type="monotone"
                          dataKey="activeUsers"
                          stroke="#0052D9"
                          strokeWidth={2}
                          fill="url(#colorActiveUsers)"
                          dot={false}
                          activeDot={{ r: 4, fill: '#0052D9' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="newData"
                          stroke="#DDE1FF"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          fill="url(#colorNewData)"
                          dot={false}
                        />
                        <ChartTooltipContent
                          indicator="dot"
                          labelKey="date"
                          nameKey="date"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-4 ml-1">快捷入口</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">fact_check</span>
                      </div>
                      <span>企业审核</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">refresh</span>
                      </div>
                      <span>失败任务重试</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">label_important</span>
                      </div>
                      <span>标签治理</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col gap-8">
                <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 min-h-[220px] flex flex-col justify-between" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%), linear-gradient(to bottom right, #003DA6, #0052D9)' }}>
                  <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[180px] text-white/5 pointer-events-none icon-fill">hub</span>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary-fixed-dim font-medium mb-2">
                      <span className="material-symbols-outlined text-[20px] icon-fill">psychology</span>
                      <span>AI 匹配总数</span>
                    </div>
                    <div className="text-5xl font-headline font-extrabold tracking-tight mt-2 mb-4">
                      {loading ? '-' : formatNumber(stats?.matchCount ?? 0)}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      <span>本月计算量激增 24%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg">
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-5">运营指标</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-on-surface font-medium">任务成功率</span>
                        <span className="text-primary font-bold">{loading ? '-' : (stats?.taskSuccessRate ?? 0) + '%'}</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: (stats?.taskSuccessRate ?? 0) + '%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">企业周新增数</span>
                      </div>
                      <span className="text-xl font-headline font-bold text-primary">{loading ? '-' : stats?.weeklyNewCompanies ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg flex-1">
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-5 flex items-center justify-between">
                    待办事项
                    <span className="material-symbols-outlined text-primary text-[20px] icon-fill">assignment_late</span>
                  </h3>
                  <div className="space-y-3">
                    <a className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">domain_verification</span>
                        待审核企业
                      </div>
                      <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{loading ? '-' : stats?.pendingCompanyAudit ?? 0}</span>
                    </a>
                    <a className="flex items-center justify-between p-4 bg-error-container/30 hover:bg-error-container/50 transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-error">error</span>
                        失败解析任务
                      </div>
                      <span className="bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full">{loading ? '-' : stats?.failedTaskCount ?? 0}</span>
                    </a>
                    <a className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">new_releases</span>
                        待处理标签建议
                      </div>
                      <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold px-2.5 py-1 rounded-full">{loading ? '-' : stats?.pendingSkillSuggestions ?? 0}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
