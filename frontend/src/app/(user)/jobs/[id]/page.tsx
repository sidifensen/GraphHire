'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi, type Job } from '@/lib/api/public';

function formatSalary(job: Job | null) {
  if (!job || (!job.salaryMin && !job.salaryMax)) return '薪资面议';
  const min = job.salaryMin ? `${Math.round(job.salaryMin / 1000)}k` : '';
  const max = job.salaryMax ? `${Math.round(job.salaryMax / 1000)}k` : '';
  const unit = job.salaryUnit === '月' ? '/月' : job.salaryUnit === '年' ? '/年' : '';
  return min && max ? `${min} - ${max}${unit}` : min || `${max}以下${unit}`;
}

function formatJobType(type: number | null | undefined): string {
  switch (type) {
    case 1: return '全职';
    case 2: return '兼职';
    case 3: return '实习';
    default: return '未知';
  }
}

function formatTime(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJob = async () => {
    if (!jobId) {
      setError('无效的职位参数');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await publicApi.jobs.getById(jobId);
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '职位详情加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen text-on-surface-variant">
        职位详情加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-error">{error}</p>
        <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadJob()}>
          重试
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen text-on-surface-variant">
        职位不存在
      </div>
    );
  }

  const publishTime = formatTime(job.publishedAt);
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/jobs');
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen pb-24">
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex flex-col gap-8">
          <button
            onClick={handleBack}
            className="w-fit inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            返回
          </button>

          {/* 顶部区域：标题 + 基本信息 */}
          <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-20" />

            <div className="relative z-10">
              <h1 className="text-3xl font-headline font-bold text-on-surface mb-4">{job.title}</h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-tertiary mb-6">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">business</span>
                  {job.companyName}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {job.city}{job.district ? ` · ${job.district}` : ''}
                </span>
                {publishTime && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    发布于 {publishTime}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-primary">{formatSalary(job)}</span>
                <span className="w-px h-6 bg-outline-variant" />
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">work_history</span>
                  {formatJobType(job.jobType)}
                </span>
                {job.experience && (
                  <>
                    <span className="w-px h-6 bg-outline-variant" />
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">timeline</span>
                      {job.experience}
                    </span>
                  </>
                )}
                {job.education && (
                  <>
                    <span className="w-px h-6 bg-outline-variant" />
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                      {job.education}
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* 职位描述 */}
          {job.description && (
            <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                职位描述
              </h2>
              <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </section>
          )}

          {/* 职位要求 */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15">
            <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              职位要求
            </h2>
            {job.requiredSkills && job.requiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant">该职位暂未提供结构化技能要求</p>
            )}
          </section>
        </div>
      </main>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 p-6 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto flex justify-center gap-4">
          <button
            onClick={() => router.push(`/match/${job.id}`)}
            className="bg-gradient-to-r from-primary to-primary-container text-white px-12 py-4 rounded-xl text-lg font-bold font-headline shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-300 w-full md:w-auto md:min-w-[400px] flex justify-center items-center gap-2 hover:-translate-y-0.5 active:scale-95"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            AI 智能匹配
          </button>
        </div>
      </div>
    </div>
  );
}
