'use client';

import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';

export default function RecommendationsPage() {
  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="智能推荐引擎"
        description="正在为您从 12,400 份简历中进行深度图谱匹配"
        action={
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-[20px]">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-sm text-sm focus:ring-0 focus:border-b-2 focus:border-primary w-64 placeholder:text-outline shadow-sm"
              placeholder="搜索候选人或技能..."
              type="text"
            />
          </div>
        }
      />
      {/* Content Layout: Two Columns */}
      <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-8 max-w-[1440px] mx-auto w-full">
        {/* Left Column: Filters */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-4">
          {/* Filter Group: Position */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline font-semibold text-on-surface mb-4 text-base">在招职位目标</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input checked className="form-radio text-primary focus:ring-primary h-4 w-4 border-outline-variant bg-surface" name="position" type="radio" />
                <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">高级前端工程师 (React)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="form-radio text-primary focus:ring-primary h-4 w-4 border-outline-variant bg-surface" name="position" type="radio" />
                <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">AI 算法工程师 (NLP)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="form-radio text-primary focus:ring-primary h-4 w-4 border-outline-variant bg-surface" name="position" type="radio" />
                <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">产品总监</span>
              </label>
            </div>
          </div>
          {/* Filter Group: Match Score */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline font-semibold text-on-surface mb-4 text-base">AI 认知匹配度</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3">
                  <input checked className="form-checkbox text-primary focus:ring-primary h-4 w-4 rounded-sm border-outline-variant bg-surface" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface font-medium">极度契合 (&gt;80%)</span>
                </div>
                <span className="text-xs bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">12</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3">
                  <input checked className="form-checkbox text-primary focus:ring-primary h-4 w-4 rounded-sm border-outline-variant bg-surface" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">高度相关 (60-80%)</span>
                </div>
                <span className="text-xs bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full">45</span>
              </label>
            </div>
          </div>
          {/* Filter Group: Experience & Education */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline font-semibold text-on-surface mb-4 text-base">硬性指标</h3>
            <div className="mb-5">
              <p className="text-xs text-on-surface-variant mb-2">工作经验</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">1-3年</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-fixed text-on-primary-fixed border border-transparent">3-5年</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-fixed text-on-primary-fixed border border-transparent">5-10年</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">10年以上</button>
              </div>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-2">学历要求</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">大专</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-fixed text-on-primary-fixed border border-transparent">本科</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-fixed text-on-primary-fixed border border-transparent">硕士及以上</button>
              </div>
            </div>
          </div>
        </aside>
        {/* Right Column: Candidate Feed */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-low rounded-xl p-6">
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">57</span> 份推荐简历
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-primary rounded-md font-medium text-sm hover:bg-surface-container transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  批量导出
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  一键邀请 (前10名)
                </button>
              </div>
            </div>
            {/* Card List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
              {/* Candidate Card 1 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-6 ambient-shadow relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl group-hover:bg-primary-fixed/30 transition-colors pointer-events-none"></div>
                {/* Left: Avatar & Basic Info */}
                <div className="flex gap-4 w-52 flex-shrink-0">
                  <img
                    alt="Candidate Avatar"
                    className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-surface"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cNGknQ0xzkjevWLbvD6h-Bigi94gK9guMhP8Wg1Ov7SuT2fuvu0drt-1EYRXUTnPw1QCMrEefvgjY9P7-jrid0VDN0dRw1TytUxEcN8ouYCMMb4-tp70qAExZDSczw-Y3J6JQbRV55g5Qi2zx76QAL_r5KrUiN8nCutba9AdL6kOgl4w9jea97syz0ZFyFtOgpDq67EfMxfvvSxgsipAoalvHeix7NFtRtemsSMhL_4h8zFHYNHwqHj9xGgrEEwejoPYsB0S2Bt2"
                  />
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface leading-tight">林晓静</h3>
                    <p className="text-sm text-primary font-medium mt-1">资深前端开发专家</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">字节跳动 · 5年经验 · 硕士</p>
                  </div>
                </div>
                {/* Center: Tags & Highlights */}
                <div className="flex-1 flex flex-col justify-center gap-4 border-l border-surface-container-high pl-6 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">React Ecosystem</span>
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">微前端架构</span>
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">性能优化</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <div>
                        <span className="text-on-surface font-semibold whitespace-nowrap">大厂背景契合：</span>
                        <span className="text-on-surface-variant">具备高并发、大流量 C 端产品架构经验。</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">lightbulb</span>
                      <div>
                        <span className="text-on-surface font-semibold whitespace-nowrap">技能高度重合：</span>
                        <span className="text-on-surface-variant">JD 要求的核心技术栈覆盖率达 95%。</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Match Score & Actions */}
                <div className="w-36 flex flex-col items-center justify-between flex-shrink-0 border-l border-surface-container-high pl-6 gap-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                      <circle className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="20" strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-headline font-bold text-primary leading-none">92<span className="text-sm">%</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button className="flex-1 py-1.5 bg-surface-container-highest text-primary text-xs font-medium rounded-md hover:bg-surface-container transition-colors">详情</button>
                    <button className="flex-1 py-1.5 bg-primary text-on-primary text-xs font-medium rounded-md hover:bg-primary-container transition-colors shadow-sm">邀请</button>
                  </div>
                </div>
              </div>
              {/* Candidate Card 2 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start gap-6 ambient-shadow relative overflow-hidden group">
                <div className="flex gap-4 w-52 flex-shrink-0">
                  <img
                    alt="Candidate Avatar"
                    className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-surface"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIJSxia5o079-nJ4XYjwa5KTLh5km8NvdXLANoJ5_Spfz0u2OmX4gVspbHbCMA9WaaEK7DKmU9HPtQxuhA8BqcQHRnF4g9poYWIV12OxlZjtbb980iX4SG9il2rXYl_KQfEWrSnMgd-3HU4mWfIT03tRO7pODcssSZOn9XUOWovmvmMB0Arcuo6d_BkCoSeZYMNIMVECm_U97YL5fe0alylG_urj9csbn0V_ifBgeUrpmEa6Gcshwcpz-75rF9aIMcLrbiQXYFpn-Q"
                  />
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface leading-tight">张伟</h3>
                    <p className="text-sm text-primary font-medium mt-1">前端技术组长</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">网易 · 6年经验 · 本科</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-4 border-l border-surface-container-high pl-6 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">Vue/React</span>
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">团队管理</span>
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">工程化建设</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">group_add</span>
                      <div>
                        <span className="text-on-surface font-semibold whitespace-nowrap">带队经验丰富：</span>
                        <span className="text-on-surface-variant">有 10+ 人前端团队管理与重构经验。</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">info</span>
                      <div>
                        <span className="text-on-surface font-semibold whitespace-nowrap">潜在弱项：</span>
                        <span className="text-on-surface-variant">英文文档阅读能力评级为中等。</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-36 flex flex-col items-center justify-between flex-shrink-0 border-l border-surface-container-high pl-6 gap-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                      <circle className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="37.6" strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-headline font-bold text-primary leading-none">85<span className="text-sm">%</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button className="flex-1 py-1.5 bg-surface-container-highest text-primary text-xs font-medium rounded-md hover:bg-surface-container transition-colors">详情</button>
                    <button className="flex-1 py-1.5 bg-primary text-on-primary text-xs font-medium rounded-md hover:bg-primary-container transition-colors shadow-sm">邀请</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseContent>
  );
}
