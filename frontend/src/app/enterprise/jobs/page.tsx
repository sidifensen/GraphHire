'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/app/enterprise/_mock/lib/utils";
import { companyApi } from "@/lib/api/company";
import type { EnterpriseJobListItem } from "@/lib/types/enterprise";

const TABS = ["全部", "已发布", "草稿", "已关闭"];

function getStatusText(status: string): string {
  if (status === "PUBLISHED") return "招聘中";
  if (status === "CLOSED") return "已关闭";
  if (status === "DRAFT") return "草稿";
  return status || "草稿";
}

function formatSalary(job: EnterpriseJobListItem): string {
  if (job.salaryMin == null && job.salaryMax == null) {
    return "薪资面议";
  }

  const normalizeToK = (value?: number | null): number | null => {
    if (value == null) return null;
    // 大于 1000 视为元，转换为 k；小于等于 1000 视为已经是 k
    return value > 1000 ? Number((value / 1000).toFixed(1)) : value;
  };

  const minK = normalizeToK(job.salaryMin);
  const maxK = normalizeToK(job.salaryMax);
  if (minK != null && maxK != null) {
    return `${minK}-${maxK}k`;
  }
  if (minK != null) {
    return `${minK}+k`;
  }
  return `${maxK}k`;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function formatDescriptionPreview(description?: string | null): string {
  if (!description || description.trim().length === 0) {
    return "暂无岗位详情";
  }
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= 66) {
    return normalized;
  }
  return `${normalized.slice(0, 66)}...`;
}

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("全部");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<EnterpriseJobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await companyApi.getJobList();
        if (!cancelled) {
          setJobs(result ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setJobs([]);
          setError(err instanceof Error ? err.message : "职位加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const title = (job.title ?? "").toLowerCase();
      const department = (job.department ?? "").toLowerCase();
      const matchesSearch =
        keyword.length === 0 || title.includes(keyword) || department.includes(keyword);

      if (activeTab === "全部") return matchesSearch;
      if (activeTab === "已发布") return matchesSearch && job.status === "PUBLISHED";
      if (activeTab === "已关闭") return matchesSearch && job.status === "CLOSED";
      return matchesSearch && job.status === "DRAFT";
    });
  }, [search, activeTab, jobs]);

  return (
    <div className="flex flex-col h-full bg-background antialiased">
      <div className="flex-1 overflow-y-auto flex flex-col pb-24 md:pb-8 w-full max-w-7xl mx-auto px-container-margin md:px-8">
        
        {/* Desktop Header / Toolbar */}
        <div className="hidden md:flex flex-row justify-between items-end pt-8 pb-4 border-b border-surface-variant sticky top-0 bg-background z-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">职位管理</h1>
            <div className="flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "font-body-md text-body-md pb-2 px-1 whitespace-nowrap transition-colors border-b-2",
                    activeTab === tab
                      ? "text-primary border-primary font-semibold"
                      : "text-on-surface-variant border-transparent hover:text-on-surface"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary w-64 transition-all">
              <span className="material-symbols-outlined text-outline-variant mr-2 text-[20px]">search</span>
              <input
                className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder-outline-variant p-0 w-full"
                placeholder="搜索职位或部门"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/enterprise/jobs/new" className="bg-primary text-on-primary h-10 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-on-primary-fixed-variant transition-colors">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              <span className="font-label-md text-label-md font-semibold">发布新职位</span>
            </Link>
          </div>
        </div>

        {/* Mobile Toolbar */}
        <div className="md:hidden">
          <div className="pt-stack-gap-md pb-stack-gap-xs sticky top-0 bg-background z-10">
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
          <div className="border-b border-surface-variant sticky top-[72px] bg-background z-10">
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
        </div>

        {/* Job Cards Grid */}
        <div className="py-container-margin grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:mt-4">
          {loading && (
            <div className="text-on-surface-variant font-body-md">职位加载中...</div>
          )}
          {error && !loading && (
            <div className="text-error font-body-md">{error}</div>
          )}
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className={cn(
                "bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4 transition-all hover:shadow-md",
                job.status === "CLOSED" ? "opacity-80" : ""
              )}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                   <div className="flex items-start gap-2 mb-1">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface cursor-pointer hover:text-primary transition-colors leading-snug break-words">
                        <Link href={`/enterprise/jobs/${job.id}`}>{job.title}</Link>
                      </h2>
                  </div>
                  <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                    <span>{job.city || "地点待定"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide",
                      job.status === "CLOSED"
                        ? "bg-surface-variant text-on-surface-variant"
                        : job.status === "DRAFT"
                          ? "bg-secondary-container text-secondary"
                          : "bg-primary/10 text-primary",
                    )}
                  >
                    {getStatusText(job.status)}
                  </span>
                <span className={cn("font-headline-sm text-headline-sm whitespace-nowrap", job.status === "CLOSED" ? "text-on-surface-variant" : "text-primary")}>
                  {formatSalary(job)}
                </span>
                </div>
              </div>

              {/* Description Preview */}
              <div className="bg-surface-container-low rounded-lg p-3 border border-white/50 dark:border-white/5">
                <div className="font-label-md text-label-md text-on-surface-variant mb-1">岗位详情</div>
                <div className="font-body-md text-body-md text-on-surface leading-relaxed break-words">
                  {formatDescriptionPreview(job.description)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-1 pt-4 border-t border-surface-variant">
                <Link href={`/enterprise/jobs/${job.id}`} className="flex-1 h-10 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-low transition-colors active:scale-95">
                  详情
                </Link>
                <Link href={`/enterprise/jobs/${job.id}/edit`} className="flex-1 h-10 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-low transition-colors active:scale-95">
                  编辑
                </Link>
                {job.status === "PUBLISHED" ? (
                  <Link href={`/enterprise/recommendations?jobId=${job.id}`} className="flex-1 h-10 rounded-lg bg-primary font-label-md text-label-md text-on-primary flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap">
                    匹配候选人
                  </Link>
                ) : (
                  <button disabled className="flex-1 h-10 rounded-lg bg-surface-container-high text-on-surface-variant font-label-md text-label-md flex items-center justify-center cursor-not-allowed">
                    {getStatusText(job.status)}
                  </button>
                )}
              </div>
              <div className="flex justify-end items-center mt-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  发布时间：{formatDate(job.publishedAt) || formatDate(job.createdAt) || "暂无"}
                </span>
              </div>
            </article>
          ))}
        </div>
        {!loading && !error && filteredJobs.length === 0 && (
           <div className="py-20 text-center flex flex-col items-center justify-center text-on-surface-variant">
             <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search_off</span>
             <p className="text-body-lg">没有找到匹配的职位</p>
           </div>
        )}
      </div>

      {/* Floating Action Button for Mobile Only */}
      <Link href="/enterprise/jobs/new" className="fixed bottom-20 right-4 bg-primary text-on-primary h-14 w-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,102,255,0.3)] z-40 active:scale-95 transition-transform md:hidden hover:bg-on-primary-fixed-variant">
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>
    </div>
  );
}
