'use client';

import { ChevronDown, Plus, Filter, Code, Database, Brain, ArrowUpRight } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  category: '编程语言' | '工具/框架' | '软技能' | '证书/资质';
  synonyms: string[];
  refCount: string;
  icon: typeof Code;
}

const mockTags: Tag[] = [
  { id: '1', name: 'Python', category: '编程语言', synonyms: ['py', 'python3', 'python2'], refCount: '845,201', icon: Code },
  { id: '2', name: 'MySQL', category: '工具/框架', synonyms: ['mysql db', 'my-sql'], refCount: '621,093', icon: Database },
  { id: '3', name: '团队协作', category: '软技能', synonyms: ['teamwork', '协作能力', '团队合作'], refCount: '450,112', icon: Brain },
  { id: '4', name: 'React', category: '工具/框架', synonyms: ['reactjs', 'react.js'], refCount: '389,450', icon: Code },
];

export default function AdminSkillTagsPage() {
  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">标签管理</h2>
            <p className="mt-1 text-sm text-outline">维护技能、工具等实体图谱节点，确保解析准确率。</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]">
            <Plus size={18} />
            新建标签
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="flex flex-col justify-center rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-outline">总标签数</span>
            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-primary">12,458</span>
              <span className="mb-1 flex items-center rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <ArrowUpRight size={12} className="mr-1" /> +124 本周
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-3">
            <div className="grid flex-1 grid-cols-3 gap-4">
              {['分类', '状态', '排序'].map((label) => (
                <div key={label}>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase text-outline">{label}</label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                      <option>全部{label}</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
                  </div>
                </div>
              ))}
            </div>
            <div className="self-end pb-0.5">
              <button className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-slate-100 px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Filter size={14} />
                筛选
              </button>
            </div>
          </div>
        </div>

        <AdminDataTable
          data={mockTags}
          pagination={{ currentPage: 1, totalPages: 1246, totalItems: 12458 }}
          columns={[
            {
              header: '标准名称',
              accessor: (tag) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <tag.icon size={16} />
                  </div>
                  <span className="text-sm font-bold text-on-surface">{tag.name}</span>
                </div>
              ),
            },
            {
              header: '分类',
              accessor: (tag) => (
                <span
                  className={cn(
                    'truncate rounded-full border px-2.5 py-1 text-[10px] font-bold',
                    tag.category === '编程语言'
                      ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400'
                      : tag.category === '工具/框架'
                        ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400'
                        : tag.category === '软技能'
                          ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {tag.category}
                </span>
              ),
            },
            {
              header: '同义词 (Count)',
              accessor: (tag) => (
                <div className="flex max-w-md flex-wrap items-center gap-2">
                  {tag.synonyms.map((synonym) => (
                    <span
                      key={synonym}
                      className="rounded border border-outline-variant/20 bg-slate-50 px-2 py-0.5 text-[10px] text-outline dark:border-slate-700 dark:bg-slate-800"
                    >
                      {synonym}
                    </span>
                  ))}
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:bg-blue-900/20">+5</span>
                </div>
              ),
            },
            { header: '引用次数', accessor: 'refCount', className: 'font-display text-right text-sm text-outline' },
            {
              header: '操作',
              className: 'text-center',
              accessor: () => (
                <div className="group-hover:opacity-100 flex justify-center gap-2 opacity-0 transition-opacity">
                  <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-primary" title="编辑">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-primary" title="管理关系">
                    <span className="material-symbols-outlined text-[20px]">join_inner</span>
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
