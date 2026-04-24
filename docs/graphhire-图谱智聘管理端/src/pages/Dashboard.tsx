import { Users, UserPlus, Zap, Megaphone, Download, AlertTriangle, CheckCircle, Info, Handshake, Network, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import Topbar from '../components/Topbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../lib/utils';

import { useTheme } from '../context/ThemeContext';

const chartData = [
  { name: '第一周', high: 3000, success: 1200 },
  { name: '第二周', high: 4500, success: 2200 },
  { name: '第三周', high: 4000, success: 2500 },
  { name: '第四周', high: 6000, success: 3500 },
];

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full">
      <Topbar />
      
      <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        {/* System Announcement */}
        <div className="bg-blue-50 dark:bg-slate-900/40 dark:backdrop-blur-md border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3 flex items-center justify-between text-blue-800 dark:text-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <Megaphone className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-sm font-medium">系统公告：知识图谱 V2.0 引擎升级将于今晚 24:00 进行，预计耗时 2 小时。</span>
          </div>
          <button className="text-blue-400 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <Info size={18} />
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-display text-on-surface">概览数据</h2>
            <p className="text-sm text-outline">更新时间: 今日 08:00 AM</p>
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 px-4 py-2 rounded-lg text-on-surface font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={16} />
            导出报表
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="总用户数"
            value="124,592"
            trend={12.5}
            trendLabel="较上月"
            icon={Users}
            variant="primary"
            subLabel="日活跃度"
            subValue="18.2k"
          />
          <StatCard
            title="入驻企业"
            value="3,840"
            trend={5.2}
            trendLabel="较上月"
            icon={Network}
            variant="indigo"
            subLabel="待审核企业"
            subValue="12 家"
          />
          <StatCard
            title="简历解析数"
            value="892,105"
            trend={24.1}
            trendLabel="较上月"
            icon={Zap}
            variant="purple"
            subLabel="解析成功率"
            subValue="99.4%"
          />
          <StatCard
            title="活跃职位数"
            value="45,210"
            trend={-1.8}
            trendLabel="较上月"
            icon={Users}
            variant="amber"
            subLabel="今日新增"
            subValue="+420"
          />
          <div className="bg-gradient-to-br from-primary to-blue-800 dark:from-black/60 dark:to-black/40 dark:backdrop-blur-xl rounded-xl p-6 text-white relative overflow-hidden group shadow-lg shadow-primary/20 dark:shadow-none border dark:border-white/10">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
              <Network size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-blue-100 dark:text-slate-400 uppercase font-medium">成功匹配数</span>
                  <div className="p-1.5 rounded-md bg-white/20 dark:bg-white/10 backdrop-blur-sm">
                    <Handshake size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-display">12,845</h3>
                <div className="flex items-center gap-1 text-xs text-blue-200 dark:text-emerald-400 mt-2">
                  <TrendingUp size={12} />
                  <span className="font-bold">+32.4%</span>
                  <span className="opacity-70 dark:text-slate-500">较上月</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/20 dark:border-white/5 mt-4 flex justify-between items-center text-[10px]">
                <span className="opacity-80 dark:text-slate-400">AI 推荐转化率</span>
                <span className="font-bold">42.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant/30 dark:border-white/10 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">近30天平台活跃趋势</h3>
              <div className="flex p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                {['日', '周', '月'].map((l, i) => (
                  <button key={l} className={cn(
                    "px-4 py-1 rounded-md text-xs font-semibold transition-all",
                    i === 1 
                      ? "bg-white dark:bg-white/10 dark:backdrop-blur-md shadow-sm text-primary dark:text-blue-400" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}>{l}</button>
                ))}
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#64748b' : '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#64748b' : '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                      backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : '#ffffff',
                      backdropFilter: isDark ? 'blur(12px)' : 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
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

          <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">待办与预警</h3>
              <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full text-[10px] font-bold">3 项紧急</span>
            </div>
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { icon: AlertTriangle, title: "图谱构建任务失败预警", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/10", desc: "节点解析服务在处理批次 #8902 时发生超时。", time: "10 分钟前", action: "查看日志" },
                { icon: CheckCircle, title: "待审核企业入驻", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10", desc: "包含字节、阿里等头部企业提交的资质。", time: "1 小时前", action: "立即审核", tag: "需处理: 12" },
                { icon: Info, title: "行业标签词库更新提醒", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", desc: "检测到 45 个新型技术名词。", time: "昨天 16:30", action: "去合并" }
              ].map((item, i) => (
                <div key={i} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 items-start">
                  <div className={cn("p-2 rounded-full mt-0.5 shrink-0", item.bg, item.color)}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-on-surface truncate">{item.title}</h4>
                      {item.tag && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded scale-90">{item.tag}</span>}
                    </div>
                    <p className="text-xs text-outline line-clamp-1 mb-2">{item.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-outline/60">{item.time}</span>
                      <button className="text-[10px] font-bold text-primary hover:underline">{item.action}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-white/5 text-center">
              <button className="text-sm font-bold text-outline hover:text-primary transition-colors">查看全部待办事项</button>
            </div>
          </div>
        </div>

        {/* Tertiary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hot Skills Widget */}
          <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
              <h3 className="text-lg font-bold text-on-surface">热门技能榜单 (Top 5)</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { name: "Java 开发", value: 92, color: "bg-blue-600" },
                { name: "Python / AI", value: 88, color: "bg-indigo-500" },
                { name: "前端框架 (React/Vue)", value: 75, color: "bg-emerald-500" },
                { name: "数据分析", value: 64, color: "bg-amber-500" },
                { name: "产品设计", value: 58, color: "bg-purple-500" }
              ].map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className="text-slate-500 font-mono">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className={cn(skill.color, "h-2 rounded-full transition-all duration-1000")} 
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent System Activities Widget */}
          <div className="lg:col-span-2 bg-white dark:bg-black/40 dark:backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">最近系统动态</h3>
              <button className="text-primary hover:text-blue-700 text-sm font-bold">查看更多</button>
            </div>
            <div className="p-6 divide-y divide-slate-100 dark:divide-white/5">
              {[
                { 
                  user: "Admin User", 
                  action: "批准了", 
                  target: "字节跳动科技有限公司", 
                  detail: "的企业资质审核。", 
                  time: "今天 09:42 AM", 
                  dotColor: "bg-blue-500" 
                },
                { 
                  user: "System", 
                  action: "知识图谱自动更新任务完成，新增节点", 
                  target: "+1,204", 
                  detail: "，更新关系 +5,392。", 
                  time: "今天 08:00 AM", 
                  dotColor: "bg-emerald-500" 
                },
                { 
                  user: "System", 
                  action: "自动导出上月《全平台招聘趋势分析报告》，已发送至管理员邮箱。", 
                  time: "昨天 23:55 PM", 
                  dotColor: "bg-purple-500" 
                },
                { 
                  user: "Security Bot", 
                  action: "检测到异常登录尝试 (IP: 192.168.1.104)，已自动拦截。", 
                  time: "昨天 14:20 PM", 
                  dotColor: "bg-amber-500" 
                }
              ].map((activity, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  <div className={cn("w-2 h-2 mt-2 rounded-full shrink-0 shadow-[0_0_0_4px_rgba(0,0,0,0.05)] dark:shadow-none", activity.dotColor)}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {activity.user && <span className="font-bold text-on-surface mr-1">{activity.user}</span>}
                      {activity.action}
                      {activity.target && <span className="font-bold text-primary mx-1">{activity.target}</span>}
                      {activity.detail}
                    </p>
                    <span className="text-[11px] text-outline mt-1 block uppercase tracking-wider">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[11px] text-outline pt-4">
          <p>© 2024 GraphHire 图谱智聘 - 内部管理系统</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary transition-colors">系统状态</a>
            <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
            <a href="#" className="hover:text-primary transition-colors">帮助文档</a>
          </div>
        </div>
      </main>
    </div>
  );
}

