'use client';

import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';

export default function JobsPage() {
  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="职位管理"
        description="管理您的招聘需求与 AI 匹配进度"
        action={
          <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary-container/20 hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            发布新职位
          </button>
        }
      />
      {/* Filters & Search */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button className="px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-medium text-sm whitespace-nowrap">全部状态</button>
          <button className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap">已发布</button>
          <button className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap">审核中</button>
          <button className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap">已关闭</button>
          <button className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap">草稿</button>
        </div>
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm text-on-surface placeholder:text-outline"
            placeholder="搜索职位名称..."
            type="text"
          />
        </div>
      </div>
      {/* Bulk Actions */}
      <div className="flex gap-3 mb-4 items-center">
        <span className="text-sm font-medium text-on-surface-variant mr-2">批量操作:</span>
        <button className="px-3 py-1.5 rounded bg-surface-container-high text-primary text-sm font-medium hover:bg-surface-container-highest transition-colors">批量下架</button>
        <button className="px-3 py-1.5 rounded bg-surface-container-high text-primary text-sm font-medium hover:bg-surface-container-highest transition-colors">批量修改</button>
      </div>
      {/* Data List */}
      <div className="flex flex-col gap-4">
        {/* Item 1 - 已发布 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary-container opacity-[0.03] rounded-bl-full pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                <h3 className="text-xl font-bold font-headline text-on-surface">高级算法工程师</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] text-xs font-medium">已发布</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant mb-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">domain</span> AI 研发中心
                </div>
                <div className="flex items-center gap-1 font-medium text-primary">
                  <span className="material-symbols-outlined text-[18px]">payments</span> 40k-60k
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">schedule</span> 发布于 2天前
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs mb-1">曝光量</span>
                  <span className="font-bold text-on-surface font-headline">1,245</span>
                </div>
                <div className="w-px h-8 bg-surface-container-high"></div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs mb-1">投递数</span>
                  <span className="font-bold text-on-surface font-headline">86</span>
                </div>
                <div className="w-px h-8 bg-surface-container-high"></div>
                <div className="flex flex-col">
                  <span className="text-primary font-medium text-xs mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI 高匹配
                  </span>
                  <span className="font-bold text-primary font-headline text-lg">12</span>
                </div>
              </div>
            </div>
            <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-surface-container-high pt-4 md:pt-0 md:pl-6">
              <button className="flex-1 md:flex-none px-4 py-2 bg-primary-fixed text-on-primary-fixed text-sm font-medium rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[18px]">psychology</span> 匹配候选人
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-surface-container text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[18px]">hub</span> 职位图谱
              </button>
              <div className="flex justify-between md:justify-end gap-2 mt-auto pt-2">
                <button className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="编辑">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="刷新">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
                <button className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors" title="暂停">
                  <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Item 2 - 审核中 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow group relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                <h3 className="text-xl font-bold font-headline text-on-surface">资深产品经理</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF7E0] text-[#B06000] text-xs font-medium">审核中</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant mb-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">domain</span> 商业化团队
                </div>
                <div className="flex items-center gap-1 font-medium text-primary">
                  <span className="material-symbols-outlined text-[18px]">payments</span> 30k-45k
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">schedule</span> 提交于 4小时前
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm opacity-50">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs mb-1">曝光量</span>
                  <span className="font-bold text-on-surface font-headline">-</span>
                </div>
                <div className="w-px h-8 bg-surface-container-high"></div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs mb-1">投递数</span>
                  <span className="font-bold text-on-surface font-headline">-</span>
                </div>
              </div>
            </div>
            <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-surface-container-high pt-4 md:pt-0 md:pl-6">
              <button className="flex-1 md:flex-none px-4 py-2 bg-surface-container-high text-outline text-sm font-medium rounded-lg cursor-not-allowed opacity-50 flex items-center justify-center gap-1" disabled>
                <span className="material-symbols-outlined text-[18px]">psychology</span> 匹配候选人
              </button>
              <div className="flex justify-between md:justify-end gap-2 mt-auto pt-2">
                <button className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="编辑">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors" title="撤回">
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseContent>
  );
}
