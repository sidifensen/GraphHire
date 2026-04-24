import { Search, ChevronDown, Download, AlertCircle, Network, CheckCircle2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';
import { cn } from '../lib/utils';

interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  size: string;
  applyDate: string;
  status: '待审核' | '已通过' | '已拒绝';
  initial: string;
}

const mockCompanies: Company[] = [
  { id: '1', name: '腾讯科技（深圳）有限公司', code: '9144030071526726XG', industry: '互联网/IT', size: '10000人以上', applyDate: '2023-10-24 14:30', status: '待审核', initial: 'T' },
  { id: '2', name: '阿里巴巴（中国）网络技术有限公司', code: '91330100716105852F', industry: '电子商务', size: '10000人以上', applyDate: '2023-10-23 09:15', status: '已通过', initial: 'A' },
  { id: '3', name: '星火创新科技有限公司', code: '91110108MA01XXXXX', industry: '人工智能', size: '100-499人', applyDate: '2023-10-24 16:45', status: '待审核', initial: 'X' },
];

export default function CompanyAudit() {
  return (
    <div className="flex flex-col h-full">
      <Topbar />
      
      <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-display text-on-surface">企业审核</h2>
            <p className="text-sm text-outline mt-1">管理和审批入驻企业资质与账号信息</p>
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-black/40 dark:backdrop-blur-xl border border-outline-variant dark:border-white/10 px-4 py-2 rounded-lg text-on-surface font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
            <Download size={16} />
            导出报表
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: '待审核企业', value: '142', trend: '+12%', icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '今日已处理', value: '56', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary-fixed' },
            { label: '高风险拦截', value: '8', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', alert: true },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant/30 dark:border-white/10 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color, s.bg.includes('bg-primary-fixed') && "dark:bg-primary/20", s.bg.includes('bg-blue-50') && "dark:bg-blue-900/20", s.bg.includes('bg-rose-50') && "dark:bg-rose-900/20")}>
                    <s.icon size={20} />
                  </div>
                  {s.trend && <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{s.trend}</span>}
                  {s.alert && <span className="bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10}/> 需关注</span>}
               </div>
               <p className="text-xs text-outline font-medium mb-1">{s.label}</p>
               <h3 className="text-2xl font-bold font-display">{s.value}</h3>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl p-4 rounded-xl border border-outline-variant/30 dark:border-white/10 flex justify-between items-center shadow-sm">
          <div className="flex gap-6">
            {['全部', '待审核', '已通过', '已拒绝'].map((tab, i) => (
              <button key={tab} className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-all",
                i === 0 ? "text-primary border-primary" : "text-outline border-transparent hover:text-on-surface dark:hover:text-slate-200"
              )}>{tab}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input type="text" placeholder="搜索企业..." className="bg-surface dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-sm w-64 focus:ring-1 focus:ring-primary outline-none text-on-surface" />
             </div>
             <button className="px-3 py-1.5 border border-outline-variant/30 dark:border-slate-700 rounded-lg text-xs font-semibold text-on-surface hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1">
                更多筛选
                <ChevronDown size={14} />
             </button>
          </div>
        </div>

        <DataTable
          data={mockCompanies}
          pagination={{ currentPage: 1, totalPages: 5, totalItems: 142 }}
          columns={[
            {
              header: '企业名称',
              accessor: (c) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 flex items-center justify-center font-bold text-primary">
                    {c.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{c.name}</p>
                    <p className="text-[10px] text-outline mt-0.5 uppercase">{c.code}</p>
                  </div>
                </div>
              ),
              className: 'w-[40%]'
            },
            { header: '所属行业', accessor: 'industry', className: 'text-outline text-sm' },
            { header: '人员规模', accessor: 'size', className: 'text-outline text-sm' },
            { header: '申请时间', accessor: (c) => <span className="text-sm font-display text-outline">{c.applyDate}</span> },
            {
              header: '状态',
              accessor: (c) => (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset",
                  c.status === '待审核' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-amber-100 dark:ring-amber-900/30" :
                  c.status === '已通过' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-900/30" :
                  "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 ring-rose-100 dark:ring-rose-900/30"
                )}>
                  {c.status}
                </span>
              )
            },
            {
              header: '操作',
              className: 'text-right',
              accessor: (c) => (
                <div className="flex justify-end gap-3">
                   <button className="text-primary hover:underline text-xs font-bold">详情</button>
                   {c.status === '待审核' && (
                     <>
                        <button className="text-secondary hover:underline text-xs font-bold">通过</button>
                        <button className="text-rose-600 hover:underline text-xs font-bold">拒绝</button>
                     </>
                   )}
                </div>
              )
            }
          ]}
        />
      </main>
    </div>
  );
}
