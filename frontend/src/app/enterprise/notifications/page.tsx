'use client';

import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';

export default function NotificationsPage() {
  return (
    <EnterpriseContent>
      <EnterprisePageHeader title="通知中心" />
      {/* Header Actions & Tabs */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex gap-2 bg-surface-container-highest p-1 rounded-lg">
          <button className="px-4 py-2 bg-surface-container-lowest text-primary font-medium rounded shadow-sm text-sm transition-colors">全部</button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-lowest/50 font-medium rounded text-sm transition-colors relative">
            新推荐
            <span className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-error rounded-full"></span>
          </button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-lowest/50 font-medium rounded text-sm transition-colors">简历投递</button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-lowest/50 font-medium rounded text-sm transition-colors">认证反馈</button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-lowest/50 font-medium rounded text-sm transition-colors">系统公告</button>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-tertiary bg-surface-container-high hover:bg-surface-variant rounded-lg transition-colors">
            <span className="material-symbols-outlined text-sm">done_all</span>
            全部标记已读
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-tertiary bg-surface-container-high hover:bg-surface-variant rounded-lg transition-colors">
            <span className="material-symbols-outlined text-sm">delete</span>
            清空已读
          </button>
        </div>
      </div>
      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {/* Item 1: Unread New Recommendation */}
        <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-5 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow relative cursor-pointer group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container rounded-l-xl"></div>
          <div className="flex-shrink-0 w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                AI 智能推荐：高级前端工程师岗位有新的高匹配度候选人
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">匹配度 98%</span>
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">10 分钟前</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              系统已为您匹配到候选人 <strong>李明</strong>，具备 5 年 React 架构经验，图谱分析显示其技术栈与岗位需求高度契合。点击查看详细认知图谱与评估报告。
            </p>
            <div className="mt-2">
              <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                查看候选人详情 <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        {/* Item 2: Read Resume Delivery */}
        <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-5 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow relative cursor-pointer group opacity-75 hover:opacity-100">
          <div className="flex-shrink-0 w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium text-on-surface group-hover:text-primary transition-colors">
                收到新的简历投递：产品经理
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">2 小时前</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              候选人王小伟通过内部推荐渠道投递了您的"高级产品经理（AI方向）"职位。简历已通过初步格式解析。
            </p>
            <div className="mt-2">
              <button className="text-sm text-tertiary font-medium flex items-center gap-1 hover:text-primary transition-colors">
                进入人才库处理 <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        {/* Item 3: System Announcement */}
        <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-5 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow relative cursor-pointer group opacity-75 hover:opacity-100">
          <div className="flex-shrink-0 w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium text-on-surface group-hover:text-primary transition-colors">
                系统升级公告：企业版知识图谱模型 V2.0 上线
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">昨天 14:30</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              尊敬的企业用户，我们已于今日凌晨完成认知计算引擎的升级。新版模型显著提升了跨行业技能的隐性关联分析能力，匹配精准度提升 15%。
            </p>
          </div>
        </div>
      </div>
    </EnterpriseContent>
  );
}
