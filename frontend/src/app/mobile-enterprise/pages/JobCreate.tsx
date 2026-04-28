"use client";

import { TopNav } from "../components/TopNav";
import { useNavigate } from "../_lib/router";

export default function JobCreate() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-surface-container-highest relative pb-[80px]">
      <TopNav title="发布职位" showBack />
      
      <main className="w-full max-w-[375px] md:max-w-2xl mx-auto bg-background flex-1 flex flex-col shadow-lg overflow-y-auto px-container-margin py-stack-gap-md pb-32 gap-stack-gap-lg">
        {/* Instructions / Context */}
        <div className="flex flex-col gap-stack-gap-xs">
          <h2 className="font-headline-md text-headline-md text-on-background">职位详情</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">请提供准确的职位信息，以吸引最合适的候选人。</p>
        </div>

        <form className="flex flex-col gap-stack-gap-md">
          {/* 职位名称 */}
          <div className="flex flex-col gap-stack-gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">职位名称</label>
            <input 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-inline-padding-sm py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
              placeholder="例如：高级前端工程师" 
              type="text"
            />
          </div>

          {/* 所在城市 */}
          <div className="flex flex-col gap-stack-gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">所在城市</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-inline-padding-sm pr-10 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline appearance-none" 
                placeholder="选择或输入城市" 
                type="text"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">location_on</span>
            </div>
          </div>

          {/* 薪资范围 (Grid layout) */}
          <div className="grid grid-cols-2 gap-stack-gap-md">
            {/* 最低薪资 */}
            <div className="flex flex-col gap-stack-gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">最低薪资</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-8 pr-3 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
                  placeholder="0" 
                  type="number"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">¥</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-outline text-[12px]">k</span>
              </div>
            </div>
            {/* 最高薪资 */}
            <div className="flex flex-col gap-stack-gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">最高薪资</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-8 pr-3 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
                  placeholder="0" 
                  type="number"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">¥</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-outline text-[12px]">k</span>
              </div>
            </div>
          </div>

          {/* 职位描述 */}
          <div className="flex flex-col gap-stack-gap-xs mt-2">
            <label className="font-label-md text-label-md text-on-surface-variant">职位描述</label>
            <textarea 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-inline-padding-sm py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline resize-none" 
              placeholder="详细描述岗位职责、任职要求及加分项..." 
              rows={6}
            ></textarea>
          </div>
        </form>
      </main>

      {/* Bottom Fixed Action Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface backdrop-blur-sm border-t border-surface-variant px-container-margin py-4 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.02)] max-w-[375px] md:max-w-2xl mx-auto z-20">
        <button 
          onClick={() => navigate('/jobs')}
          className="w-full h-[48px] bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT flex items-center justify-center shadow-sm active:scale-[0.98] active:shadow-md transition-all">
          创建并发布
        </button>
      </div>
    </div>
  );
}
