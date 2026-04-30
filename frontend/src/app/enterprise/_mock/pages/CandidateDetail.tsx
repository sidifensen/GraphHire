import { useParams } from "react-router-dom";
import { mockCandidates } from "../lib/mockData";
import { cn } from "../lib/utils";

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = mockCandidates.find(c => c.id === id) || mockCandidates.find(c => c.id === 'c3') || mockCandidates[0]; // Specific fallback to the one with detailed mock data

  return (
    <div className="bg-background font-body-md antialiased min-h-screen flex flex-col items-center">
      <main className="w-full max-w-[375px] md:max-w-4xl flex-1 pb-24 overflow-y-auto md:py-8">
        <div className="md:grid md:grid-cols-3 md:gap-8 px-container-margin md:px-0">
          
          {/* Left Column (Desktop) / Top Section (Mobile) */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* Header Profile Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-inline-padding-md flex flex-col gap-stack-gap-md relative">
              <div className="absolute top-4 right-4 bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-md font-semibold">
                匹配度 {candidate.matchScore || candidate.skillMatch || 90}%
              </div>
              <div className="flex flex-col md:items-center gap-stack-gap-md">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-surface-variant flex-shrink-0 border-2 border-outline-variant">
                  <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col md:text-center text-left">
                  <h2 className="font-headline-md text-2xl font-bold text-on-surface truncate">{candidate.name || '林晓云'}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant break-words mt-1">{candidate.title}</p>
                  <p className="font-label-md text-label-md text-secondary mt-1 truncate">目前就职：{candidate.company || '未知'}</p>
                </div>
              </div>
              <div className="flex flex-wrap md:justify-center gap-2 mt-2 pt-4 border-t border-surface-variant">
                {candidate.tags ? candidate.tags.map(tag => (
                    <span key={tag} className="bg-surface-container-low text-on-surface-variant font-label-md text-[13px] px-3 py-1 rounded-full border border-surface-variant">{tag}</span>
                )) : (
                  <>
                    <span className="bg-surface-container-low text-on-surface-variant font-label-md text-[13px] px-3 py-1 rounded-full border border-surface-variant">本科</span>
                    <span className="bg-surface-container-low text-on-surface-variant font-label-md text-[13px] px-3 py-1 rounded-full border border-surface-variant">随时到岗</span>
                  </>
                )}
              </div>
            </div>

            {/* Matching Analysis Bento Box */}
            <div className="mb-container-margin md:mb-0">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-gap-sm md:hidden">匹配分析</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-stack-gap-sm">
                {/* Skill Match Card */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[18px]">code_blocks</span>
                    <span className="font-label-md text-label-md font-semibold">技能匹配度</span>
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
                    <span className="font-label-md text-label-md font-semibold">经验匹配度</span>
                  </div>
                  <div className="text-2xl font-bold text-on-surface">{candidate.experienceMatch || 88}<span className="text-sm font-normal text-on-surface-variant">%</span></div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: `${candidate.experienceMatch || 88}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Desktop) / Bottom Section (Mobile) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Skills Section */}
            {candidate.coreSkills && (
              <div className="mb-container-margin md:mb-0">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-stack-gap-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  核心技能
                </h3>
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-wrap gap-3">
                  {candidate.coreSkills.map(skill => (
                    <span key={skill.name} className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 bg-surface-container-low/50">
                      {skill.name} <span className={cn("font-bold", skill.emphasis)}>{skill.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work History Section */}
            {candidate.workHistory && (
              <div className="mb-container-margin md:mb-0">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-stack-gap-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work</span>
                  工作经历
                </h3>
                <div className="relative border-l-2 border-surface-variant ml-4 md:ml-6 space-y-8">
                  {candidate.workHistory.map((job, idx) => (
                    <div key={idx} className="relative pl-6 md:pl-8">
                      <div className={cn("absolute -left-[9px] md:-left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ring-surface-container-lowest", job.active ? "bg-primary" : "bg-surface-variant")}></div>
                      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-1">
                          <div>
                            <h4 className="font-headline-sm text-lg font-bold text-on-surface">{job.title}</h4>
                            <p className="font-body-md text-body-md text-secondary font-medium">{job.company}</p>
                          </div>
                          <span className="font-label-md text-[13px] text-on-surface-variant md:text-right bg-surface-container-high px-2 py-1 rounded w-fit">{job.dates}</span>
                        </div>
                        <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-4 space-y-2 mt-4 marker:text-primary/50">
                          {job.bullets.map((bullet, i) => (
                            <li key={i} className="leading-relaxed">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Fixed Action Area */}
      <div className="fixed bottom-0 w-full bg-surface-container-lowest border-t border-surface-variant px-4 py-4 z-50 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex gap-4 md:max-w-4xl md:mx-auto">
          <button className="flex-1 max-w-[200px] bg-surface-container-highest text-on-surface font-body-lg text-[15px] h-12 rounded-lg flex items-center justify-center font-medium hover:bg-surface-variant transition-colors active:scale-95 duration-150">
            暂不考虑
          </button>
          <button className="flex-[2] bg-primary text-on-primary font-body-lg text-[15px] h-12 rounded-lg flex items-center justify-center font-semibold shadow-sm hover:opacity-90 transition-opacity active:scale-95 duration-150 gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            发送面试邀请
          </button>
        </div>
      </div>
    </div>
  );
}
