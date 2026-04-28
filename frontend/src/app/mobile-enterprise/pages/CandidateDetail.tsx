"use client";

import { TopNav } from "../components/TopNav";
import { useParams } from "../_lib/router";
import { mockCandidates } from "../lib/mockData";
import { cn } from "../lib/utils";

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = mockCandidates.find(c => c.id === id) || mockCandidates.find(c => c.id === 'c3') || mockCandidates[0]; // Specific fallback to the one with detailed mock data

  return (
    <div className="bg-background font-body-md antialiased min-h-screen flex flex-col items-center">
      <TopNav title="简历详情" showBack />

      <main className="w-full flex-1 pb-24 overflow-y-auto">
        {/* Header Profile Card */}
        <div className="bg-surface-container-lowest m-container-margin rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-inline-padding-md flex flex-col gap-stack-gap-md relative">
          <div className="absolute top-4 right-4 bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-DEFAULT">
             匹配度 {candidate.matchScore || candidate.skillMatch || 90}%
          </div>
          <div className="flex gap-stack-gap-md items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
              <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col pr-16 text-left">
              <h2 className="font-headline-md text-headline-md text-on-surface truncate">{candidate.name || '林晓云'}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant break-words">{candidate.title}</p>
              <p className="font-label-md text-label-md text-secondary mt-1 truncate">目前就职：{candidate.company || '未知'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {candidate.tags ? candidate.tags.map(tag => (
                <span key={tag} className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md px-2.5 py-1 rounded-DEFAULT">{tag}</span>
            )) : (
              <>
                 <span className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md px-2.5 py-1 rounded-DEFAULT">本科</span>
                 <span className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md px-2.5 py-1 rounded-DEFAULT">随时到岗</span>
              </>
            )}
          </div>
        </div>

        {/* Matching Analysis Bento Box */}
        <div className="px-container-margin mb-container-margin">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-sm">匹配分析</h3>
          <div className="grid grid-cols-2 gap-stack-gap-sm">
            {/* Skill Match Card */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-xs">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[18px]">code_blocks</span>
                <span className="font-label-md text-label-md">技能匹配度</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">{candidate.skillMatch || 95}<span className="text-sm font-normal text-on-surface-variant">%</span></div>
              <div className="w-full bg-surface-variant h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${candidate.skillMatch || 95}%` }}></div>
              </div>
            </div>
            {/* Experience Match Card */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-xs">
              <div className="flex items-center gap-2 text-tertiary">
                <span className="material-symbols-outlined text-[18px]">work_history</span>
                <span className="font-label-md text-label-md">经验匹配度</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">{candidate.experienceMatch || 88}<span className="text-sm font-normal text-on-surface-variant">%</span></div>
              <div className="w-full bg-surface-variant h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: `${candidate.experienceMatch || 88}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {candidate.coreSkills && (
          <div className="px-container-margin mb-container-margin">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-sm">核心技能</h3>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-wrap gap-2">
              {candidate.coreSkills.map(skill => (
                <span key={skill.name} className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-3 py-1.5 rounded-full flex items-center gap-1">
                  {skill.name} <span className={cn("font-bold", skill.emphasis)}>{skill.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work History Section */}
        {candidate.workHistory && (
          <div className="px-container-margin mb-container-margin">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-sm">工作经历</h3>
            <div className="relative border-l border-surface-variant ml-4 space-y-6">
              {candidate.workHistory.map((job, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className={cn("absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest", job.active ? "bg-primary" : "bg-surface-variant")}></div>
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">{job.title}</h4>
                        <p className="font-body-md text-body-md text-secondary">{job.company}</p>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface-variant text-right">{job.dates}</span>
                    </div>
                    <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-4 space-y-1 mt-3">
                      {job.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Fixed Action Area */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-surface-container-lowest border-t border-surface-variant px-4 py-4 z-50 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <button className="flex-1 bg-surface-container-high text-on-surface font-body-lg text-body-lg h-12 rounded-lg flex items-center justify-center font-medium hover:bg-surface-variant transition-colors active:scale-95 duration-150">
            暂不考虑
          </button>
          <button className="flex-[2] bg-primary-container text-on-primary font-body-lg text-body-lg h-12 rounded-lg flex items-center justify-center font-medium shadow-sm hover:opacity-90 transition-opacity active:scale-95 duration-150 gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            发送面试邀请
          </button>
        </div>
      </div>
    </div>
  );
}
