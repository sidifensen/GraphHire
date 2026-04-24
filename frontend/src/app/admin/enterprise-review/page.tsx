'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Download, Network, Search } from 'lucide-react';
import { adminApi, type CompanyAuthItem } from '@/lib/api/admin';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable, { type AdminDataTableColumn } from '@/components/admin/AdminDataTable';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_STYLES: Record<StatusFilter | 'UNKNOWN', string> = {
  ALL: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  UNKNOWN: 'bg-slate-100 text-slate-700',
};

export default function AdminEnterpriseReviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<CompanyAuthItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const pendingCount = list.filter((item) => item.status === 'PENDING').length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, pageSize };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (keyword.trim()) params.keyword = keyword.trim();
      const res = await adminApi.getCompanyAuthList(params);
      setList(res.list);
      setTotal(res.total);
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const handleApprove = async (id: number) => {
    await adminApi.updateCompanyAuth(id, { status: 'APPROVED' });
    await load();
    setSelected((prev) => prev.filter((v) => v !== id));
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('请输入拒绝原因');
    if (!reason?.trim()) return;
    await adminApi.updateCompanyAuth(id, { status: 'REJECTED', rejectReason: reason.trim() });
    await load();
    setSelected((prev) => prev.filter((v) => v !== id));
  };

  const handleBatchApprove = async () => {
    if (selected.length === 0) return;
    await adminApi.batchApproveCompanies({ ids: selected });
    setSelected([]);
    await load();
  };

  const handleBatchReject = async () => {
    if (selected.length === 0) return;
    const reason = window.prompt('请输入批量拒绝原因');
    if (!reason?.trim()) return;
    await adminApi.batchRejectCompanies({ ids: selected, reason: reason.trim() });
    setSelected([]);
    await load();
  };

  const columns: AdminDataTableColumn<CompanyAuthItem>[] = [
    {
      key: 'checkbox',
      header: '',
      className: 'w-14',
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
      key: 'company',
      header: '企业名称',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-700">
            {item.companyName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.companyName}</p>
            <p className="text-[11px] text-slate-500">{item.unifiedSocialCreditCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: '联系人',
      render: (item) => (
        <div>
          <p className="text-sm text-slate-700">{item.legalPerson}</p>
          <p className="text-xs text-slate-500">{item.phone}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: '申请时间',
      render: (item) => <span className="text-sm text-slate-600">{new Date(item.submittedAt).toLocaleString('zh-CN')}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status as StatusFilter] ?? STATUS_STYLES.UNKNOWN}`}>
          {item.status === 'PENDING' ? '待审核' : item.status === 'APPROVED' ? '已通过' : '已拒绝'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === 'PENDING' ? (
            <>
              <button onClick={() => void handleApprove(item.id)} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                通过
              </button>
              <button onClick={() => void handleReject(item.id)} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600">
                拒绝
              </button>
            </>
          ) : (
            <button onClick={() => void handleApprove(item.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
              重新审核
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell activeItem="enterprise-review">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">企业审核</h1>
            <p className="mt-1 text-sm text-slate-500">管理和审批入驻企业资质与账号信息</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            <Download className="h-4 w-4" />
            导出报表
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">待审核企业</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Network className="h-5 w-5" />
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">今日已处理</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{Math.max(0, list.length - pendingCount)}</p>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">高风险拦截</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{list.filter((item) => item.status === 'REJECTED').length}</p>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700"
                >
                  <option value="ALL">全部</option>
                  <option value="PENDING">待审核</option>
                  <option value="APPROVED">已通过</option>
                  <option value="REJECTED">已拒绝</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索企业..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-300"
              />
            </div>
          </div>
        </section>

        {selected.length > 0 ? (
          <section className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <span className="text-sm text-blue-800">已选择 {selected.length} 项</span>
            <div className="flex items-center gap-2">
              <button onClick={() => void handleBatchApprove()} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                批量通过
              </button>
              <button onClick={() => void handleBatchReject()} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600">
                批量拒绝
              </button>
            </div>
          </section>
        ) : null}

        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <AdminDataTable
          columns={[
            {
              key: 'select-all',
              header: '',
              className: 'w-14',
              render: () => (
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={list.length > 0 && selected.length === list.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </div>
              ),
            },
            ...columns.slice(1),
          ]}
          rows={list}
          rowKey={(row) => row.id}
          emptyText={loading ? '加载中...' : '暂无数据'}
          pagination={{
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
            totalItems: total,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(Math.max(1, Math.ceil(total / pageSize)), p + 1)),
          }}
        />
      </div>
    </AdminShell>
  );
}
