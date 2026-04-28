"use client";

import { TopNav } from "../_components/TopNav";
import { mockCandidates } from "../_data/mockData";
import { useState } from "react";
import { cn } from "../_lib/utils";

export default function Recommendations() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-surface pb-[80px]">
      <TopNav title="智能推荐" />
      
      <main className="w-full px-4 flex-1 overflow-y-auto pt-stack-gap-md flex flex-col gap-stack-gap-md pb-8">
        {/* Job Selector & Search Cluster */}
        <section className="flex flex-col gap-stack-gap-sm">
          {/* Job Dropdown */}
          <div className="relative bg-surface-container-lowest border border-outline-variant rounded-lg px-inline-padding-md py-stack-gap-sm flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:shadow-[0_4px_12px_rgba(0,102,255,0.1)] transition-shadow cursor-pointer">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">当前推荐职位</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">资深前端开发工程师 (React)</span>
            </div>
            <span className="material-symbols-outlined text-outline">expand_more</span>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-inline-padding-sm py-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-outline mr-2 text-[20px]">search</span>
            <input 
              className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface placeholder-outline-variant outline-none" 
              placeholder="搜索候选人姓名或技能..." 
              type="text"
            />
            <button className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-outline text-[16px]">tune</span>
            </button>
          </div>
        </section>

        {/* Action Row */}
        <section className="flex justify-between items-center py-stack-gap-xs">
          <span className="font-body-md text-body-md text-on-surface-variant">共发现 <strong className="text-primary">128</strong> 名匹配候选人</span>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className={cn("flex items-center gap-1 font-label-md text-label-md text-primary bg-primary-fixed rounded-full px-3 py-1.5 active:scale-95 transition-transform", refreshing && "opacity-70 pointer-events-none")}
            >
              <span className={cn("material-symbols-outlined text-[14px]", refreshing && "animate-spin")}>refresh</span>
              刷新推荐
            </button>
            <button className="flex items-center gap-1 font-label-md text-label-md text-on-primary bg-primary rounded-full px-3 py-1.5 active:scale-95 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              一键匹配全部
            </button>
          </div>
        </section>

        {/* Candidate Cards List */}
        <section className="flex flex-col gap-stack-gap-md pb-stack-gap-lg">
          {refreshing ? (
             Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm h-[250px] animate-pulse"></div>
             ))
          ) : (
             mockCandidates.slice(0, 2).map((candidate, idx) => (
               <article key={candidate.id} className={cn("bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm relative overflow-hidden", idx === 1 && "opacity-95")}>
                 {/* Match Indicator Badge */}
                 <div className={cn("absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-label-md text-label-md font-bold flex items-center gap-1", idx === 0 ? "bg-primary-fixed text-primary" : "bg-surface-container-high text-on-surface-variant")}>
                   <span className="material-symbols-outlined text-[14px]" style={idx === 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                     {idx === 0 ? 'star' : 'bar_chart'}
                   </span>
                   {candidate.matchScore}% 匹配
                 </div>

                 {/* Header Info */}
                 <div className="flex items-start gap-3 mt-1">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant border border-outline-variant shrink-0">
                     <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex flex-col flex-1 pt-1 pr-20">
                     <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{candidate.name}</h2>
                     <p className="font-body-md text-body-md text-on-surface-variant truncate">{candidate.title}</p>
                   </div>
                 </div>

                 {/* Match Reason Card-in-Card */}
                 <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50 flex flex-col gap-2">
                   {candidate.matchReasons ? (
                      <>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span className="font-label-sm text-label-sm uppercase tracking-wider">核心匹配原因</span>
                        </div>
                        <ul className="font-body-md text-body-md text-on-surface-variant list-disc list-inside space-y-1">
                          {candidate.matchReasons.map((reason, i) => (
                            <li key={i}>{
                               // Simple bolding logic for demo based on strings
                               reason.split(' ').map((word, j) => 
                               word.includes('+') ? <strong key={j} className="text-on-surface">{word} </strong> : <span key={j}>{word} </span>
                               )
                            }</li>
                          ))}
                        </ul>
                      </>
                   ) : (
                      <p className="font-body-md text-body-md text-on-surface-variant"><strong className="text-on-surface">匹配点:</strong> {candidate.matchReasonText}</p>
                   )}
                 </div>

                 {/* Skill Chips */}
                 <div className="flex flex-wrap gap-2">
                   {candidate.skills?.map(skill => (
                     <span key={skill} className={cn("font-label-md text-label-md px-2 py-1 rounded-md border", skill.includes('+') ? "bg-surface-container-high text-on-surface-variant border-outline-variant" : "bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed")}>
                       {skill}
                     </span>
                   ))}
                 </div>

                 {/* Education & Quick Info */}
                 <div className="flex items-center gap-4 border-t border-outline-variant pt-3 mt-1 font-label-md text-label-md text-on-surface-variant">
                   <div className="flex items-center gap-1">
                     <span className="material-symbols-outlined text-[14px]">school</span>
                     {candidate.education}
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="material-symbols-outlined text-[14px]">work_history</span>
                     {candidate.experience}
                   </div>
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3 mt-2">
                   <button className="flex-1 h-10 border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center">
                     详情
                   </button>
                   <button className={cn("flex-1 h-10 rounded-lg font-label-md text-label-md shadow-sm active:scale-95 transition-all", idx === 0 ? "bg-primary text-on-primary" : "bg-primary-fixed text-primary")}>
                     邀请面试
                   </button>
                 </div>
               </article>
             ))
          )}
        </section>
      </main>
    </div>
  );
}
