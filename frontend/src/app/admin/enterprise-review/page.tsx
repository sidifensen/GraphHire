'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type CompanyAuthItem } from '@/lib/api/admin';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL: '全部',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-primary-fixed text-on-primary-fixed',
  REJECTED: 'bg-error-container text-on-error-container',
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
    } else {
      setSelected(list.map((item) => item.id));
    }
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
    await load();
    setSelected([]);
  };

  const handleBatchReject = async () => {
    if (selected.length === 0) return;
    const reason = window.prompt('请输入批量拒绝原因');
    if (!reason?.trim()) return;
    await adminApi.batchRejectCompanies({ ids: selected, reason: reason.trim() });
    await load();
    setSelected([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="ml-64 flex flex-col min-h-screen">
      <AdminSidebar activeItem="enterprise-review" />

      {/* Main Content Wrapper */}
      <div className="flex flex-col min-h-screen">
        <AdminHeader />

        {/* Canvas (Main Scrollable Content) */}
        <main className="flex-1 p-8 pb-16 bg-surface">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">企业审核</h1>
            <p className="text-on-surface-variant font-body">对注册企业进行资质审核与认证管理。</p>
          </div>

          {/* Filter Section */}
          <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[280px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
                <input
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-outline border-none rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  placeholder="搜索企业名称、信用代码..."
                  type="text"
                  value={keyword}
                  onChange={handleSearch}
                />
              </div>
              {/* Status Filter */}
              <div className="relative min-w-[160px]">
                <select
                  className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <option value="ALL">全部</option>
                  <option value="PENDING">待审核</option>
                  <option value="APPROVED">已通过</option>
                  <option value="REJECTED">已拒绝</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Batch Actions */}
          {selected.length > 0 && (
            <div className="bg-primary-container rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
              <span className="text-on-primary-container font-medium">
                已选择 {selected.length} 项
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBatchApprove}
                  className="text-sm font-medium text-white bg-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors"
                >
                  批量通过
                </button>
                <button
                  onClick={handleBatchReject}
                  className="text-sm font-medium text-error hover:bg-error-container px-4 py-2 rounded-lg transition-colors"
                >
                  批量拒绝
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-4 bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider items-center">
              <div className="flex items-center justify-center">
                <input
                  className="w-4 h-4 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/20 cursor-pointer"
                  type="checkbox"
                  checked={list.length > 0 && selected.length === list.length}
                  onChange={toggleAll}
                />
              </div>
              <div>企业信息</div>
              <div>联系人</div>
              <div>注册时间</div>
              <div>状态</div>
              <div className="text-right">操作</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl animate-spin mb-2">progress_activity</span>
                <span>加载中...</span>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 text-error">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <span>{error}</span>
                <button
                  onClick={() => void load()}
                  className="mt-4 text-sm font-medium text-primary hover:text-primary-container px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
                >
                  重试
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && list.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <span>暂无数据</span>
              </div>
            )}

            {/* Table Rows */}
            {!loading && !error && list.length > 0 && (
              <div className="flex flex-col">
                {list.map((item) => {
                  const avatarChar = item.companyName.charAt(0);
                  const isSelected = selectedSet.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group ${isSelected ? 'bg-primary-container/20' : ''}`}
                    >
                      <div className="flex items-center justify-center">
                        <input
                          className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer"
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(item.id)}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
                          {avatarChar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-sm">{item.companyName}</span>
                          <span className="text-xs text-outline mt-0.5 font-mono">{item.unifiedSocialCreditCode}</span>
                        </div>
                      </div>
                      <div className="text-sm text-on-surface-variant font-medium">
                        {item.legalPerson} · {item.phone}
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        {new Date(item.submittedAt).toLocaleDateString('zh-CN')}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status] || 'bg-surface-container text-on-surface'}`}>
                          {STATUS_LABELS[item.status as StatusFilter] || item.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => void handleApprove(item.id)}
                              className="text-sm font-medium text-white bg-primary hover:bg-primary-container px-3 py-1.5 rounded-lg transition-colors"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => void handleReject(item.id)}
                              className="text-sm font-medium text-error hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors"
                            >
                              拒绝
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => void handleApprove(item.id)}
                            className="text-sm font-medium text-primary hover:text-primary-container px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
                          >
                            重新审核
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && list.length > 0 && (
              <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-sm text-on-surface-variant">
                <span>显示 {startItem} 至 {endItem} 项，共 {total} 项</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${page === pageNum ? 'bg-primary text-white font-medium' : 'hover:bg-surface-container'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}