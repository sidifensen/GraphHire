'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Zap,
  Megaphone,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Handshake,
  Network,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { adminApi, type AdminDashboardStats, type DashboardTrendDimension } from '@/lib/api/admin';

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [trendDimension, setTrendDimension] = useState<DashboardTrendDimension>('DAY');

  useEffect(() => {
    let cancelled = false;

    const loadDashboardStats = async () => {
      try {
        const [data, trend] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDashboardTrend('DAY'),
        ]);
        if (!cancelled && data) {
          setStats({ ...data, trend });
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      }
    };

    void loadDashboardStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTrendChange = async (dimension: DashboardTrendDimension) => {
    setTrendDimension(dimension);
    try {
      const trend = await adminApi.getDashboardTrend(dimension);
      setStats((prev) => (prev ? { ...prev, trend } : prev));
    } catch {
      setStats((prev) => (prev ? { ...prev, trend: [] } : prev));
    }
  };

  const formatNumber = (value: number | undefined) => new Intl.NumberFormat('zh-CN').format(value ?? 0);
  const formatTrend = (value: number | undefined) => Number((value ?? 0).toFixed(1));
  const formatPercent = (value: number | undefined) => `${(value ?? 0).toFixed(1)}%`;
  const updatedAtText = stats?.updatedAt ? stats.updatedAt : '今日 08:00 AM';
  const trendData = (stats?.trend ?? []).map((item) => ({
    name: item.date.slice(5),
    high: item.activeUsers,
    success: item.newData,
  }));

  const todoLevelClassMap: Record<string, { text: string; bg: string; icon: typeof Info }> = {
    HIGH: { text: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', icon: AlertTriangle },
    MEDIUM: { text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: CheckCircle },
    LOW: { text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: Info },
  };
  const activityDotMap: Record<string, string> = {
    HIGH: 'bg-rose-500',
    MEDIUM: 'bg-amber-500',
    INFO: 'bg-blue-500',
  };
  const hotSkillColorStyles = [
    { text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-600' },
    { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-600' },
    { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
    { text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
    { text: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-500' },
  ];

  return (
          <div className="space-y-6 p-8">
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-800 transition-colors dark:border-blue-900/30 dark:bg-slate-900/40 dark:text-blue-300 dark:backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Megaphone className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-sm font-medium">系统公告：知识图谱 V2.0 引擎升级将于今晚 24:00 进行，预计耗时 2 小时。</span>
          </div>
          <button className="text-blue-400 transition-colors hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-300">
            <Info size={18} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">概览数据</h2>
            <p className="text-sm text-outline">更新时间: {updatedAtText}</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
            <Download size={16} />
            导出报表
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <AdminStatCard
            title="总用户数"
            value={formatNumber(stats?.totalUsers)}
            trend={formatTrend(stats?.userGrowthRate)}
            trendLabel="较上月"
            icon={Users}
            variant="primary"
            subLabel="日活跃度"
            subValue={formatNumber(stats?.dailyActiveUsers)}
          />
          <AdminStatCard
            title="入驻企业"
            value={formatNumber(stats?.totalCompanies)}
            trend={formatTrend(stats?.companyGrowthRate)}
            trendLabel="较上月"
            icon={Network}
            variant="indigo"
            subLabel="待审核企业"
            subValue={`${stats?.pendingCompanyAudit ?? 0} 家`}
          />
          <AdminStatCard
            title="简历解析数"
            value={formatNumber(stats?.totalResumes)}
            trend={formatTrend(stats?.resumeGrowthRate)}
            trendLabel="较上月"
            icon={Zap}
            variant="purple"
            subLabel="解析成功率"
            subValue={formatPercent(stats?.taskSuccessRate)}
          />
          <AdminStatCard
            title="活跃职位数"
            value={formatNumber(stats?.totalJobs)}
            trend={formatTrend(stats?.jobGrowthRate)}
            trendLabel="较上月"
            icon={Users}
            variant="amber"
            subLabel="今日新增"
            subValue={`+${stats?.todayNewJobs ?? 0}`}
          />
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary to-blue-800 p-6 text-white shadow-lg shadow-primary/20 dark:border-white/10 dark:from-black/60 dark:to-black/40 dark:shadow-none dark:backdrop-blur-xl">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 transition-transform group-hover:scale-110">
              <Network size={120} />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-xs font-medium uppercase text-blue-100 dark:text-slate-400">成功匹配数</span>
                  <div className="rounded-md bg-white/20 p-1.5 backdrop-blur-sm dark:bg-white/10">
                    <Handshake size={20} />
                  </div>
                </div>
                <h3 className="font-display text-3xl font-bold">{formatNumber(stats?.matchCount)}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-200 dark:text-emerald-400">
                  <TrendingUp size={12} />
                  <span className="font-bold">{(stats?.matchGrowthRate ?? 0) >= 0 ? '+' : ''}{formatTrend(stats?.matchGrowthRate)}%</span>
                  <span className="opacity-70 dark:text-slate-500">较上月</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] dark:border-white/5">
                <span className="opacity-80 dark:text-slate-400">AI 推荐转化率</span>
                <span className="font-bold">{formatPercent(stats?.matchConversionRate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">平台活跃趋势</h3>
              <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
                {[
                  { label: '日', value: 'DAY' as DashboardTrendDimension },
                  { label: '周', value: 'WEEK' as DashboardTrendDimension },
                  { label: '月', value: 'MONTH' as DashboardTrendDimension },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => void handleTrendChange(item.value)}
                    className={cn(
                      'rounded-md px-4 py-1 text-xs font-semibold transition-all',
                      trendDimension === item.value
                        ? 'bg-white text-primary shadow-sm dark:bg-white/10 dark:text-blue-400 dark:backdrop-blur-md'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 w-full">
              {trendData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-outline dark:border-slate-700">
                  暂无趋势数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#64748b' : '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#64748b' : '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : '#ffffff',
                        backdropFilter: isDark ? 'blur(12px)' : 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                      itemStyle={{ color: isDark ? '#cbd5e1' : '#334155' }}
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey="high" name="平台活跃度" fill="#dbeafe" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="success" name="匹配成功量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">待办与预警</h3>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">3 项紧急</span>
            </div>
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {(stats?.todos ?? []).map((item, index) => {
                const levelStyle = todoLevelClassMap[item.level] ?? todoLevelClassMap.LOW;
                const TodoIcon = levelStyle.icon;
                return (
                <div key={index} className="flex items-start gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={cn('mt-0.5 shrink-0 rounded-full p-2', levelStyle.bg, levelStyle.text)}>
                    <TodoIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate text-sm font-bold text-on-surface">{item.title}</h4>
                      {item.count > 0 ? <span className="scale-90 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">需处理: {item.count}</span> : null}
                    </div>
                    <p className="mb-2 line-clamp-1 text-xs text-outline">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-outline/60">{item.updatedAt}</span>
                      <button className="text-[10px] font-bold text-primary hover:underline">{item.actionText}</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
            <div className="border-t border-slate-100 p-3 text-center dark:border-white/5">
              <button className="text-sm font-bold text-outline transition-colors hover:text-primary">查看全部待办事项</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">热门技能榜单 (Top 5)</h3>
            </div>
            <div className="space-y-6 p-6">
              {(stats?.hotSkills ?? []).map((skill, index) => {
                const colorStyle = hotSkillColorStyles[index % hotSkillColorStyles.length];
                return (
                  <div key={index}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className={cn('font-mono', colorStyle.text)}>{skill.count} 次</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={cn('h-2 rounded-full transition-all duration-1000', colorStyle.bar)} style={{ width: `${skill.heat}%` }} />
                  </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">最近系统动态</h3>
              <button className="text-sm font-bold text-primary hover:text-blue-700">查看更多</button>
            </div>
            <div className="divide-y divide-slate-100 p-6 dark:divide-white/5">
              {(stats?.systemActivities ?? []).map((activity, index) => (
                <div key={index} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={cn('mt-2 h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_4px_rgba(0,0,0,0.05)] dark:shadow-none', activityDotMap[activity.level] ?? activityDotMap.INFO)} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {activity.actor ? <span className="mr-1 font-bold text-on-surface">{activity.actor}</span> : null}
                      {activity.action}
                      {activity.target ? <span className="mx-1 font-bold text-primary">{activity.target}</span> : null}
                      {activity.detail ?? ''}
                    </p>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-outline">{activity.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 text-[11px] text-outline">
          <p>© 2026 GraphHire 图谱智聘 - 内部管理系统</p>
          <div className="flex space-x-4">
            <a href="#" className="transition-colors hover:text-primary">
              系统状态
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              隐私政策
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              帮助文档
            </a>
          </div>
        </div>
      </div>
  );
}
