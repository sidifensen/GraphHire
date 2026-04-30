'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mockCandidates, mockJobs } from "@/app/enterprise/_mock/lib/mockData";
import { useState } from "react";
import { cn } from "@/app/enterprise/_mock/lib/utils";

export default function Recommendations() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "1";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const selectedJob = mockJobs.find(j => j.id === selectedJobId) || mockJobs[0];

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      
      <main className="w-full max-w-[375px] md:max-w-7xl mx-auto flex-1 flex flex-col md:flex-row md:gap-8 px-container-margin md:px-8 pt-stack-gap-md md:pt-8 overflow-hidden pb-[80px] md:pb-8">
        
        {/* LEFT COLUMN: Job Selection */}
        {/* Mobile Dropdown */}
        <div className="md:hidden flex flex-col gap-stack-gap-sm shrink-0 mb-4">
          <div className="relative bg-surface-container-lowest border border-outline-variant rounded-lg px-inline-padding-md py-stack-gap-sm flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">当前推荐职位</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">{selectedJob.title}</span>
            </div>
            <span className="material-symbols-outlined text-outline">expand_more</span>
          </div>
        </div>

        {/* Desktop Sidebar List */}
        <aside className="hidden md:flex flex-col w-[320px] lg:w-[360px] shrink-0 h-full gap-5 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="font-headline-sm text-2xl font-bold text-on-surface">职位猎场</h2>
            <Link href="/enterprise/jobs" className="text-sm font-medium text-primary hover:text-primary-fixed-variant transition-colors flex items-center gap-1">
              管理 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          
          <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shrink-0">
            <span className="material-symbols-outlined text-outline-variant mr-2 text-[20px]">search</span>
            <input 
              className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface placeholder-outline-variant outline-none" 
              placeholder="搜索职位名称..." 
              type="text"
            />
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 pb-8 pr-2">
            {mockJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJobId(job.id)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all",
                  selectedJobId === job.id 
                    ? "bg-primary/5 border-primary shadow-sm" 
                    : "bg-surface-container-lowest border-surface-variant hover:border-outline-variant hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={cn("font-medium text-[16px]", selectedJobId === job.id ? "text-primary" : "text-on-surface")}>{job.title}</h3>
                  {job.status === '招聘中' && (
                     <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", selectedJobId === job.id ? "bg-primary/10 text-primary border-primary/20" : "bg-green-50 text-green-700 border-green-200")}>招聘中</span>
                  )}
                </div>
                <p className="text-[13px] text-on-surface-variant mb-4">{job.location} · {job.experience}</p>
                
                <div className="flex items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    <span>{job.candidates} 匹配</span>
                  </div>
                  {job.highMatch && (
                    <div className="flex items-center gap-1 text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      <span>{job.highMatch} 极高</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT COLUMN: Candidates List */}
        <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Desktop Header */}
          <div className="hidden md:flex flex-col gap-1 mb-6 shrink-0">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface flex items-center gap-3">
              {selectedJob.title}
              <span className="text-sm font-medium bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-md mb-0.5">{selectedJob.department}</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">智能引擎已拦截低匹配度简历，为您精选以下候选人</p>
          </div>

          {/* Action & Filter Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-stack-gap-xs gap-4 mb-4 shrink-0 border-b border-surface-variant pb-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span>寻得</span>
              <strong className="text-primary text-xl font-bold font-mono">128</strong>
              <span>名匹配才俊</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-56 flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-outline-variant mr-2 text-[18px]">search</span>
                <input 
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface placeholder-outline-variant outline-none" 
                  placeholder="搜索技能或姓名..." 
                  type="text"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh}
                  className={cn("flex items-center justify-center gap-1.5 text-sm text-on-surface border border-outline-variant hover:bg-surface-container hover:text-on-surface rounded-full px-4 py-2 font-medium transition-all shadow-sm", refreshing && "opacity-70 pointer-events-none")}
                >
                  <span className={cn("material-symbols-outlined text-[18px]", refreshing && "animate-spin")}>refresh</span>
                  刷新
                </button>
                <button className="flex items-center justify-center gap-1.5 text-sm text-on-primary bg-primary hover:opacity-90 rounded-full px-4 py-2 font-medium transition-opacity shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  一键邀请
                </button>
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 pr-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-stack-gap-md">
              {refreshing ? (
                 Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm h-[280px] animate-pulse"></div>
                 ))
              ) : (
                 mockCandidates.map((candidate, idx) => (
                   <article key={candidate.id} className={cn("bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex flex-col gap-stack-gap-sm relative overflow-hidden transition-all", idx > 1 && "opacity-95")}>
                     {/* Match Indicator Badge */}
                     <div className={cn("absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl font-label-md text-label-md font-bold flex items-center gap-1", idx === 0 ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-high text-on-surface-variant")}>
                       <span className="material-symbols-outlined text-[16px]" style={idx === 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                         {idx === 0 ? 'star' : 'bar_chart'}
                       </span>
                       {candidate.matchScore}% 匹配
                     </div>

                     {/* Header Info */}
                     <div className="flex items-start gap-4 mt-2">
                       <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-variant border-2 border-surface-container-lowest shadow-sm shrink-0">
                         <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex flex-col flex-1 pt-0.5 pr-20">
                         <h2 className="font-headline-sm text-lg font-bold text-on-surface truncate">{candidate.name}</h2>
                         <p className="font-body-md text-[14px] text-on-surface-variant truncate mt-0.5">{candidate.title}</p>
                       </div>
                     </div>

                     {/* Match Reason Card-in-Card */}
                     <div className="bg-surface-container-low/50 rounded-lg p-3.5 border border-outline-variant/60 flex flex-col gap-2.5 mt-1">
                       {candidate.matchReasons ? (
                          <>
                            <div className="flex items-center gap-1.5 text-primary">
                              <span className="material-symbols-outlined text-[18px]">psychology</span>
                              <span className="text-[13px] font-bold tracking-wide">AI 洞察</span>
                            </div>
                            <ul className="text-[14px] text-on-surface-variant list-none space-y-1.5">
                              {candidate.matchReasons.map((reason, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                  <span className="text-secondary select-none text-[10px] mt-1.5">●</span>
                                  <span className="leading-snug">{
                                     reason.split(' ').map((word, j) => 
                                     word.includes('+') ? <strong key={j} className="text-on-surface font-semibold">{word} </strong> : <span key={j}>{word} </span>
                                     )
                                  }</span>
                                </li>
                              ))}
                            </ul>
                          </>
                       ) : (
                          <div className="flex gap-2">
                             <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">psychology</span>
                             <p className="text-[14px] leading-snug text-on-surface-variant"><strong className="text-on-surface font-semibold">分析结果:</strong> {candidate.matchReasonText}</p>
                          </div>
                       )}
                     </div>

                     {/* Skill Chips & Rest */}
                     <div className="mt-auto flex flex-col gap-3">
                       {/* Skill Chips */}
                       <div className="flex flex-wrap gap-2 pt-1">
                         {(candidate.skills || candidate.coreSkills?.map(s => s.name))?.map(skill => (
                           <span key={skill} className={cn("text-[12px] px-2.5 py-1 rounded border", skill.includes('+') ? "bg-surface-container border-outline-variant text-on-surface-variant" : "bg-primary/5 text-primary border-primary/20 font-medium")}>
                             {skill}
                           </span>
                         ))}
                       </div>

                       {/* Education & Quick Info */}
                       <div className="flex items-center gap-5 pt-3 border-t border-outline-variant/50 text-[13px] text-on-surface-variant font-medium">
                         <div className="flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[16px]">school</span>
                           {candidate.education}
                         </div>
                         <div className="flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[16px]">work_history</span>
                           {candidate.experience}
                         </div>
                       </div>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3 mt-4">
                       <Link href={`/enterprise/candidates/${candidate.id}`} className="flex-1 h-10 border border-outline-variant text-on-surface rounded-lg font-medium text-[14px] hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center">
                         查看详情
                       </Link>
                       <button className={cn("flex-1 h-10 rounded-lg text-[14px] font-semibold shadow-sm active:scale-95 transition-all hover:opacity-90", idx === 0 ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container")}>
                         邀请面试
                       </button>
                     </div>
                   </article>
                 ))
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
