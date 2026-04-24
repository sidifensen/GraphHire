'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Plus, Filter, Code, Database, Brain, ArrowUpRight } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';
import { adminApi, type SkillTagItem } from '@/lib/api/admin';

type TagCategory = '编程语言' | '工具/框架' | '软技能' | '证书/资质' | '未分类';

interface TagRow {
  id: number;
  name: string;
  category: TagCategory;
  synonyms: string[];
  refCount: string;
  icon: typeof Code;
}

const CATEGORY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '全部分类', value: '' },
  { label: '编程语言', value: '编程语言' },
  { label: '工具/框架', value: '工具/框架' },
  { label: '软技能', value: '软技能' },
  { label: '证书/资质', value: '证书/资质' },
];

function mapIconByCategory(category: string | null): typeof Code {
  if (category === '工具/框架') {
    return Database;
  }
  if (category === '软技能') {
    return Brain;
  }
  return Code;
}

function normalizeCategory(category: string | null): TagCategory {
  if (!category) {
    return '未分类';
  }
  if (category === '编程语言' || category === '工具/框架' || category === '软技能' || category === '证书/资质') {
    return category;
  }
  return '未分类';
}

export default function AdminSkillTagsPage() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<TagRow[]>([]);

  const totalPages = useMemo(() => {
    if (total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSkillList({
        category: category || undefined,
        keyword: keyword || undefined,
        page,
        pageSize,
      });
      setTotal(response.total ?? 0);
      setRows(
        (response.list ?? []).map((item: SkillTagItem) => {
          const resolvedCategory = normalizeCategory(item.category);
          const synonyms = Array.isArray(item.synonyms) ? item.synonyms : [];
          return {
            id: item.id,
            name: item.name,
            category: resolvedCategory,
            synonyms,
            refCount: (item.jobCount ?? 0).toLocaleString(),
            icon: mapIconByCategory(item.category),
          };
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    const name = window.prompt('请输入标签名称');
    if (!name?.trim()) {
      return;
    }
    await adminApi.createSkillTag({ name: name.trim() });
    await loadSkills();
  };

  const handleEdit = async (tag: TagRow) => {
    const name = window.prompt('请输入新的标签名称', tag.name);
    if (!name?.trim()) {
      return;
    }
    await adminApi.updateSkillTag(tag.id, { name: name.trim() });
    await loadSkills();
  };

  const handleManageRelation = async (tag: TagRow) => {
    const synonym = window.prompt('请输入要新增的同义词');
    if (!synonym?.trim()) {
      return;
    }
    await adminApi.addSkillTagSynonym(tag.id, synonym.trim());
    await loadSkills();
  };

  const handleFilter = async () => {
    setPage(1);
    await loadSkills();
  };

  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">标签管理</h2>
            <p className="mt-1 text-sm text-outline">维护技能、工具等实体图谱节点，确保解析准确率。</p>
          </div>
          <button
            type="button"
            onClick={() => void handleCreate()}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={18} />
            新建标签
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="flex flex-col justify-center rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-outline">总标签数</span>
            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-primary">{total.toLocaleString()}</span>
              <span className="mb-1 flex items-center rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <ArrowUpRight size={12} className="mr-1" /> 本页 {rows.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-3">
            <div className="grid flex-1 grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase text-outline">分类</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase text-outline">状态</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                    <option>全部状态</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase text-outline">排序</label>
                <div className="relative">
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="关键词"
                    className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
            <div className="self-end pb-0.5">
              <button
                type="button"
                onClick={() => void handleFilter()}
                className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-slate-100 px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Filter size={14} />
                筛选
              </button>
            </div>
          </div>
        </div>

        <AdminDataTable
          data={rows}
          pagination={{ currentPage: page, totalPages, totalItems: total }}
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
                  {tag.synonyms.length > 0 ? (
                    tag.synonyms.map((synonym) => (
                      <span
                        key={synonym}
                        className="rounded border border-outline-variant/20 bg-slate-50 px-2 py-0.5 text-[10px] text-outline dark:border-slate-700 dark:bg-slate-800"
                      >
                        {synonym}
                      </span>
                    ))
                  ) : (
                    <span className="rounded border border-outline-variant/20 bg-slate-50 px-2 py-0.5 text-[10px] text-outline dark:border-slate-700 dark:bg-slate-800">
                      无
                    </span>
                  )}
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:bg-blue-900/20">
                    {`+${tag.synonyms.length}`}
                  </span>
                </div>
              ),
            },
            { header: '引用次数', accessor: 'refCount', className: 'font-display text-right text-sm text-outline' },
            {
              header: '操作',
              className: 'text-center',
              accessor: (tag) => (
                <div className="group-hover:opacity-100 flex justify-center gap-2 opacity-0 transition-opacity">
                  <button
                    type="button"
                    onClick={() => void handleEdit(tag)}
                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-primary"
                    title="编辑"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleManageRelation(tag)}
                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-primary"
                    title="管理关系"
                  >
                    <span className="material-symbols-outlined text-[20px]">join_inner</span>
                  </button>
                </div>
              ),
            },
          ]}
        />
        {loading ? <p className="text-xs text-outline">加载中...</p> : null}
      </div>
    </AdminShell>
  );
}
