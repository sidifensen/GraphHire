'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopNavBar } from '@/components/layout/top-navbar';
import { Icon } from '@/components/layout/icons';
import { companyApi, type CompanyStaff } from '@/lib/api/company';
import { authStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const roleLabelMap: Record<CompanyStaff['role'], string> = {
  ADMIN: '管理员',
  HR: 'HR',
  VIEWER: '只读成员',
};

const statusLabelMap: Record<CompanyStaff['status'], string> = {
  ACTIVE: '在职',
  DISABLED: '已停用',
};

export default function CompanyEmployeePage() {
  const user = authStore((state) => state.user);
  const [staffList, setStaffList] = useState<CompanyStaff[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const companyId = useMemo(() => {
    if (!user || user.type !== 'COMPANY') {
      return null;
    }

    const normalizedId = Number(user.id);
    return Number.isFinite(normalizedId) ? normalizedId : null;
  }, [user]);

  const loadStaffList = useCallback(async () => {
    if (!companyId) {
      setStaffList([]);
      setLoadState('error');
      setError('当前账号不是企业用户，无法查看员工列表。');
      return;
    }

    setLoadState('loading');
    setError(null);

    try {
      const data = await companyApi.getStaffList(companyId);
      setStaffList(data);
      setLoadState('success');
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setLoadState('error');
      setError('员工列表加载失败，请稍后重试。');
    }
  }, [companyId]);

  useEffect(() => {
    void loadStaffList();
  }, [loadStaffList]);

  const handleDisable = useCallback(
    async (staffId: number) => {
      setPendingId(staffId);
      setError(null);

      try {
        await companyApi.disableStaff(staffId);
        await loadStaffList();
      } catch (err) {
        console.error('Failed to disable staff:', err);
        setError('停用员工失败，请稍后重试。');
      } finally {
        setPendingId(null);
      }
    },
    [loadStaffList]
  );

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNavBar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-[0px_10px_30px_rgba(19,27,46,0.08)] border border-outline-variant/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Company Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-on-surface">员工管理</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                查看企业账号下的成员信息，并对异常账号执行停用操作。
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadStaffList()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loadState === 'loading' || pendingId !== null}
            >
              <Icon name="refresh" className="text-lg" />
              刷新列表
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-container-lowest shadow-[0px_10px_30px_rgba(19,27,46,0.08)] border border-outline-variant/20 overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">员工列表</h2>
              <p className="mt-1 text-sm text-on-surface-variant">共 {staffList.length} 位成员</p>
            </div>
            {loadState === 'loading' && (
              <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                <Icon name="progress_activity" className="animate-spin text-lg" />
                正在同步...
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-6 flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
              <Icon name="error" className="mt-0.5 text-lg" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto px-6 py-6">
            <table className="min-w-full divide-y divide-outline-variant/15 text-left">
              <thead>
                <tr className="text-sm text-on-surface-variant">
                  <th className="pb-3 pr-4 font-medium">姓名</th>
                  <th className="pb-3 pr-4 font-medium">邮箱</th>
                  <th className="pb-3 pr-4 font-medium">手机号</th>
                  <th className="pb-3 pr-4 font-medium">角色</th>
                  <th className="pb-3 pr-4 font-medium">状态</th>
                  <th className="pb-3 pr-4 font-medium">加入时间</th>
                  <th className="pb-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {staffList.length === 0 && loadState !== 'loading' ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-on-surface-variant">
                      暂无员工数据。
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => {
                    const disablePending = pendingId === staff.id;
                    const disabled = staff.status === 'DISABLED' || disablePending;

                    return (
                      <tr key={staff.id} className="text-sm text-on-surface">
                        <td className="py-4 pr-4 font-medium">{staff.name}</td>
                        <td className="py-4 pr-4 text-on-surface-variant">{staff.email}</td>
                        <td className="py-4 pr-4 text-on-surface-variant">{staff.phone}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface">
                            {roleLabelMap[staff.role]}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                              staff.status === 'ACTIVE'
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-outline-variant/30 text-on-surface-variant'
                            )}
                          >
                            {statusLabelMap[staff.status]}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-on-surface-variant">
                          {new Date(staff.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void handleDisable(staff.id)}
                            disabled={disabled}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2 text-xs font-medium text-on-surface transition hover:border-error/40 hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Icon name="block" className="text-base" />
                            {staff.status === 'DISABLED' ? '已停用' : disablePending ? '停用中...' : '停用账号'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
