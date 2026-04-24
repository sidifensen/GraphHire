'use client';

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
import AdminShell from '@/components/admin/AdminShell';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const chartData = [
  { name: '第一周', high: 3000, success: 1200 },
  { name: '第二周', high: 4500, success: 2200 },
  { name: '第三周', high: 4000, success: 2500 },
  { name: '第四周', high: 6000, success: 3500 },
];

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell>
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
            <p className="text-sm text-outline">更新时间: 今日 08:00 AM</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
            <Download size={16} />
            导出报表
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <AdminStatCard title="总用户数" value="124,592" trend={12.5} trendLabel="较上月" icon={Users} variant="primary" subLabel="日活跃度" subValue="18.2k" />
          <AdminStatCard title="入驻企业" value="3,840" trend={5.2} trendLabel="较上月" icon={Network} variant="indigo" subLabel="待审核企业" subValue="12 家" />
          <AdminStatCard title="简历解析数" value="892,105" trend={24.1} trendLabel="较上月" icon={Zap} variant="purple" subLabel="解析成功率" subValue="99.4%" />
          <AdminStatCard title="活跃职位数" value="45,210" trend={-1.8} trendLabel="较上月" icon={Users} variant="amber" subLabel="今日新增" subValue="+420" />
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
                <h3 className="font-display text-3xl font-bold">12,845</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-200 dark:text-emerald-400">
                  <TrendingUp size={12} />
                  <span className="font-bold">+32.4%</span>
                  <span className="opacity-70 dark:text-slate-500">较上月</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] dark:border-white/5">
                <span className="opacity-80 dark:text-slate-400">AI 推荐转化率</span>
                <span className="font-bold">42.8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">近30天平台活跃趋势</h3>
              <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
                {['日', '周', '月'].map((label, index) => (
                  <button
                    key={label}
                    className={cn(
                      'rounded-md px-4 py-1 text-xs font-semibold transition-all',
                      index === 1
                        ? 'bg-white text-primary shadow-sm dark:bg-white/10 dark:text-blue-400 dark:backdrop-blur-md'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Bar dataKey="success" name="匹配成功率" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">待办与预警</h3>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">3 项紧急</span>
            </div>
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { icon: AlertTriangle, title: '图谱构建任务失败预警', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', desc: '节点解析服务在处理批次 #8902 时发生超时。', time: '10 分钟前', action: '查看日志' },
                { icon: CheckCircle, title: '待审核企业入驻', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', desc: '包含字节、阿里等头部企业提交的资质。', time: '1 小时前', action: '立即审核', tag: '需处理: 12' },
                { icon: Info, title: '行业标签词库更新提醒', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', desc: '检测到 45 个新型技术名词。', time: '昨天 16:30', action: '去合并' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={cn('mt-0.5 shrink-0 rounded-full p-2', item.bg, item.color)}>
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate text-sm font-bold text-on-surface">{item.title}</h4>
                      {item.tag ? <span className="scale-90 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{item.tag}</span> : null}
                    </div>
                    <p className="mb-2 line-clamp-1 text-xs text-outline">{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-outline/60">{item.time}</span>
                      <button className="text-[10px] font-bold text-primary hover:underline">{item.action}</button>
                    </div>
                  </div>
                </div>
              ))}
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
              {[
                { name: 'Java 开发', value: 92, color: 'bg-blue-600' },
                { name: 'Python / AI', value: 88, color: 'bg-indigo-500' },
                { name: '前端框架 (React/Vue)', value: 75, color: 'bg-emerald-500' },
                { name: '数据分析', value: 64, color: 'bg-amber-500' },
                { name: '产品设计', value: 58, color: 'bg-purple-500' },
              ].map((skill, index) => (
                <div key={index}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className="font-mono text-slate-500">{skill.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={cn('h-2 rounded-full transition-all duration-1000', skill.color)} style={{ width: `${skill.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">最近系统动态</h3>
              <button className="text-sm font-bold text-primary hover:text-blue-700">查看更多</button>
            </div>
            <div className="divide-y divide-slate-100 p-6 dark:divide-white/5">
              {[
                { user: 'Admin User', action: '批准了', target: '字节跳动科技有限公司', detail: '的企业资质审核。', time: '今天 09:42 AM', dotColor: 'bg-blue-500' },
                { user: 'System', action: '知识图谱自动更新任务完成，新增节点', target: '+1,204', detail: '，更新关系 +5,392。', time: '今天 08:00 AM', dotColor: 'bg-emerald-500' },
                { user: 'System', action: '自动导出上月《全平台招聘趋势分析报告》，已发送至管理员邮箱。', time: '昨天 23:55 PM', dotColor: 'bg-purple-500' },
                { user: 'Security Bot', action: '检测到异常登录尝试 (IP: 192.168.1.104)，已自动拦截。', time: '昨天 14:20 PM', dotColor: 'bg-amber-500' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={cn('mt-2 h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_4px_rgba(0,0,0,0.05)] dark:shadow-none', activity.dotColor)} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {activity.user ? <span className="mr-1 font-bold text-on-surface">{activity.user}</span> : null}
                      {activity.action}
                      {activity.target ? <span className="mx-1 font-bold text-primary">{activity.target}</span> : null}
                      {activity.detail}
                    </p>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-outline">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 text-[11px] text-outline">
          <p>© 2024 GraphHire 图谱智聘 - 内部管理系统</p>
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
    </AdminShell>
  );
}
