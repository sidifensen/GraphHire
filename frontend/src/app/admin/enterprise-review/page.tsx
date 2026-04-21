'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminEnterpriseReviewPage() {
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
                />
              </div>
              {/* Status Filter */}
              <div className="relative min-w-[160px]">
                <select className="w-full appearance-none bg-surface-container-lowest text-on-surface border-none rounded-xl px-4 py-3.5 text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-shadow font-medium cursor-pointer">
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-4 bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider items-center">
              <div className="flex items-center justify-center">
                <input className="w-4 h-4 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
              </div>
              <div>企业信息</div>
              <div>联系人</div>
              <div>注册时间</div>
              <div>状态</div>
              <div className="text-right">操作</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {/* Row 1: Pending */}
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
                    科
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">科技集团</span>
                    <span className="text-xs text-outline mt-0.5 font-mono">91110000MA01XXXX1</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">
                  张经理 · 138-0013-8000
                </div>
                <div className="text-sm text-on-surface-variant">
                  2024-03-15
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    待审核
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-white bg-primary hover:bg-primary-container px-3 py-1.5 rounded-lg transition-colors">通过</button>
                  <button className="text-sm font-medium text-error hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors">拒绝</button>
                </div>
              </div>

              {/* Row 2: Approved */}
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center bg-surface-container-low/10 hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold">
                    云
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">云计算有限公司</span>
                    <span className="text-xs text-outline mt-0.5 font-mono">91110000MA02YYYY2</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">
                  李总监 · 139-5522-1992
                </div>
                <div className="text-sm text-on-surface-variant">
                  2024-02-28
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                    已通过
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-tertiary hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors">查看</button>
                </div>
              </div>

              {/* Row 3: Rejected */}
              <div className="grid grid-cols-[48px_2fr_1fr_1fr_100px_180px] gap-4 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group">
                <div className="flex items-center justify-center">
                  <input className="w-4 h-4 rounded border-none bg-surface-container text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-error-container flex items-center justify-center text-error font-bold">
                    数据
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">数据服务有限公司</span>
                    <span className="text-xs text-outline mt-0.5 font-mono">91110000MA03ZZZZ3</span>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium">
                  王总 · 186-0099-2233
                </div>
                <div className="text-sm text-on-surface-variant">
                  2024-03-01
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold">
                    已拒绝
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm font-medium text-primary hover:text-primary-container px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors">重新审核</button>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-sm text-on-surface-variant">
              <span>显示 1 至 3 项，共 45 项</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">3</button>
                <span className="w-8 h-8 flex items-center justify-center">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}