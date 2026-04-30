import { mockJobs } from "../lib/mockData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="w-full max-w-7xl mx-auto px-container-margin md:px-8 py-stack-gap-md md:py-8 flex flex-col gap-8 overflow-y-auto pb-32 md:pb-8">
        
        {/* Desktop Greeting (Hidden on mobile) */}
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">欢迎回来，HR</h1>
          <p className="text-on-surface-variant font-body-md">这是您今天的招聘数据概览。</p>
        </div>

        {/* Core Metrics Bento Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-stack-gap-sm md:gap-6">
          <div className="bg-gradient-to-br from-primary-fixed to-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md col-span-2 flex justify-between items-center transition-all active:scale-[0.98]">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">待处理投递</p>
              {loading ? (
                <div className="h-8 w-16 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-lg text-[32px] font-bold text-on-primary-fixed">24</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-fixed-dim/50 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">inbox</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-inline-padding-sm md:p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">person_search</span>
              <p className="font-label-md text-label-md text-on-surface-variant">新匹配候选人</p>
            </div>
             {loading ? (
                <div className="h-7 w-12 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-md text-2xl font-bold text-on-surface">156</p>
              )}
          </div>
          <div className="bg-surface-container-lowest p-inline-padding-sm md:p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">work_outline</span>
              <p className="font-label-md text-label-md text-on-surface-variant">在招职位</p>
            </div>
            {loading ? (
                <div className="h-7 w-8 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-md text-2xl font-bold text-on-surface">12</p>
            )}
          </div>
        </section>

        {/* Main Content Layout for Desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-8">
            
            {/* Quick Access */}
            <section>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-md transition-all">快捷操作</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-stack-gap-sm md:gap-4">
                <Link to="/jobs/create" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">发布职位</span>
                </Link>
                <Link to="/recommendations" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">智能推荐</span>
                </Link>
                <Link to="/team" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">groups</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">员工管理</span>
                </Link>
                <Link to="/interviews" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">面试日程</span>
                </Link>
                <Link to="/talent" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group hidden md:flex">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">folder_shared</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">人才库</span>
                </Link>
                <Link to="/analytics" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary/30 active:scale-95 transition-all group hidden md:flex">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">bar_chart</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">数据中心</span>
                </Link>
              </div>
            </section>
    
            {/* Recent Jobs List */}
            <section className="md:mt-2">
              <div className="flex justify-between items-center mb-stack-gap-md transition-all">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">近期热招</h2>
                <Link to="/jobs" className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant hover:underline flex items-center">
                  查看全部 <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-stack-gap-sm md:gap-6">
                {loading ? (
                  // Skeletons
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-sm h-[130px] animate-pulse"></div>
                  ))
                ) : (
                  mockJobs.slice(0, 4).map((job) => (
                    <Link to={`/jobs/${job.id}`} key={job.id} className="bg-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md active:scale-[0.98] transition-all block">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-body-lg text-lg text-on-surface font-semibold mb-1 truncate max-w-[150px] sm:max-w-[180px]">{job.title}</h3>
                          <p className="font-label-md text-[13px] text-on-surface-variant truncate">{job.location} · {job.type} · {job.department}</p>
                        </div>
                        {job.status === '招聘中' ? (
                           <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-label-sm text-[12px] shrink-0 font-semibold">{job.status}</span>
                        ) : (
                           <span className="px-2 py-1 rounded-md bg-surface-variant text-on-surface-variant font-label-sm text-[12px] shrink-0 font-semibold">{job.status}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-surface-variant">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                            <span className="font-label-md text-[13px] text-secondary font-medium">{job.candidates} 候选人</span>
                          </div>
                        </div>
                        {job.newApplications > 0 && (
                          <div className="flex items-center gap-1.5 bg-error/10 px-2 py-0.5 rounded text-error shrink-0">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            <span className="font-label-md text-[13px] font-semibold">{job.newApplications} 新投递</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar (Desktop) */}
          <div className="flex flex-col gap-8">
            <section className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-inline-padding-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">今日面试</h2>
                <button className="text-primary hover:bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-12 h-12 rounded bg-surface-variant shrink-0"></div>
                        <div className="flex-1 bg-surface-variant rounded h-12"></div>
                      </div>
                    ))
                ) : (
                  <>
                    <div className="flex gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex flex-col items-center justify-center bg-surface-container w-12 h-12 rounded-md shrink-0 group-hover:bg-primary/10">
                        <span className="text-[12px] text-on-surface-variant font-medium">10:30</span>
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <p className="font-label-md text-[14px] font-semibold text-on-surface">林晓云 - 资深前端开发</p>
                        <p className="text-[12px] text-on-surface-variant">视频面试 · 终面</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex flex-col items-center justify-center bg-surface-container w-12 h-12 rounded-md shrink-0 group-hover:bg-primary/10">
                        <span className="text-[12px] text-on-surface-variant font-medium">14:00</span>
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <p className="font-label-md text-[14px] font-semibold text-on-surface">张伟 - 产品经理</p>
                        <p className="text-[12px] text-on-surface-variant">现场面试 · 初面</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-inline-padding-md flex-1">
               <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-4">待办事项</h2>
               <div className="flex flex-col gap-3">
                 <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors">
                   <input type="checkbox" className="mt-[3px] w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
                   <div className="flex-1">
                     <p className="text-[14px] font-medium text-on-surface leading-snug">确认下周入职的3位员工设备</p>
                     <p className="text-[12px] text-error mt-1 font-medium bg-error/10 w-fit px-1.5 py-0.5 rounded">今天到期</p>
                   </div>
                 </label>
                 <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors">
                   <input type="checkbox" className="mt-[3px] w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
                   <div className="flex-1">
                     <p className="text-[14px] font-medium text-on-surface leading-snug">评估【王大拿】的笔试结果</p>
                     <p className="text-[12px] text-on-surface-variant mt-1">明天 18:00 前</p>
                   </div>
                 </label>
                 <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors opacity-60">
                   <input type="checkbox" defaultChecked className="mt-[3px] w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary shrink-0" />
                   <div className="flex-1 line-through">
                     <p className="text-[14px] font-medium text-on-surface leading-snug">发布Java高级工程师JD</p>
                   </div>
                 </label>
               </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
