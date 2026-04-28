"use client";

import { TopNav } from "../components/TopNav";
import { Link, useParams } from "../_lib/router";
import { mockJobs } from "../lib/mockData";

export default function JobDetail() {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === id) || mockJobs[0];

  return (
    <div className="flex flex-col h-full bg-background relative pb-[80px]">
      <TopNav title="职位详情" showBack />
      
      <main className="w-full py-stack-gap-md flex-1 flex flex-col gap-stack-gap-md overflow-y-auto pb-8">
        {/* Header Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{job.title}</h2>
              <span className="font-body-md text-body-md text-primary font-medium">{job.salary}</span>
            </div>
            <div className="bg-secondary-container px-2 py-1 rounded text-on-secondary-container font-label-md text-label-md flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary block"></span>
              {job.status}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-variant">
            <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {job.location}
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">work</span>
              {job.experience}
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">school</span>
              {job.education}
            </div>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-2 gap-stack-gap-sm">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-1 items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[24px]">visibility</span>
            <span className="font-headline-md text-headline-md text-on-surface">{job.views.toLocaleString()}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">总浏览量</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-1 items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[24px]">group_add</span>
            <span className="font-headline-md text-headline-md text-on-surface">{job.candidates}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">收到简历</span>
          </div>
        </div>

        {/* Skills Card */}
        {job.tags && job.tags.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_offer</span>
              技能要求
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map(tag => (
                  <span key={tag} className="bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full font-label-md text-label-md border border-surface-variant">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            职位描述
          </h3>
          <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-4">
            <p><strong>岗位职责：</strong></p>
            <div className="whitespace-pre-wrap">{job.description}</div>
            
            <p className="mt-4"><strong>任职要求：</strong></p>
            <div className="whitespace-pre-wrap">{job.requirements}</div>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Actions */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-surface-container-lowest border-t border-surface-variant p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50 flex gap-4 items-center justify-center pb-safe">
        <Link to={`/jobs/${job.id}/edit`} className="flex-1 h-12 rounded-lg border border-outline text-on-surface font-label-md text-label-md font-semibold bg-surface-container-lowest hover:bg-surface-container-low flex justify-center items-center transition-colors active:scale-[0.98]">
            修改职位
        </Link>
        <Link to={`/recommendations?jobId=${job.id}`} className="flex-[2] h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_search</span>
            查看匹配候选人
        </Link>
      </div>
    </div>
  );
}
