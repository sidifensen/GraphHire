"use client";

import { TopNav } from "../components/TopNav";
import { mockJobs } from "../lib/mockData";
import { Link } from "../_lib/router";
import { useState, useMemo } from "react";
import { cn } from "../lib/utils";

const TABS = ["全部", "已发布", "草稿", "已关闭"];

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("全部");
  const [search, setSearch] = useState("");

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch = job.title.includes(search) || job.department.includes(search);
      if (activeTab === "全部") return matchesSearch;
      if (activeTab === "已发布") return matchesSearch && job.status === "招聘中";
      if (activeTab === "已关闭") return matchesSearch && job.status === "已关闭";
      return matchesSearch && job.status === "草稿";
    });
  }, [search, activeTab]);

  return (
    <div className="flex flex-col h-full bg-background">
      <TopNav title="职位管理" userAvatar />
      <div className="flex-1 overflow-y-auto flex flex-col pb-24 md:pb-8">
        {/* Search Bar */}
        <div className="pt-stack-gap-md pb-stack-gap-xs sticky top-0 bg-background z-10 md:max-w-2xl md:mx-auto md:w-full">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder-outline p-0 w-full"
              placeholder="职位关键词"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs/Filters */}
        <div className="border-b border-surface-variant sticky top-[72px] bg-background z-10 md:max-w-2xl md:mx-auto md:w-full">
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "font-label-md text-label-md pb-3 px-1 whitespace-nowrap transition-colors",
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary font-semibold"
                    : "text-on-surface-variant border-b-2 border-transparent hover:text-on-surface"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards List */}
        <div className="py-stack-gap-md flex flex-col gap-stack-gap-md md:max-w-2xl md:mx-auto md:w-full">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className={cn(
                "bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3 transition-all",
                job.status === '已关闭' ? "opacity-80" : ""
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">{job.title}</h2>
                      {job.status === '已关闭' && (
                          <span className="bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide">已关闭</span>
                      )}
                  </div>
                  <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                    <span>{job.department}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <span className={cn("font-headline-sm text-headline-sm", job.status === '已关闭' ? "text-on-surface-variant" : "text-primary")}>
                  {job.salary}
                </span>
              </div>

              {/* Stats Bento */}
              <div className="flex gap-2 mt-1">
                <div className="flex-1 bg-surface-container-low rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="font-label-md text-label-md text-on-surface-variant mb-0.5">曝光量</span>
                  <span className={cn("font-headline-sm text-headline-sm", job.status === '已关闭' ? "text-on-surface-variant" : "text-on-surface")}>
                    {job.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-low rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="font-label-md text-label-md text-on-surface-variant mb-0.5">投递数</span>
                  <span className={cn("font-headline-sm text-headline-sm", job.status === '已关闭' ? "text-on-surface-variant" : "text-on-surface")}>
                    {job.candidates}
                  </span>
                </div>
                <div className={cn("flex-1 rounded-lg p-2 flex flex-col items-center justify-center", job.status === '已关闭' ? "bg-surface-container-low" : "bg-secondary-container")}>
                  <span className={cn("font-label-md text-label-md mb-0.5", job.status === '已关闭' ? "text-on-surface-variant" : "text-on-secondary-container")}>高匹配数</span>
                <span className={cn("font-headline-sm text-headline-sm", job.status === '已关闭' ? "text-on-surface-variant" : "text-on-primary-fixed-variant")}>
                    {job.highMatch || 12}
                  </span>
                </div>
              </div>

              <div className="h-[1px] w-full bg-surface-variant my-1"></div>

              {/* Actions */}
              <div className="flex gap-stack-gap-sm">
                <Link to={`/jobs/${job.id}`} className="flex-1 h-10 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-low transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  详情
                </Link>
                {job.status !== '已关闭' && (
                  <Link to={`/recommendations?jobId=${job.id}`} className="flex-1 h-10 rounded-lg bg-primary font-label-md text-label-md text-on-primary flex items-center justify-center gap-1.5 hover:bg-on-primary-fixed-variant transition-colors shadow-[0_2px_4px_rgba(0,102,255,0.2)] active:scale-95">
                    <span className="material-symbols-outlined text-[18px]">person_search</span>
                    匹配候选人
                  </Link>
                )}
              </div>
            </article>
          ))}
          {filteredJobs.length === 0 && (
             <div className="py-10 text-center text-on-surface-variant text-body-md mt-8">无匹配职位</div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link to="/jobs/create" className="fixed bottom-20 right-4 bg-primary text-on-primary h-12 px-5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,102,255,0.3)] z-40 active:scale-95 transition-transform hover:bg-on-primary-fixed-variant">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="font-label-md text-label-md text-on-primary">发布新职位</span>
      </Link>
    </div>
  );
}
