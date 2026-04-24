'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Code, ArrowUpRight, X } from 'lucide-react';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { adminApi, type SkillTagItem } from '@/lib/api/admin';

interface TagRow {
  id: number;
  name: string;
  synonyms: string[];
  createdAt: string;
  updatedAt: string;
  icon: typeof Code;
}

type SkillTagApiLike = Omit<SkillTagItem, 'synonyms'> & {
  synonyms?: string[] | string | null;
  createTime?: string;
  updateTime?: string;
  create_time?: string;
  update_time?: string;
};

function formatDateTime(value?: string): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function normalizeSynonyms(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return [];
  }
  const text = raw.trim();
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      // Fall through to comma split.
    }
  }
  return text.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}

function pickDateValue(item: SkillTagApiLike, kind: 'created' | 'updated'): string | undefined {
  if (kind === 'created') {
    return item.createdAt ?? item.createTime ?? item.create_time;
  }
  return item.updatedAt ?? item.updateTime ?? item.update_time;
}

export default function AdminSkillTagsPage() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<TagRow[]>([]);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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
        keyword: keyword || undefined,
        page,
        pageSize,
      });
      setTotal(response.total ?? 0);
      setRows(
        (response.list ?? []).map((item: SkillTagApiLike) => ({
          id: item.id,
          name: item.name,
          synonyms: normalizeSynonyms(item.synonyms),
          createdAt: formatDateTime(pickDateValue(item, 'created')),
          updatedAt: formatDateTime(pickDateValue(item, 'updated')),
          icon: Code,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSkills();
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword]);

  const handleCreate = async () => {
    const name = window.prompt('请输入标签名称');
    if (!name?.trim()) {
      return;
    }
    await adminApi.createSkillTag({ name: name.trim() });
    await loadSkills();
  };

  const openEditModal = (tag: TagRow) => {
    setEditingTag(tag);
    setEditName(tag.name);
  };

  const closeEditModal = () => {
    if (editSaving) {
      return;
    }
    setEditingTag(null);
    setEditName('');
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTag) {
      return;
    }
    const nextName = editName.trim();
    if (!nextName) {
      return;
    }
    setEditSaving(true);
    try {
      await adminApi.updateSkillTag(editingTag.id, { name: nextName });
      closeEditModal();
      await loadSkills();
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (tag: TagRow) => {
    const confirmed = window.confirm(`确定删除标签「${tag.name}」吗？`);
    if (!confirmed) {
      return;
    }
    await adminApi.deleteSkillTag(tag.id);
    await loadSkills();
  };

  return (
    <>
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

          <div className="rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl lg:col-span-3">
            <label className="mb-1.5 block text-[10px] font-bold uppercase text-outline">搜索</label>
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="搜索标签"
              className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <AdminDataTable
          data={rows}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: total,
            pageSize,
            onPageChange: (nextPage) => setPage(nextPage),
          }}
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
              header: '同义词',
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
                </div>
              ),
            },
            { header: '创建时间', accessor: 'createdAt', className: 'text-xs text-outline whitespace-nowrap' },
            { header: '更新时间', accessor: 'updatedAt', className: 'text-xs text-outline whitespace-nowrap' },
            {
              header: '操作',
              className: 'text-center',
              accessor: (tag) => (
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(tag)}
                    className="rounded border border-outline-variant/30 px-3 py-1 text-xs font-semibold text-on-surface transition-all hover:bg-slate-100"
                    title="编辑"
                    aria-label="编辑"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(tag)}
                    className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-all hover:bg-red-50"
                    title="删除"
                    aria-label="删除"
                  >
                    删除
                  </button>
                </div>
              ),
            },
          ]}
        />
        {loading ? <p className="text-xs text-outline">加载中...</p> : null}
      </div>

      {editingTag ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">编辑标签</h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md p-1 text-outline transition-colors hover:bg-slate-100 hover:text-on-surface"
                aria-label="关闭编辑弹窗"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(event) => void handleEditSubmit(event)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-outline">标签名称</label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="请输入标签名称"
                  className="w-full rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-outline transition-colors hover:bg-slate-100"
                  disabled={editSaving}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  disabled={editSaving || !editName.trim()}
                >
                  {editSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
