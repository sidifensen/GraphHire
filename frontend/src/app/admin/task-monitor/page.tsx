'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminTaskMonitorPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="task-monitor" />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-surface">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">任务监控</h2>
                <p className="text-on-surface-variant font-body text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                  AI 处理引擎实时监控中
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-lg bg-surface-container-highest text-primary font-semibold text-sm transition-all hover:bg-surface-tint/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  刷新数据
                </button>
                <button className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm transition-all hover:opacity-90 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  批量重试
                </button>
              </div>
            </div>

            {/* Status Bento Grid */}
            <div className="grid grid-cols-4 gap-6">
              {/* Pending */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-surface-variant font-medium">待处理</span>
                  <span className="material-symbols-outlined text-outline">pending_actions</span>
                </div>
                <div className="text-4xl font-headline font-bold text-on-surface">2</div>
              </div>
              {/* Processing */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary font-medium">处理中</span>
                  <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                </div>
                <div className="text-4xl font-headline font-bold text-primary">15</div>
              </div>
              {/* Success (Highlight) */}
              <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between col-span-1 relative overflow-hidden">
                {/* Decorative gradient blob */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-on-surface font-medium">成功</span>
                  <span className="material-symbols-outlined text-secondary-container">check_circle</span>
                </div>
                <div className="text-4xl font-headline font-bold text-on-surface relative z-10">1,240</div>
              </div>
              {/* Failed (Critical) */}
              <div className="bg-error-container p-6 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-error-container font-medium">失败</span>
                  <span className="material-symbols-outlined text-error icon-fill">error</span>
                </div>
                <div className="text-4xl font-headline font-bold text-error">5</div>
              </div>
            </div>

            {/* Task List Section */}
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4">最近运行任务</h3>
              <div className="flex flex-col gap-3">
                {/* List Item: Failed (High Priority) */}
                <div className="bg-error-container/20 p-5 rounded-xl flex items-start gap-4 transition-all hover:bg-error-container/30">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-error icon-fill">warning</span>
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">任务 ID</span>
                      <span className="font-mono text-sm font-semibold text-on-surface">TSK-8921A</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">任务类型</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant">简历 AI 解析</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">关联对象</span>
                      <span className="text-sm font-medium text-on-surface truncate">候选人_张三_前端.pdf</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">耗时 / 重试</span>
                      <div className="text-sm text-on-surface">12.5s <span className="text-outline mx-1">|</span> 3次</div>
                    </div>
                    <div className="col-span-4 text-right">
                      <button className="text-sm font-semibold text-primary hover:text-primary-container mr-4 transition-colors">立即重试</button>
                      <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">查看详情</button>
                    </div>
                    {/* Error Log Sub-row */}
                    <div className="col-span-12 mt-2 pt-2 flex items-start gap-2">
                      <span className="text-xs font-semibold text-error uppercase tracking-wider mt-0.5">最后失败原因:</span>
                      <p className="text-sm text-on-error-container/80 font-mono bg-error-container/50 px-3 py-1.5 rounded-md flex-1">
                        [TimeoutError] LLM API response timeout after 10000ms. Context size exceeded limit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* List Item: Processing */}
                <div className="bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
                  <div>
                    <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">任务 ID</span>
                      <span className="font-mono text-sm text-on-surface">TSK-8922B</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">任务类型</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">职位语义分析</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">关联对象</span>
                      <span className="text-sm font-medium text-on-surface truncate">资深Java架构师JD</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant block mb-1">耗时 / 重试</span>
                      <div className="text-sm text-on-surface">2.1s <span className="text-outline mx-1">|</span> 0次</div>
                    </div>
                    <div className="col-span-4 text-right">
                      <span className="text-sm font-medium text-outline mr-4">处理中...</span>
                      <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">查看详情</button>
                    </div>
                  </div>
                </div>

                {/* List Item: Success */}
                <div className="bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
                  <div>
                    <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">任务 ID</span>
                      <span className="font-mono text-sm text-on-surface-variant">TSK-8919C</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">任务类型</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant">简历 AI 解析</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">关联对象</span>
                      <span className="text-sm text-on-surface-variant truncate">李四_UI设计.docx</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">耗时 / 重试</span>
                      <div className="text-sm text-on-surface-variant">4.2s <span className="text-outline mx-1">|</span> 0次</div>
                    </div>
                    <div className="col-span-4 text-right">
                      <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">查看详情</button>
                    </div>
                  </div>
                </div>

                {/* List Item: Success */}
                <div className="bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
                  <div>
                    <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">任务 ID</span>
                      <span className="font-mono text-sm text-on-surface-variant">TSK-8918D</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">任务类型</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">职位语义分析</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">关联对象</span>
                      <span className="text-sm text-on-surface-variant truncate">产品经理_北京</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-outline block mb-1">耗时 / 重试</span>
                      <div className="text-sm text-on-surface-variant">1.8s <span className="text-outline mx-1">|</span> 1次</div>
                    </div>
                    <div className="col-span-4 text-right">
                      <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">查看详情</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}