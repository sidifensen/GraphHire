'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { adminApi, type UserDetailResponse, type UserItem } from '@/lib/api/admin';
import AdminShell from '@/components/admin/AdminShell';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminDataTable, { type AdminDataTableColumn } from '@/components/admin/AdminDataTable';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<UserDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUserList({
        page,
        pageSize,
        keyword: keyword || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setList(res.list);
      setTotal(res.total);
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, pageSize, keyword, typeFilter, statusFilter]);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selected.length === list.length) {
      setSelected([]);
      return;
    }
    setSelected(list.map((item) => item.id));
  };

  const disableOne = async (user: UserItem) => {
    const nextStatus = user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    await adminApi.updateUserStatus(user.id, nextStatus);
    await load();
  };

  const batchDisable = async () => {
    if (selected.length === 0) return;
    await adminApi.batchDisableUsers({ userIds: selected });
    setSelected([]);
    await load();
  };

  const openDetail = async (userId: number) => {
    setShowDetail(true);
    setDetailUserId(userId);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);
    try {
      const res = await adminApi.getUserDetail(userId);
      setDetailData(res);
    } catch {
      setDetailError('加载详情失败，请重试');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: UserItem['status']) => {
    if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700';
    if (status === 'LOCKED') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  const columns: AdminDataTableColumn<UserItem>[] = [
    {
      key: 'select',
      header: '选择',
      className: 'w-16',
      render: (item) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedSet.has(item.id)}
            onChange={() => toggle(item.id)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </div>
      ),
    },
    {
      key: 'profile',
      header: '姓名/职位',
      render: (item) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.realName || item.username}</p>
          <p className="text-[11px] text-slate-500">UID: GH-{item.id.toString().padStart(5, '0')}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: '账号/联系方式',
      render: (item) => (
        <div>
          <p className="text-sm text-slate-700">{item.email || '-'}</p>
          <p className="text-[11px] text-slate-500">{item.phone || '-'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: '用户类型',
      render: (item) => (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          {item.type === 'PERSON' ? '求职者' : item.type === 'COMPANY' ? '企业HR' : '管理员'}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (item) => <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadge(item.status)}`}>{item.status === 'ACTIVE' ? '活跃' : item.status === 'LOCKED' ? '锁定' : '禁用'}</span>,
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600" onClick={() => void openDetail(item.id)}>
            详情
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700" onClick={() => void disableOne(item)}>
            {item.status === 'DISABLED' ? '启用' : '禁用'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell activeItem="users">
      <AdminTopbar searchPlaceholder="搜索用户..." />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理系统注册用户及求职者资料</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700"
                >
                  <option value="all">全部用户类型</option>
                  <option value="PERSON">求职者</option>
                  <option value="COMPANY">企业HR</option>
                  <option value="ADMIN">管理员</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700"
                >
                  <option value="all">全部状态</option>
                  <option value="ACTIVE">活跃</option>
                  <option value="DISABLED">禁用</option>
                  <option value="LOCKED">锁定</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-300"
                placeholder="搜索姓名、账号或联系方式"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            已选择 <span className="font-semibold text-blue-700">{selected.length}</span> 项
            <button
              className="ml-3 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
              onClick={() => void batchDisable()}
              disabled={selected.length === 0}
            >
              批量禁用
            </button>
            <button className="ml-2 rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600" onClick={toggleAll}>
              全选当前页
            </button>
          </div>
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

      {showDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button className="absolute inset-0 bg-black/40" onClick={() => setShowDetail(false)} aria-label="close-backdrop" />
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">用户详情</h2>
              <button className="text-sm text-slate-500" onClick={() => setShowDetail(false)}>
                关闭
              </button>
            </div>
            {detailLoading ? <p className="text-sm text-slate-500">加载中...</p> : null}
            {detailError ? <p className="text-sm text-rose-600">{detailError}</p> : null}
            {!detailLoading && !detailError && detailData ? (
              <div className="space-y-3 text-sm text-slate-700">
                <p>姓名：{detailData.personInfo?.realName || detailData.user.realName || detailData.user.username}</p>
                <p>手机：{detailData.personInfo?.phone || detailData.user.phone || '-'}</p>
                <p>邮箱：{detailData.personInfo?.email || detailData.user.email || '-'}</p>
                <p>用户ID：{detailUserId}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
