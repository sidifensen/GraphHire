'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';
import { publicApi, type Job } from '@/lib/api/public';
import { personApi, type PersonMatchDetail } from '@/lib/api/person';
import { matchApi, type GraphScore } from '@/lib/api/match';
import { resumeApi } from '@/lib/api/resume';

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
  const user = authStore((state) => state.user);
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchLoaded, setMatchLoaded] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [graphScore, setGraphScore] = useState<GraphScore | null>(null);
  const [matchDetail, setMatchDetail] = useState<PersonMatchDetail | null>(null);

  const [applying, setApplying] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

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

  const handleMatch = async () => {
    if (!jobId) return;
    if (!user?.id) {
      setActionFeedback('请先登录后使用智能匹配');
      return;
    }
    try {
      setActionFeedback('');
      setMatchLoading(true);
      setMatchError('');
      const [graphResult, detailResult] = await Promise.allSettled([
        matchApi.getGraphScore(user.id, jobId),
        personApi.getMatchDetail(jobId),
      ]);

      if (graphResult.status === 'rejected') {
        throw graphResult.reason;
      }

      setGraphScore(graphResult.value);
      if (detailResult.status === 'fulfilled') {
        setMatchDetail(detailResult.value);
      } else {
        setMatchDetail(null);
      }
      setMatchLoaded(true);
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : '匹配失败，请稍后重试');
      setMatchLoaded(false);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleApplyWithDefaultResume = async () => {
    if (!jobId) return;
    if (!user?.id) {
      setActionFeedback('请先登录后再投递');
      return;
    }
    try {
      setApplying(true);
      setActionFeedback('');
      const resumes = await resumeApi.getMyResumes();
      const defaultResume = resumes.find((resume) => resume.isDefault);
      if (!defaultResume) {
        setActionFeedback('请先设置默认简历');
        return;
      }
      await personApi.apply({ jobId, resumeId: defaultResume.id });
      setActionFeedback('投递成功！');
    } catch (err) {
      setActionFeedback(err instanceof Error ? err.message : '投递失败，请重试');
    } finally {
      setApplying(false);
    }
  };

  const publishTime = formatTime(job?.publishedAt);
  const totalScore = useMemo(() => Math.round(graphScore?.matchRate ?? 0), [graphScore?.matchRate]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/jobs');
  };

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

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex flex-col gap-8">
          <button
            onClick={handleBack}
            className="w-fit inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            返回
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-6">
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

            <aside className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 sticky top-24">
              <h2 className="text-lg font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI 智能匹配
              </h2>
              <p className="text-sm text-on-surface-variant mb-5">
                点击按钮后可在当前页面查看匹配程度，匹配成功后即可默认简历一键投递。
              </p>

              {matchLoaded && (
                <div className="mb-4 space-y-3">
                  <div className="rounded-lg bg-primary/10 text-primary px-3 py-2 font-semibold">
                    匹配度 {totalScore}%
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    匹配等级：{graphScore?.matchLevel || '暂无'}
                  </div>
                  {graphScore?.matchedSkills?.length ? (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-2">已匹配技能</p>
                      <div className="flex flex-wrap gap-2">
                        {graphScore.matchedSkills.map((skill) => (
                          <span key={`matched-${skill}`} className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {graphScore?.missingSkills?.length ? (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-2">待提升技能</p>
                      <div className="flex flex-wrap gap-2">
                        {graphScore.missingSkills.map((skill) => (
                          <span key={`missing-${skill}`} className="px-2 py-1 rounded-full text-xs bg-surface-variant text-on-surface-variant">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {matchDetail?.matchReason && (
                    <p className="text-sm text-on-surface-variant leading-6">{matchDetail.matchReason}</p>
                  )}
                </div>
              )}

              {matchError && (
                <div className="mb-4 rounded-lg border border-error/40 bg-error/10 text-error px-3 py-2 text-sm">
                  {matchError}
                </div>
              )}

              <button
                onClick={() => {
                  if (matchLoaded) {
                    void handleApplyWithDefaultResume();
                    return;
                  }
                  void handleMatch();
                }}
                disabled={matchLoading || applying}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white px-5 py-3 rounded-xl text-base font-bold font-headline shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-300 disabled:opacity-60"
              >
                {matchLoading ? '匹配中...' : applying ? '投递中...' : matchLoaded ? '立即投递' : '开始智能匹配'}
              </button>

              {actionFeedback && (
                <p className={`mt-3 text-sm ${actionFeedback === '投递成功！' ? 'text-primary' : 'text-error'}`}>
                  {actionFeedback}
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
