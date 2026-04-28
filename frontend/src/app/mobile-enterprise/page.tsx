"use client";

import { TopNav } from "./_components/TopNav";
import { mockJobs } from "./_data/mockData";
import { Link } from "./_lib/router";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <TopNav title="GraphHire" userAvatar />
      <main className="w-full px-4 py-stack-gap-md flex flex-col gap-stack-gap-lg overflow-y-auto pb-32">
        {/* Core Metrics Bento Grid */}
        <section className="grid grid-cols-2 gap-stack-gap-sm">
          <div className="bg-gradient-to-br from-primary-fixed to-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] col-span-2 flex justify-between items-center bg-surface-container-lowest transition-transform active:scale-[0.98]">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">待处理投递</p>
              {loading ? (
                <div className="h-8 w-16 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-lg text-headline-lg text-on-primary-fixed">24</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">inbox</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-inline-padding-sm rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.98]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">person_search</span>
              <p className="font-label-md text-label-md text-on-surface-variant">新匹配候选人</p>
            </div>
             {loading ? (
                <div className="h-7 w-12 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-md text-headline-md text-on-surface">156</p>
              )}
          </div>
          <div className="bg-surface-container-lowest p-inline-padding-sm rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.98]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">work_outline</span>
              <p className="font-label-md text-label-md text-on-surface-variant">在招职位</p>
            </div>
            {loading ? (
                <div className="h-7 w-8 bg-surface-variant animate-pulse rounded"></div>
              ) : (
                <p className="font-headline-md text-headline-md text-on-surface">12</p>
            )}
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-md">快捷操作</h2>
          <div className="grid grid-cols-3 gap-stack-gap-sm">
            <Link to="/jobs/create" className="bg-surface-container-lowest border border-surface-variant rounded-lg p-inline-padding-sm flex flex-col items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:shadow-[0_4px_12px_rgba(0,102,255,0.1)] active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary-fixed-variant">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">发布职位</span>
            </Link>
            <Link to="/recommendations" className="bg-surface-container-lowest border border-surface-variant rounded-lg p-inline-padding-sm flex flex-col items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:shadow-[0_4px_12px_rgba(0,102,255,0.1)] active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary-fixed-variant">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">智能推荐</span>
            </Link>
            <Link to="/team" className="bg-surface-container-lowest border border-surface-variant rounded-lg p-inline-padding-sm flex flex-col items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:shadow-[0_4px_12px_rgba(0,102,255,0.1)] active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary-fixed-variant">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">员工管理</span>
            </Link>
          </div>
        </section>

        {/* Recent Jobs List */}
        <section>
          <div className="flex justify-between items-center mb-stack-gap-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">近期职位</h2>
            <Link to="/jobs" className="font-label-md text-label-md text-primary hover:underline">查看全部</Link>
          </div>
          <div className="flex flex-col gap-stack-gap-sm">
            {loading ? (
              // Skeletons
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-sm h-[120px] animate-pulse"></div>
              ))
            ) : (
              mockJobs.slice(0, 3).map((job) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="bg-surface-container-lowest p-inline-padding-md rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform block">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-body-lg text-body-lg text-on-surface font-medium">{job.title}</h3>
                      <p className="font-label-md text-label-md text-on-surface-variant mt-1">{job.location} · {job.type} · {job.department}</p>
                    </div>
                    {job.status === '招聘中' ? (
                       <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-label-sm text-label-sm border border-green-200">{job.status}</span>
                    ) : (
                       <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 font-label-sm text-label-sm border border-orange-200">{job.status}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
                      <span className="font-label-md text-label-md text-secondary">{job.candidates} 候选人</span>
                    </div>
                    {job.newApplications > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                        <span className="font-label-md text-label-md text-primary font-medium">{job.newApplications} 新投递</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
