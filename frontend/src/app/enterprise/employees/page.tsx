'use client';

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/app/enterprise/_mock/lib/utils";
import { companyApi } from "@/lib/api/company";
import type { EnterpriseStaffListItem, EnterpriseStaffStats } from "@/lib/types/enterprise";

type StaffViewItem = EnterpriseStaffListItem & {
  name: string;
  subtitle: string;
};

function staffName(staff: EnterpriseStaffListItem): string {
  if (staff.displayName && staff.displayName.trim().length > 0) {
    return staff.displayName.trim();
  }
  if (staff.username && staff.username.trim().length > 0) {
    return staff.username.trim();
  }
  return `成员#${staff.id}`;
}

function postText(post?: string | null): string {
  if (post === "OWNER") return "管理员";
  if (post === "HR") return "HR";
  return "成员";
}

function loginText(lastLoginTime?: string | null): string {
  if (!lastLoginTime || lastLoginTime.trim().length === 0 || lastLoginTime === "-") {
    return "暂无";
  }
  return lastLoginTime;
}

function pendingTimeText(lastLoginTime?: string | null): string {
  if (!lastLoginTime || lastLoginTime.trim().length === 0 || lastLoginTime === "-") {
    return "待审批";
  }
  return lastLoginTime;
}

function safeInitial(value: string): string {
  const first = value.trim().charAt(0);
  return first || "员";
}

export default function Team() {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<StaffViewItem[]>([]);
  const [pendingStaff, setPendingStaff] = useState<EnterpriseStaffListItem[]>([]);
  const [stats, setStats] = useState<EnterpriseStaffStats>({ totalCount: 0, ownerCount: 0, hrCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingKeys, setActionLoadingKeys] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const setActionLoading = (key: string, value: boolean) => {
    setActionLoadingKeys((prev) => {
      const next = { ...prev, [key]: value };
      if (!value) {
        delete next[key];
      }
      return next;
    });
  };

  const isActionLoading = (key: string): boolean => Boolean(actionLoadingKeys[key]);

  const loadPageData = async () => {
    setLoading(true);
    setError("");
    try {
      const [staffList, statsData, pendingList] = await Promise.all([
        companyApi.getStaffList(),
        companyApi.getStaffStats(),
        companyApi.getPendingStaffList(),
      ]);

      const mappedStaff: StaffViewItem[] = (staffList ?? []).map((staff) => {
        const name = staffName(staff);
        const username = staff.username?.trim() || "未知账号";
        return {
          ...staff,
          name,
          subtitle: `${postText(staff.post)} · ${username}`,
        };
      });

      setEmployees(mappedStaff);
      setStats(statsData ?? { totalCount: 0, ownerCount: 0, hrCount: 0 });
      setPendingStaff(pendingList ?? []);
    } catch (err) {
      setEmployees([]);
      setPendingStaff([]);
      setStats({ totalCount: 0, ownerCount: 0, hrCount: 0 });
      setError(err instanceof Error ? err.message : "团队数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return employees;
    }
    return employees.filter((emp) => {
      const name = emp.name.toLowerCase();
      const subtitle = emp.subtitle.toLowerCase();
      return name.includes(keyword) || subtitle.includes(keyword);
    });
  }, [employees, search]);

  const handleToggleStatus = async (staff: StaffViewItem) => {
    const nextDisabled = staff.status !== "DISABLED";
    const key = `status-${staff.id}`;
    setActionMessage("");
    setActionLoading(key, true);
    try {
      await companyApi.updateStaffStatus(staff.id, nextDisabled);
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === staff.id
            ? {
                ...item,
                status: nextDisabled ? "DISABLED" : "ACTIVE",
              }
            : item,
        ),
      );
      setActionMessage(nextDisabled ? "成员已禁用" : "成员已启用");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setActionLoading(key, false);
    }
  };

  const handleResetPassword = async (staff: StaffViewItem) => {
    const key = `reset-${staff.id}`;
    setActionMessage("");
    setActionLoading(key, true);
    try {
      const result = await companyApi.resetStaffPassword(staff.id);
      const plain = result?.newPassword || "(未返回)";
      setActionMessage(`${staff.name} 新密码：${plain}`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "重置密码失败");
    } finally {
      setActionLoading(key, false);
    }
  };

  const handleApprove = async (staffId: number) => {
    const key = `approve-${staffId}`;
    setActionMessage("");
    setActionLoading(key, true);
    try {
      await companyApi.approveJoinRequest(staffId);
      setActionMessage("已通过加入申请");
      await loadPageData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "审批失败");
    } finally {
      setActionLoading(key, false);
    }
  };

  const handleReject = async (staffId: number) => {
    const key = `reject-${staffId}`;
    setActionMessage("");
    setActionLoading(key, true);
    try {
      await companyApi.rejectJoinRequest(staffId);
      setActionMessage("已拒绝加入申请");
      await loadPageData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "拒绝失败");
    } finally {
      setActionLoading(key, false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased pb-[140px] md:pb-8 flex flex-col h-full">
      
      <main className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto px-container-margin md:px-8 py-stack-gap-md flex flex-col gap-stack-gap-lg pb-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-end border-b border-surface-variant pb-4 sticky top-0 bg-surface z-10 pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">团队管理</h1>
          <button className="bg-primary text-on-primary h-10 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="font-label-md text-label-md font-semibold">添加新成员</span>
          </button>
        </div>

        {/* Mobile Title */}
        <h1 className="text-headline-lg font-headline-lg text-on-surface md:hidden">团队管理</h1>

        <div className="flex flex-col md:flex-row gap-stack-gap-lg items-start">
          {/* Main Content (Left on Desktop) */}
          <div className="flex-1 w-full flex flex-col gap-stack-gap-lg">
            {/* Employee List Section */}
            <section className="flex flex-col gap-stack-gap-sm">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-headline-sm font-headline-sm text-on-surface">员工列表</h2>
                <div className="relative w-48 md:w-64">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                  <input 
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant shadow-sm" 
                    placeholder="搜索姓名/职位" 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {error ? <div className="text-error text-sm">{error}</div> : null}
              {actionMessage ? <div className="text-primary text-sm">{actionMessage}</div> : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-gap-sm">
                {loading ? (
                  <div className="text-on-surface-variant py-6 col-span-full">团队数据加载中...</div>
                ) : null}
                {filtered.map(emp => (
                  <div key={emp.id} className={cn("bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm hover:shadow-md transition-shadow", emp.status === 'DISABLED' && "opacity-70 grayscale-[30%]")}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-stack-gap-sm max-w-[85%]">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-headline-lg font-headline-lg border border-outline-variant">{safeInitial(emp.name)}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-lg font-body-lg font-semibold text-on-surface truncate">{emp.name}</h3>
                            <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">{postText(emp.post)}</span>
                          </div>
                          <p className="text-label-md font-label-md text-on-surface-variant truncate">{emp.subtitle}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors shrink-0">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-label-md font-label-md text-on-surface-variant mt-1">
                      {emp.status !== 'DISABLED' ? (
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 正常</span>
                      ) : (
                         <span className="flex items-center gap-1 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> 已禁用</span>
                      )}
                      <span>最后登录: {loginText(emp.lastLoginTime)}</span>
                    </div>
                    <div className="flex gap-stack-gap-sm pt-3 mt-1 border-t border-surface-variant">
                      <button
                        aria-label={`重置密码-${emp.id}`}
                        onClick={() => handleResetPassword(emp)}
                        disabled={isActionLoading(`reset-${emp.id}`)}
                        className="flex-1 h-8 border border-outline-variant text-on-surface-variant rounded flex items-center justify-center text-label-md font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-60"
                      >
                        {isActionLoading(`reset-${emp.id}`) ? '重置中...' : '重置密码'}
                      </button>
                      {emp.status !== 'DISABLED' ? (
                        <button
                          aria-label={`禁用-${emp.id}`}
                          onClick={() => handleToggleStatus(emp)}
                          disabled={isActionLoading(`status-${emp.id}`)}
                          className="flex-1 h-8 border border-outline-variant text-error rounded flex items-center justify-center text-label-md font-label-md hover:bg-error-container transition-colors disabled:opacity-60"
                        >
                          {isActionLoading(`status-${emp.id}`) ? '处理中...' : '禁用'}
                        </button>
                      ) : (
                         <button
                           aria-label={`启用-${emp.id}`}
                           onClick={() => handleToggleStatus(emp)}
                           disabled={isActionLoading(`status-${emp.id}`)}
                           className="flex-1 h-8 border border-primary text-primary rounded flex items-center justify-center text-label-md font-label-md hover:bg-primary/10 transition-colors disabled:opacity-60"
                         >
                           {isActionLoading(`status-${emp.id}`) ? '处理中...' : '启用'}
                         </button>
                      )}
                    </div>
                  </div>
                ))}
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-10 col-span-full text-on-surface-variant font-body-md flex flex-col items-center">
                      <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">group_off</span>
                      暂无相关员工
                    </div>
                )}
              </div>
              {!loading && filtered.length > 0 && <button className="w-full py-3 mt-2 text-label-md font-label-md text-primary font-medium hover:bg-surface-container-low rounded border-dashed border transition-colors border-transparent hover:border-primary/30">已展示全部成员</button>}
            </section>
          </div>

          {/* Sidebar (Right on Desktop) */}
          <div className="w-full md:w-80 flex flex-col gap-stack-gap-lg shrink-0">
            {/* Stats Bento Grid */}
            <section className="grid grid-cols-2 gap-stack-gap-sm">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm flex flex-col gap-stack-gap-xs hover:shadow-md transition-shadow">
                <span className="text-label-md font-label-md text-on-surface-variant">企业总人数</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-lg font-headline-lg text-primary">{stats.totalCount}</span>
                  <span className="text-label-md font-label-md text-on-surface-variant">人</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm flex flex-col gap-stack-gap-xs hover:shadow-md transition-shadow">
                <span className="text-label-md font-label-md text-on-surface-variant">管理员数</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-lg font-headline-lg text-primary">{stats.ownerCount}</span>
                  <span className="text-label-md font-label-md text-on-surface-variant">人</span>
                </div>
              </div>
            </section>

            {/* Pending Approvals Section */}
            <section className="flex flex-col gap-stack-gap-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-headline-sm font-headline-sm text-on-surface">
                  待审批加入 <span className="bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded-full ml-1 align-middle">{pendingStaff.length}</span>
                </h2>
              </div>
              <div className="flex flex-col gap-stack-gap-sm">
                {pendingStaff.map((pending) => {
                  const pendingName = staffName(pending);
                  const loadingApprove = isActionLoading(`approve-${pending.id}`);
                  const loadingReject = isActionLoading(`reject-${pending.id}`);
                  return (
                    <div key={pending.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-stack-gap-sm">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm text-headline-sm">{safeInitial(pendingName)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body-md font-body-md font-semibold text-on-surface truncate">{pendingName}</h3>
                          <p className="text-label-md font-label-md text-on-surface-variant truncate">申请岗位：{postText(pending.post)}</p>
                        </div>
                        <span className="text-label-sm font-label-sm text-on-surface-variant flex-shrink-0">{pendingTimeText(pending.lastLoginTime)}</span>
                      </div>
                      <div className="flex gap-stack-gap-sm pt-2 border-t border-surface-variant">
                        <button
                          aria-label={`拒绝-${pending.id}`}
                          onClick={() => handleReject(pending.id)}
                          disabled={loadingReject || loadingApprove}
                          className="flex-1 h-9 border border-outline-variant text-on-surface rounded flex items-center justify-center text-body-md font-body-md hover:bg-surface-container-low transition-colors disabled:opacity-60"
                        >
                          {loadingReject ? '处理中...' : '拒绝'}
                        </button>
                        <button
                          aria-label={`通过-${pending.id}`}
                          onClick={() => handleApprove(pending.id)}
                          disabled={loadingApprove || loadingReject}
                          className="flex-1 h-9 bg-primary text-on-primary rounded flex items-center justify-center text-body-md font-body-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                        >
                          {loadingApprove ? '处理中...' : '通过'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!loading && pendingStaff.length === 0 ? (
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md text-on-surface-variant text-sm">暂无待审批成员</div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Add Button (Mobile) */}
      <div className="fixed bottom-[80px] left-0 right-0 px-container-margin md:hidden z-30">
        <button className="w-full h-12 bg-primary text-on-primary rounded-lg shadow-[0_4px_12px_rgba(0,102,255,0.2)] flex items-center justify-center text-body-lg font-body-lg font-semibold active:opacity-80 transition-opacity">
          <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>add</span> 添加新成员
        </button>
      </div>

    </div>
  );
}
