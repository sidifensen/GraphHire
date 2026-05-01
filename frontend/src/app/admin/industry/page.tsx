'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { adminApi, type AdminIndustryItem } from '@/lib/api/admin';

export default function AdminIndustryPage() {
  const [list, setList] = useState<AdminIndustryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getIndustryList({ page, pageSize, keyword: keyword || undefined });
      setList(data.list);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, keyword]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await adminApi.createIndustry({ name: name.trim(), sortOrder, enabled: 1 });
    setShowCreate(false);
    setName('');
    setSortOrder(0);
    await load();
  };

  const toggleStatus = async (item: AdminIndustryItem) => {
    await adminApi.updateIndustryStatus(item.id, item.enabled === 1 ? 0 : 1);
    await load();
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">行业管理</h2>
          <p className="mt-1 text-sm text-outline">维护企业可选行业，支持新增、启用与停用。</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
        >
          <Plus size={18} />新增行业
        </button>
      </div>

      <div className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
        <input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          placeholder="搜索行业"
          className="w-full rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm"
        />
      </div>

      <AdminDataTable
        data={list}
        pagination={{ currentPage: page, totalPages, totalItems: total, pageSize, onPageChange: setPage }}
        columns={[
          { header: '行业名称', accessor: 'name' },
          { header: '状态', accessor: (item) => (item.enabled === 1 ? '启用' : '停用') },
          { header: '排序', accessor: (item) => String(item.sortOrder ?? 0) },
          { header: '更新时间', accessor: (item) => item.updatedAt ?? '-' },
          {
            header: '操作',
            accessor: (item) => (
              <button
                type="button"
                className="text-xs font-bold text-primary hover:underline"
                onClick={() => void toggleStatus(item)}
              >
                {item.enabled === 1 ? '停用' : '启用'}
              </button>
            ),
          },
        ]}
      />
      {loading ? <p className="text-xs text-outline">加载中...</p> : null}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={(e) => void onCreate(e)} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">新增行业</h3>
            <label className="mb-2 block text-sm">行业名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mb-4 w-full rounded border px-3 py-2" />
            <label className="mb-2 block text-sm">排序</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} className="mb-6 w-full rounded border px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-4 py-2" onClick={() => setShowCreate(false)}>取消</button>
              <button type="submit" className="rounded bg-primary px-4 py-2 text-white">保存</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
