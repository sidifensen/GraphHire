import { Search, RotateCcw, Filter, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  type: string;
  retries: number;
  lastTime: string;
  status: '处理中' | '失败' | '成功' | '待处理';
}

const mockTasks: Task[] = [
  { id: 'TSK-8922-A1', type: '简历解析', retries: 0, lastTime: '2023-10-27 14:32:10', status: '处理中' },
  { id: 'TSK-8921-B4', type: '图谱匹配', retries: 3, lastTime: '2023-10-27 14:30:05', status: '失败' },
  { id: 'TSK-8920-C9', type: '职位解析', retries: 1, lastTime: '2023-10-27 14:28:44', status: '成功' },
  { id: 'TSK-8919-A1', type: '简历解析', retries: 0, lastTime: '-', status: '待处理' },
  { id: 'TSK-8918-B2', type: '图谱匹配', retries: 5, lastTime: '2023-10-27 14:15:22', status: '失败' },
];

export default function TaskMonitoring() {
  return (
    <div className="flex flex-col h-full text-on-surface">
      <Topbar />
      
      <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-display">任务监控</h2>
          <p className="text-sm text-outline mt-1">实时追踪系统级数据处理任务的执行状态</p>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: '待处理', value: 124, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: '处理中', value: 38, icon: RefreshCw, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/20', animate: 'animate-spin animate-duration-3000' },
            { label: '成功 (24h)', value: '8,402', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: '失败', value: 12, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/30' },
          ].map((s, i) => (
            <div key={i} className={cn(
              "bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant dark:border-white/10 shadow-sm flex items-center justify-between transition-all hover:scale-[1.02]",
              s.border
            )}>
              <div>
                <p className="text-xs font-medium text-outline mb-2">{s.label}</p>
                <p className={cn("text-3xl font-bold font-display", s.color)}>{s.value}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center opacity-80", s.bg, s.color)}>
                <s.icon size={26} className={s.animate} />
              </div>
            </div>
          ))}
        </div>

        {/* Task Queue Table */}
        <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl border border-outline-variant dark:border-white/10 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
            <h3 className="text-sm font-bold opacity-80">最近任务队列</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-outline-variant dark:border-slate-800 rounded-lg text-xs font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-on-surface">
                <Filter size={14} className="mr-1.5" /> 筛选
              </button>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-outline-variant dark:border-slate-800 rounded-lg text-xs font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-on-surface">
                <RotateCcw size={14} className="mr-1.5" /> 刷新
              </button>
            </div>
          </div>
          
          <DataTable
            data={mockTasks}
            pagination={{ currentPage: 1, totalPages: 35, totalItems: 174 }}
            columns={[
              { header: '任务ID', accessor: 'id', className: 'font-mono text-xs font-bold text-slate-700 dark:text-slate-300' },
              { header: '任务类型', accessor: 'type', className: 'text-sm text-on-surface' },
              { header: '重试次数', accessor: 'retries', className: 'text-sm text-outline text-center w-16' },
              { header: '最后执行时间', accessor: (t) => <span className="text-xs font-display text-outline-variant">{t.lastTime}</span> },
              {
                header: '状态',
                accessor: (t) => (
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ring-1 ring-inset",
                    t.status === '处理中' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-100 dark:ring-blue-900/30" :
                    t.status === '失败' ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 ring-rose-100 dark:ring-rose-900/30" :
                    t.status === '成功' ? "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-100 dark:ring-slate-700" :
                    "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-slate-100 dark:ring-slate-700"
                  )}>
                    {t.status === '处理中' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>}
                    {t.status}
                  </span>
                )
              },
              {
                header: '操作',
                className: 'text-right',
                accessor: (t) => (
                  <button 
                    disabled={t.status === '处理中'}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      t.status === '失败' 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "text-slate-400 border-outline-variant dark:border-slate-800 disabled:opacity-40"
                    )}
                  >
                    重试
                  </button>
                )
              }
            ]}
          />
        </div>
      </main>
    </div>
  );
}
