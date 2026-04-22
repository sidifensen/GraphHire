'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type UserItem, type UserDetailResponse } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Modal State
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<UserDetailResponse | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

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
  }, [page, typeFilter, statusFilter, keyword]);

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

  const disableOne = async (user: UserItem) => {
    const newStatus = user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    await adminApi.updateUserStatus(user.id, newStatus);
    await load();
  };

  const batchDisable = async () => {
    if (selected.length === 0) return;
    await adminApi.batchDisableUsers({ userIds: selected });
    setSelected([]);
    await load();
  };

  const totalPages = Math.ceil(total / pageSize);

  const getTypeBadge = (type: string) => {
    if (type === 'PERSON') {
      return <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-2">个人</span>;
    }
    if (type === 'COMPANY') {
      return <span className="text-xs font-normal text-secondary bg-secondary-fixed px-1.5 py-0.5 rounded ml-2">企业联系人</span>;
    }
    if (type === 'ADMIN') {
      return <span className="text-xs font-normal text-tertiary bg-tertiary-fixed px-1.5 py-0.5 rounded ml-2">管理员</span>;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">正常</span>;
    }
    if (status === 'DISABLED') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-semibold">禁用</span>;
    }
    if (status === 'LOCKED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span> 锁定
        </span>
      );
    }
    return null;
  };

  const getAvatarInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '从未登录';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚登录';
    if (diffMins < 60) return `${diffMins} 分钟前登录`;
    if (diffHours < 24) return `${diffHours} 小时前登录`;
    if (diffDays < 30) return `${diffDays} 天前登录`;
    return formatDate(dateStr);
  };

  // ============ Detail Modal Helpers ============
  const getGenderLabel = (gender: number) => {
    if (gender === 1) return '男';
    if (gender === 2) return '女';
    return '未知';
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-';
    return `${(salary / 1000).toFixed(0)}K-${((salary + 10000) / 1000).toFixed(0)}K / 月`;
  };

  const openDetail = async (userId: number) => {
    setDetailUserId(userId);
    setShowDetail(true);
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

  const closeDetail = () => {
    setShowDetail(false);
    setDetailUserId(null);
    setDetailData(null);
    setDetailError(null);
  };

  return (
    <div className="ml-64 flex flex-col min-h-screen">
      <AdminSidebar activeItem="users" />

      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        <AdminHeader />

        {/* Canvas */}
        <div className="p-8 lg:p-12 flex-1 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary mb-2">用户治理与分析</h2>
              <p className="text-on-surface-variant text-sm max-w-2xl">对平台全量用户进行维度筛选、状态管控及行为追踪，以维护图谱生态的健康度。</p>
            </div>
          </div>

          {/* Filter & Action Center */}
          <section className="bg-surface-container-low rounded-[1.5rem] p-6 flex flex-col gap-6">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[280px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
                <input
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline border-none rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  placeholder="搜索用户 ID、昵称或手机号..."
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              {/* User Type */}
              <div className="relative min-w-[160px]">
                <select
                  className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">所有用户类型</option>
                  <option value="PERSON">个人用户</option>
                  <option value="COMPANY">企业联系人</option>
                  <option value="ADMIN">管理员</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
              {/* Status */}
              <div className="relative min-w-[160px]">
                <select
                  className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">所有账号状态</option>
                  <option value="ACTIVE">正常</option>
                  <option value="DISABLED">禁用</option>
                  <option value="LOCKED">锁定</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
            {/* Batch Actions Row */}
            <div className="flex items-center gap-3 pt-4 border-t bg-surface-container rounded-xl px-4 py-3 mt-2">
              <span className="text-sm font-medium text-on-surface-variant flex-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">checklist</span>
                已选择 <span className="font-bold text-primary">{selected.length}</span> 项
              </span>
              <button
                className="bg-surface-container-high hover:bg-surface-dim text-primary font-medium text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={batchDisable}
                disabled={selected.length === 0}
              >
                <span className="material-symbols-outlined text-[18px]">block</span>
                批量禁用
              </button>
              <button className="bg-surface-container-highest hover:bg-surface-dim text-on-surface font-medium text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2" disabled>
                <span className="material-symbols-outlined text-[18px]">download</span>
                批量导出
              </button>
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
                <p className="text-on-surface-variant">加载中...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-5xl text-error">error</span>
                <p className="text-error">{error}</p>
                <button
                  className="bg-primary text-white px-5 py-2.5 rounded-lg"
                  onClick={() => void load()}
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {/* User Data Grid */}
          {!loading && !error && (
            <section className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden flex flex-col relative z-10">
              {/* Data Header */}
              <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-4 bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider items-center">
                <div className="flex items-center justify-center">
                  <input
                    className="w-4 h-4 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/20 cursor-pointer"
                    type="checkbox"
                    checked={list.length > 0 && selected.length === list.length}
                    onChange={toggleAll}
                  />
                </div>
                <div>用户信息 (User Profile)</div>
                <div>联系方式 (Contact)</div>
                <div>时间节点 (Timeline)</div>
                <div>状态 (Status)</div>
                <div className="text-right">操作 (Actions)</div>
              </div>
              {/* Data Rows */}
              <div className="flex flex-col">
                {list.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl mb-4">person_off</span>
                    <p>暂无数据</p>
                  </div>
                )}
                {list.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <input
                        className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer"
                        type="checkbox"
                        checked={selectedSet.has(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-lg">
                        {getAvatarInitial(item.realName || item.username)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface text-sm">
                          {item.realName || item.username}
                          {getTypeBadge(item.type)}
                        </span>
                        <span className="text-xs text-outline mt-0.5 font-mono">UID: GH-{item.id.toString().padStart(5, '0')}</span>
                      </div>
                    </div>
                    <div className="text-sm text-on-surface-variant font-medium">{item.phone || item.email || '-'}</div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'} 注册
                      </span>
                      <span className="text-xs text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">login</span> {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString('zh-CN') : '从未登录'}
                      </span>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container"
                        onClick={() => openDetail(item.id)}
                      >
                        <span className="material-symbols-outlined text-[18px] mr-1">info</span>
                        详情
                      </button>
                      {item.status === 'LOCKED' && (
                        <button
                          className="text-sm font-medium text-error hover:text-[#93000a] transition-colors px-3 py-1.5 rounded-lg hover:bg-error-container/50"
                          onClick={() => void disableOne(item)}
                        >
                          解锁
                        </button>
                      )}
                      {item.status === 'DISABLED' && (
                        <button
                          className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container"
                          onClick={() => void disableOne(item)}
                        >
                          启用
                        </button>
                      )}
                      {item.status === 'ACTIVE' && (
                        <button
                          className="text-sm font-medium text-tertiary hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container"
                          onClick={() => void disableOne(item)}
                        >
                          禁用
                        </button>
                      )}
                      <button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">
                        重置密码
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {!loading && list.length > 0 && (
                <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-sm text-on-surface-variant">
                  <span>显示 {(page - 1) * pageSize + 1} 至 {Math.min(page * pageSize, total)} 项，共 {total} 项</span>
                  <div className="flex gap-1">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (page > 3) {
                          pageNum = page - 2 + i;
                          if (pageNum > totalPages) return null;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-primary text-white font-medium'
                              : 'hover:bg-surface-container'
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && page < totalPages - 2 && (
                      <span className="w-8 h-8 flex items-center justify-center">...</span>
                    )}
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={closeDetail} />
            {/* Modal */}
            <div className="relative bg-surface-container-low rounded-[1.5rem] w-[560px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-lg">
                    {(detailData?.personInfo?.realName || detailData?.user?.username)?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-on-surface text-lg">{detailData?.personInfo?.realName || detailData?.user?.username}</span>
                      <span className="text-xs font-mono text-outline">GH-{detailUserId?.toString().padStart(5, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">
                        {detailData?.user?.type === 'PERSON' ? '个人用户' : detailData?.user?.type === 'COMPANY' ? '企业联系人' : '管理员'}
                      </span>
                      <span className="text-xs text-outline">·</span>
                      <span className="text-xs text-on-surface-variant">
                        {detailData?.user?.status === 'ACTIVE' ? '正常' : detailData?.user?.status === 'DISABLED' ? '禁用' : '锁定'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
                  onClick={closeDetail}
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Loading State */}
                {detailLoading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
                      <p className="text-on-surface-variant">加载中...</p>
                    </div>
                  </div>
                )}
                {/* Error State */}
                {!detailLoading && detailError && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
                    <p className="text-error mb-4">{detailError}</p>
                    <button
                      className="bg-primary text-white px-5 py-2.5 rounded-lg"
                      onClick={() => detailUserId && openDetail(detailUserId)}
                    >
                      重试
                    </button>
                  </div>
                )}
                {/* No PersonInfo Data */}
                {!detailLoading && !detailError && detailData && detailData.personInfo === null && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <span className="material-symbols-outlined text-5xl text-outline mb-4">person_off</span>
                    <p className="text-on-surface-variant">暂无个人信息</p>
                  </div>
                )}
                {/* Detail Content */}
                {!detailLoading && !detailError && detailData && detailData.personInfo && (
                  <div className="flex flex-col gap-6">
                    {/* 个人信息 */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">个人信息</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-surface-container-low rounded-xl px-4 py-3">
                          <div className="text-xs text-outline mb-1">性别</div>
                          <div className="text-sm font-medium text-on-surface">{getGenderLabel(detailData.personInfo.gender)}</div>
                        </div>
                        <div className="bg-surface-container-low rounded-xl px-4 py-3">
                          <div className="text-xs text-outline mb-1">年龄</div>
                          <div className="text-sm font-medium text-on-surface">{detailData.personInfo.age}岁</div>
                        </div>
                        <div className="bg-surface-container-low rounded-xl px-4 py-3">
                          <div className="text-xs text-outline mb-1">学历</div>
                          <div className="text-sm font-medium text-on-surface truncate">{detailData.personInfo.education || '-'}</div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">手机</div>
                        <div className="text-sm font-medium text-on-surface">{maskPhone(detailData.personInfo.phone)}</div>
                      </div>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">邮箱</div>
                        <div className="text-sm font-medium text-on-surface truncate">{detailData.personInfo.email || '-'}</div>
                      </div>
                    </div>
                    {/* 求职意向 */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">求职意向</h3>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">目标城市</div>
                        <div className="text-sm font-medium text-on-surface">{detailData.personInfo.targetCity || '-'}</div>
                      </div>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">期望薪资</div>
                        <div className="text-sm font-medium text-on-surface">{formatSalary(detailData.personInfo.expectedSalary)}</div>
                      </div>
                    </div>
                    {/* 账号信息 */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">账号信息</h3>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">注册时间</div>
                        <div className="text-sm font-medium text-on-surface">
                          {detailData.user.createdAt ? new Date(detailData.user.createdAt).toLocaleDateString('zh-CN') : '-'}
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-xl px-4 py-3">
                        <div className="text-xs text-outline mb-1">最后登录</div>
                        <div className="text-sm font-medium text-on-surface">
                          {detailData.user.lastLoginAt
                            ? new Date(detailData.user.lastLoginAt).toLocaleString('zh-CN')
                            : '从未登录'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}