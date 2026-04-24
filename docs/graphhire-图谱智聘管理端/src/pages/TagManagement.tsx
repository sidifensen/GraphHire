import { Search, ChevronDown, Download, Plus, Filter, Code, Database, Brain, ArrowUpRight } from 'lucide-react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';
import { cn } from '../lib/utils';

interface Tag {
  id: string;
  name: string;
  category: '编程语言' | '工具/框架' | '软技能' | '证书/资质';
  synonyms: string[];
  refCount: string;
  icon: any;
}

const mockTags: Tag[] = [
  { id: '1', name: 'Python', category: '编程语言', synonyms: ['py', 'python3', 'python2'], refCount: '845,201', icon: Code },
  { id: '2', name: 'MySQL', category: '工具/框架', synonyms: ['mysql db', 'my-sql'], refCount: '621,093', icon: Database },
  { id: '3', name: '团队协作', category: '软技能', synonyms: ['teamwork', '协作能力', '团队合作'], refCount: '450,112', icon: Brain },
  { id: '4', name: 'React', category: '工具/框架', synonyms: ['reactjs', 'react.js'], refCount: '389,450', icon: Code },
];

export default function TagManagement() {
  return (
    <div className="flex flex-col h-full">
      <Topbar />
      
      <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-display text-on-surface">标签管理</h2>
            <p className="text-sm text-outline mt-1">维护技能、工具等实体图谱节点，确保解析准确率。</p>
          </div>
          <button className="bg-primary text-white hover:opacity-90 px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            <Plus size={18} />
            新建标签
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant/30 dark:border-white/10 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2">总标签数</span>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold font-display text-primary">12,458</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center mb-1">
                 <ArrowUpRight size={12} className="mr-1"/> +124 本周
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant/30 dark:border-white/10 shadow-sm flex items-center gap-6">
            <div className="flex-1 grid grid-cols-3 gap-4">
              {['分类', '状态', '排序'].map((label, idx) => (
                <div key={label}>
                  <label className="block text-[10px] uppercase font-bold text-outline mb-1.5">{label}</label>
                  <div className="relative">
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary appearance-none font-medium">
                      <option>全部{label}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="self-end pb-0.5">
               <button className="bg-slate-100 dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 text-on-surface hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all">
                  <Filter size={14} />
                  筛选
               </button>
            </div>
          </div>
        </div>

        <DataTable
          data={mockTags}
          pagination={{ currentPage: 1, totalPages: 1246, totalItems: 12458 }}
          columns={[
            {
              header: '标准名称',
              accessor: (t) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <t.icon size={16} />
                  </div>
                  <span className="text-sm font-bold text-on-surface">{t.name}</span>
                </div>
              )
            },
            {
              header: '分类',
              accessor: (t) => (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold border truncate",
                  t.category === '编程语言' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30" :
                  t.category === '工具/框架' ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30" :
                  t.category === '软技能' ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30" :
                  "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                )}>
                  {t.category}
                </span>
              )
            },
            {
              header: '同义词 (Count)',
              accessor: (t) => (
                <div className="flex items-center gap-2 flex-wrap max-w-md">
                  {t.synonyms.map(s => (
                    <span key={s} className="text-[10px] text-outline bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-outline-variant/20 dark:border-slate-700">{s}</span>
                  ))}
                  <span className="text-[10px] text-primary bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full font-bold">+5</span>
                </div>
              )
            },
            { header: '引用次数', accessor: 'refCount', className: 'text-right font-display text-sm text-outline' },
            {
              header: '操作',
              className: 'text-center',
              accessor: () => (
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all" title="编辑">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                   </button>
                   <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all" title="管理关系">
                      <span className="material-symbols-outlined text-[20px]">join_inner</span>
                   </button>
                </div>
              )
            }
          ]}
        />
      </main>
    </div>
  );
}
