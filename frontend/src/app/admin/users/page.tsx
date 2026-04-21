'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminUsersPage() {
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
                <input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline border-none rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow" placeholder="搜索用户 ID、昵称或手机号..." type="text"/>
              </div>
              {/* User Type */}
              <div className="relative min-w-[160px]">
                <select className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer">
                  <option value="all">所有用户类型</option>
                  <option value="individual">个人用户</option>
                  <option value="corporate">企业联系人</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
              {/* Status */}
              <div className="relative min-w-[160px]">
                <select className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer">
                  <option value="all">所有账号状态</option>
                  <option value="normal">正常 (Normal)</option>
                  <option value="disabled">禁用 (Disabled)</option>
                  <option value="locked">锁定 (Locked)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
            {/* Batch Actions Row */}
            <div className="flex items-center gap-3 pt-4 border-t bg-surface-container rounded-xl px-4 py-3 mt-2">
              <span className="text-sm font-medium text-on-surface-variant flex-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">checklist</span>
                已选择 <span className="font-bold text-primary">0</span> 项
              </span>
              <button className="bg-surface-container-high hover:bg-surface-dim text-primary font-medium text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">block</span>
                批量禁用
              </button>
              <button className="bg-surface-container-highest hover:bg-surface-dim text-on-surface font-medium text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                批量导出
              </button>
            </div>
          </section>

          {/* User Data Grid */}
          <section className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden flex flex-col relative z-10">
            {/* Data Header */}
            <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-4 bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider items-center">
              <div className="flex items-center justify-center">
                <input className="w-4 h-4 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/20 cursor-pointer" type="checkbox"/>
              </div>
              <div>用户信息 (User Profile)</div>
              <div>联系方式 (Contact)</div>
              <div>时间节点 (Timeline)</div>
              <div>状态 (Status)</div>
              <div className="text-right">操作 (Actions)</div>
            </div>
            {/* Data Rows */}
            <div className="flex flex-col">
              {/* Row 1: Normal Individual */}
              <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox"/>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-lg">林</div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">林晓月 <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-2">个人</span></span>
                    <span className="text-xs text-outline mt-0.5 font-mono">UID: GH-88201A</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">+86 138-0013-8000</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> 2023-10-12 注册</span>
                  <span className="text-xs text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">login</span> 2 小时前登录</span>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">正常</span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-tertiary hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">禁用</button>
                  <button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">重置密码</button>
                </div>
              </div>
              {/* Row 2: Disabled Corporate */}
              <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center bg-surface-container-low/10 hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox"/>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-lg opacity-60">张</div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">张建国 <span className="text-xs font-normal text-secondary bg-secondary-fixed px-1.5 py-0.5 rounded ml-2">企业联系人</span></span>
                    <span className="text-xs text-outline mt-0.5 font-mono">UID: GH-29384C</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">+86 139-5522-1992</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> 2022-05-01 注册</span>
                  <span className="text-xs text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">login</span> 30 天前登录</span>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-semibold">禁用</span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">启用</button>
                  <button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">重置密码</button>
                </div>
              </div>
              {/* Row 3: Locked Individual */}
              <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox"/>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-lg">W</div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">Wang_Design <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-2">个人</span></span>
                    <span className="text-xs text-outline mt-0.5 font-mono">UID: GH-99321B</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">+86 186-0099-2233</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> 2024-01-15 注册</span>
                  <span className="text-xs text-error flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> 异常登录尝试</span>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span> 锁定
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-error hover:text-[#93000a] transition-colors px-3 py-1.5 rounded-lg hover:bg-error-container/50">解锁</button>
                  <button className="text-sm font-medium text-tertiary hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">禁用</button>
                </div>
              </div>
              {/* Row 4: Normal Corporate */}
              <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox"/>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-lg">陈</div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">陈总监 <span className="text-xs font-normal text-secondary bg-secondary-fixed px-1.5 py-0.5 rounded ml-2">企业联系人</span></span>
                    <span className="text-xs text-outline mt-0.5 font-mono">UID: GH-11029D</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">+86 137-8899-0011</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> 2023-11-20 注册</span>
                  <span className="text-xs text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">login</span> 刚刚登录</span>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">正常</span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-tertiary hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">禁用</button>
                  <button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">重置密码</button>
                </div>
              </div>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-sm text-on-surface-variant">
              <span>显示 1 至 4 项，共 2,451 项</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">3</button>
                <span className="w-8 h-8 flex items-center justify-center">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}