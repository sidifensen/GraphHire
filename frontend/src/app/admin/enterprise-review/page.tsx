'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type CompanyAuthItem } from '@/lib/api/admin';

export default function AdminEnterpriseReviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<CompanyAuthItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCompanyAuthList({ page: 1, pageSize: 10 });
      setList(res.list);
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const onApprove = async (id: number) => {
    await adminApi.updateCompanyAuth(id, { status: 'APPROVED' });
  };

  const onReject = async (id: number) => {
    const reason = window.prompt('请输入拒绝原因') ?? '';
    if (!reason) return;
    await adminApi.updateCompanyAuth(id, { status: 'REJECTED', rejectReason: reason });
  };

  const onBatchApprove = async () => {
    if (selected.length === 0) return;
    await adminApi.batchApproveCompanies({ ids: selected });
  };

  const onBatchReject = async () => {
    if (selected.length === 0) return;
    const reason = window.prompt('请输入批量拒绝原因') ?? '';
    if (!reason) return;
    await adminApi.batchRejectCompanies({ ids: selected, reason });
  };

  return (
    <div className="ml-64 flex flex-col min-h-screen">
      <AdminSidebar activeItem="enterprise-review" />
      <div className="flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-8 bg-surface space-y-4">
          <h1 className="text-2xl font-bold">企业审核</h1>

          <div className="flex gap-2">
            <button onClick={onBatchApprove}>批量通过</button>
            <button onClick={onBatchReject}>批量拒绝</button>
          </div>

          {loading && <p>加载中...</p>}
          {!loading && error && <p>{error}</p>}

          {!loading && !error && (
            <div className="space-y-2">
              {list.map((item) => (
                <div key={item.id} className="border rounded p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      aria-label={`select-${item.id}`}
                      checked={selectedSet.has(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <div>
                      <p>{item.companyName}</p>
                      <p>{item.unifiedSocialCreditCode}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onApprove(item.id)}>通过</button>
                    <button onClick={() => onReject(item.id)}>拒绝</button>
                  </div>
                </div>
              ))}

              {list.length === 0 && <p>暂无数据</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
