'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { companyApi } from "@/lib/api/company";
import type { EnterpriseJobDetail } from "@/lib/types/enterprise";

function formatSalary(job: EnterpriseJobDetail): string {
  const min = job.salaryRange?.min;
  const max = job.salaryRange?.max;
  const unit = job.salaryRange?.unit ? ` ${job.salaryRange.unit}` : "";

  if (min == null && max == null) {
    return "薪资面议";
  }
  if (min != null && max != null) {
    return `${min}-${max}${unit}`;
  }
  if (min != null) {
    return `${min}+${unit}`;
  }
  return `${max}${unit}`;
}

function statusText(status: string): string {
  if (status === "PUBLISHED") return "招聘中";
  if (status === "CLOSED") return "已关闭";
  if (status === "DRAFT") return "草稿";
  return status || "草稿";
}

export default function JobDetail() {
  const { id } = useParams();
  const jobId = Number(id);
  const [job, setJob] = useState<EnterpriseJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await companyApi.getJobDetail(jobId);
        if (!cancelled) {
          setJob(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "职位详情加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!Number.isFinite(jobId)) {
      setError("无效职位ID");
      setLoading(false);
      return;
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const skills = useMemo(() => {
    if (!job) return [];
    return job.skills?.length ? job.skills : (job.requiredSkills ?? []);
  }, [job]);

  if (loading) {
    return <div className="p-6 text-on-surface-variant">职位详情加载中...</div>;
  }

  if (error || !job) {
    return <div className="p-6 text-error">{error || "职位不存在"}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative pb-[80px]">
      <main className="w-full max-w-[375px] md:max-w-3xl mx-auto px-container-margin py-stack-gap-md flex-1 flex flex-col gap-stack-gap-md overflow-y-auto pb-28 md:pb-10">
        <div className="flex items-center">
          <Link
            href="/enterprise/jobs"
            className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            返回职位列表
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{job.title}</h2>
              <span className="font-body-md text-body-md text-primary font-medium">{formatSalary(job)}</span>
            </div>
            <div className="bg-primary/10 px-2 py-1 rounded-md text-primary font-label-md text-label-md flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span>
              {statusText(job.status)}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-variant mt-2">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              {job.location?.city || "地点待定"}
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">work</span>
              {"经验待补充"}
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">school</span>
              {"学历待补充"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-gap-md items-start">
          <div className="md:col-span-2 flex flex-col gap-stack-gap-md">
            {/* Skills Card */}
            {skills.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_offer</span>
                  技能要求
                </h3>
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((tag) => (
                      <span key={tag} className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full font-label-md text-label-md border border-surface-variant font-medium">{tag}</span>
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
              <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-4 pt-2">
                <p><strong className="text-on-surface">岗位职责：</strong></p>
                <div className="whitespace-pre-wrap">{job.description || "暂无职责描述"}</div>
                
                <p className="mt-4"><strong className="text-on-surface">任职要求：</strong></p>
                <div className="whitespace-pre-wrap">{job.requiredSkills?.join("、") || "暂无任职要求"}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-stack-gap-md">
            {/* Stats Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-stack-gap-sm">
              <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex lg:flex-row flex-col lg:justify-between items-center gap-1">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-headline-md text-2xl font-bold text-on-surface">0</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">总浏览量</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex lg:flex-row flex-col lg:justify-between items-center gap-1 mt-2 lg:mt-0">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-headline-md text-2xl font-bold text-on-surface">0</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">收到简历</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">group_add</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Actions */}
      <div className="fixed bottom-4 md:bottom-6 left-0 right-0 w-full z-50 flex gap-4 items-center justify-center max-w-[375px] md:max-w-3xl mx-auto px-container-margin pb-safe">
        <Link href={`/enterprise/jobs/${job.id}/edit`} className="flex-1 h-12 rounded-lg border border-outline-variant text-on-surface font-label-md text-[15px] font-medium hover:bg-surface-container-low flex justify-center items-center transition-colors active:scale-[0.98]">
            修改职位
        </Link>
        <Link href={`/enterprise/recommendations?jobId=${job.id}`} className="flex-[2] h-12 rounded-lg bg-primary text-on-primary font-label-md text-[15px] font-medium shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">person_search</span>
            查看匹配候选人
        </Link>
      </div>
    </div>
  );
}
