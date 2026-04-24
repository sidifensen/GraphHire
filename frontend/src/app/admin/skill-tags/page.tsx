'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Brain, Code, Database, Filter, Plus } from 'lucide-react';
import { adminApi, type SkillTagItem } from '@/lib/api/admin';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable, { type AdminDataTableColumn } from '@/components/admin/AdminDataTable';

const pickIcon = (category?: string | null) => {
  const normalized = (category ?? '').trim();
  if (normalized.includes('编程')) return Code;
  if (normalized.includes('工具')) return Database;
  return Brain;
};

export default function AdminSkillTagsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<SkillTagItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getSkillList({
        keyword: searchKeyword || undefined,
        category: selectedCategory || undefined,
        page,
        pageSize,
      })
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
      })
      .catch(() => {
        setError('加载失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchKeyword, selectedCategory, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = useMemo(
    () => Array.from(new Set(list.map((item) => (item.category ?? '').trim()).filter((item) => item.length > 0))),
    [list]
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: AdminDataTableColumn<SkillTagItem>[] = [
    {
      key: 'name',
      header: '标准名称',
      render: (item) => {
        const Icon = pickIcon(item.category);
        return (
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">{item.name}</span>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: '分类',
      render: (item) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {(item.category ?? '').trim() || '未分类'}
        </span>
      ),
    },
    {
      key: 'synonyms',
      header: '同义词',
      render: (item) => {
        const synonyms = Array.isArray(item.synonyms) ? item.synonyms : [];
        return (
          <div className="flex flex-wrap gap-1">
            {synonyms.length === 0 ? <span className="text-xs text-slate-400">无</span> : null}
            {synonyms.slice(0, 3).map((word) => (
            <span key={word} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {word}
            </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'count',
      header: '引用次数',
      className: 'text-right',
      render: (item) => <span className="text-sm font-semibold text-slate-700">{item.jobCount.toLocaleString()}</span>,
    },
  ];

  return (
    <AdminShell activeItem="skill-tags">
      <div className="w-full space-y-6">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">标签管理</h1>
            <p className="mt-1 text-sm text-slate-500">维护技能、工具等实体图谱节点，确保解析准确率。</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            新建标签
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">总标签数</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-700">{total.toLocaleString()}</span>
              <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +124 本周
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索标签..."
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300 md:col-span-2"
              />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                <Filter className="h-4 w-4" />
                筛选
              </button>
            </div>
          </article>
        </section>

        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <AdminDataTable
          columns={columns}
          rows={list}
          rowKey={(row) => row.id}
          emptyText={loading ? '加载中...' : '暂无数据'}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: total,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
          }}
        />
      </div>
    </AdminShell>
  );
}
