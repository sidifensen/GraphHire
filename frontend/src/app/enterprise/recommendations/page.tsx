'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/app/enterprise/_mock/lib/utils";
import { companyApi } from "@/lib/api/company";
import type { EnterpriseJobListItem, EnterpriseRecommendation } from "@/lib/types/enterprise";

function jobStatusText(status?: string | null): string {
  if (status === 'PUBLISHED') return '招聘中';
  if (status === 'CLOSED') return '已关闭';
  if (status === 'DRAFT') return '草稿';
  return '未知';
}

function recommendationName(item: EnterpriseRecommendation): string {
  return item.resume?.userName || item.resume?.fileName || `候选人 #${item.resumeId}`;
}

function toPercent(value?: number | null): number {
  if (value == null || Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value);
}

function formatJobMeta(job: EnterpriseJobListItem): string {
  const city = job.city || '地点待定';
  return `${city} · ${jobStatusText(job.status)}`;
}

function extractSkills(item: EnterpriseRecommendation): string[] {
  const skills = item.resume?.skills;
  if (!skills || skills.length === 0) {
    return [];
  }
  return skills.filter((skill): skill is string => Boolean(skill && skill.trim())).slice(0, 6);
}

export default function Recommendations() {
  const searchParams = useSearchParams();
  const queryJobIdRaw = searchParams.get('jobId');
  const queryJobId = queryJobIdRaw && !Number.isNaN(Number(queryJobIdRaw)) ? Number(queryJobIdRaw) : null;

  const [jobs, setJobs] = useState<EnterpriseJobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<EnterpriseRecommendation[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [matchingAll, setMatchingAll] = useState(false);
  const [mobileJobOpen, setMobileJobOpen] = useState(false);
  const [error, setError] = useState('');

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  const filteredRecommendations = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return recommendations;
    }
    return recommendations.filter((item) => {
      const name = recommendationName(item).toLowerCase();
      const skills = extractSkills(item).join(' ').toLowerCase();
      return name.includes(keyword) || skills.includes(keyword);
    });
  }, [recommendations, searchKeyword]);

  const pickNextJobId = (
    list: EnterpriseJobListItem[],
    preferredJobId: number | null,
    fallbackJobId: number | null,
  ): number | null => {
    const ids = new Set(list.map((job) => job.id));
    if (preferredJobId != null && ids.has(preferredJobId)) {
      return preferredJobId;
    }
    if (fallbackJobId != null && ids.has(fallbackJobId)) {
      return fallbackJobId;
    }
    const published = list.find((job) => job.status === 'PUBLISHED');
    if (published) {
      return published.id;
    }
    return list.length > 0 ? list[0].id : null;
  };

  const loadRecommendations = async (jobId: number) => {
    setLoadingCandidates(true);
    setError('');
    try {
      const data = await companyApi.getRecommendedResumes({ jobId });
      setRecommendations(data ?? []);
    } catch (err) {
      setRecommendations([]);
      setError(err instanceof Error ? err.message : '候选人推荐加载失败');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadJobsAndCurrentRecommendations = async (
    preferredJobId: number | null,
    fallbackJobId: number | null,
  ) => {
    setError('');
    const jobList = await companyApi.getJobList();
    const nextJobs = jobList ?? [];
    setJobs(nextJobs);

    const nextJobId = pickNextJobId(nextJobs, preferredJobId, fallbackJobId);
    setSelectedJobId(nextJobId);

    if (nextJobId == null) {
      setRecommendations([]);
      return;
    }

    await loadRecommendations(nextJobId);
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      setLoading(true);
      setError('');
      try {
        if (cancelled) return;
        await loadJobsAndCurrentRecommendations(queryJobId, null);
      } catch (err) {
        if (cancelled) return;
        setJobs([]);
        setRecommendations([]);
        setError(err instanceof Error ? err.message : '推荐页加载失败');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [queryJobId]);

  const handleSelectJob = async (jobId: number) => {
    if (selectedJobId === jobId) {
      return;
    }
    setSelectedJobId(jobId);
    setMobileJobOpen(false);
    await loadRecommendations(jobId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadJobsAndCurrentRecommendations(selectedJobId, selectedJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMatchAll = async () => {
    if (selectedJobId == null || matchingAll) {
      return;
    }
    setMatchingAll(true);
    setError('');
    try {
      await companyApi.triggerJobMatch(selectedJobId);
      await loadRecommendations(selectedJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '一键匹配失败');
    } finally {
      setMatchingAll(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <main className="w-full max-w-none md:max-w-7xl mx-auto flex-1 flex flex-col md:flex-row md:gap-8 px-3 md:px-8 pt-stack-gap-md md:pt-8 overflow-hidden pb-[80px] md:pb-8">
        <div className="md:hidden flex flex-col gap-stack-gap-sm shrink-0 mb-4">
          <button
            type="button"
            onClick={() => setMobileJobOpen((prev) => !prev)}
            className="relative w-full text-left bg-surface-container-lowest border border-outline-variant rounded-lg px-inline-padding-md py-stack-gap-sm flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">当前推荐职位</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">{selectedJob?.title || '暂无职位'}</span>
            </div>
            <span className={cn('material-symbols-outlined text-outline transition-transform', mobileJobOpen && 'rotate-180')}>expand_more</span>
          </button>
          {mobileJobOpen && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b last:border-b-0 border-surface-variant',
                      selectedJobId === job.id ? 'bg-primary/8' : 'bg-transparent',
                    )}
                  >
                    <div className={cn('text-[15px] font-medium', selectedJobId === job.id ? 'text-primary' : 'text-on-surface')}>
                      {job.title}
                    </div>
                    <div className="text-[12px] text-on-surface-variant mt-1">{formatJobMeta(job)} · {job.matchCount ?? 0} 匹配</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-on-surface-variant">暂无可展示职位</div>
              )}
            </div>
          )}
        </div>

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
              readOnly
            />
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 pb-8 pr-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job.id)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all',
                  selectedJobId === job.id
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-surface-container-lowest border-surface-variant hover:border-outline-variant hover:shadow-sm',
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={cn('font-medium text-[16px]', selectedJobId === job.id ? 'text-primary' : 'text-on-surface')}>
                    {job.title}
                  </h3>
                  <span
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded border font-medium',
                      selectedJobId === job.id
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant',
                    )}
                  >
                    {jobStatusText(job.status)}
                  </span>
                </div>
                <p className="text-[13px] text-on-surface-variant mb-4">{formatJobMeta(job)}</p>

                <div className="flex items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    <span>{job.matchCount ?? 0} 匹配</span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && jobs.length === 0 && (
              <div className="text-sm text-on-surface-variant px-1">暂无可展示职位</div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <div className="hidden md:flex flex-col gap-1 mb-6 shrink-0">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface flex items-center gap-3">
              {selectedJob?.title || '暂无职位'}
              {selectedJob?.department ? (
                <span className="text-sm font-medium bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-md mb-0.5">
                  {selectedJob.department}
                </span>
              ) : null}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">智能引擎已拦截低匹配度简历，为您精选以下候选人</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-stack-gap-xs gap-4 mb-4 shrink-0 border-b border-surface-variant pb-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span>寻得</span>
              <strong className="text-primary text-xl font-bold font-mono">{filteredRecommendations.length}</strong>
              <span>名匹配才俊</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-56 flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-outline-variant mr-2 text-[18px]">search</span>
                <input
                  className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface placeholder-outline-variant outline-none"
                  placeholder="搜索技能或姓名..."
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className={cn(
                    'flex items-center justify-center gap-1.5 text-sm text-on-surface border border-outline-variant hover:bg-surface-container hover:text-on-surface rounded-full px-4 py-2 font-medium transition-all shadow-sm',
                    (refreshing || loading) && 'opacity-70 pointer-events-none',
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[18px]', (refreshing || loading) && 'animate-spin')}>refresh</span>
                  刷新
                </button>
                <button
                  onClick={handleMatchAll}
                  disabled={selectedJobId == null || matchingAll || loading}
                  className={cn(
                    'flex items-center justify-center gap-1.5 text-sm text-on-primary bg-primary hover:opacity-90 rounded-full px-4 py-2 font-medium transition-opacity shadow-sm',
                    (selectedJobId == null || matchingAll || loading) && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[18px]', matchingAll && 'animate-spin')}>bolt</span>
                  一键匹配所有候选人
                </button>
              </div>
            </div>
          </div>

          {error ? <div className="mb-3 text-sm text-error">{error}</div> : null}

          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 pr-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-stack-gap-md">
              {loading || loadingCandidates || refreshing ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm h-[280px] animate-pulse"
                    ></div>
                  ))
              ) : filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((candidate, idx) => {
                  const totalScore = toPercent(candidate.score?.total);
                  const skillScore = toPercent(candidate.score?.skillScore);
                  const requirementScore = toPercent(candidate.score?.requirementScore);
                  const candidateSkills = extractSkills(candidate);
                  const candidateEducation = candidate.resume?.education || '学历待补充';
                  const candidateExperience = candidate.resume?.experience || '经验待补充';
                  const name = recommendationName(candidate);
                  const avatarUrl = candidate.resume?.avatarUrl || null;

                  return (
                    <article
                      key={`${candidate.resumeId}-${candidate.jobId}-${idx}`}
                      className={cn(
                        'bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md flex flex-col gap-stack-gap-sm relative overflow-hidden transition-all',
                        idx > 1 && 'opacity-95',
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl font-label-md text-label-md font-bold flex items-center gap-1',
                          idx === 0 ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant',
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]" style={idx === 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {idx === 0 ? 'star' : 'bar_chart'}
                        </span>
                        {totalScore}% 匹配
                      </div>

                      <div className="flex items-start gap-4 mt-2">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-variant border-2 border-surface-container-lowest shadow-sm shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface font-semibold">
                              {name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 pt-0.5 pr-20">
                          <h2 className="font-headline-sm text-lg font-bold text-on-surface truncate">{name}</h2>
                          <p className="font-body-md text-[14px] text-on-surface-variant truncate mt-0.5">{candidate.resume?.fileName || `简历 #${candidate.resumeId}`}</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-low/50 rounded-lg p-3.5 border border-outline-variant/60 flex flex-col gap-2.5 mt-1 text-[13px] text-on-surface-variant">
                        <div className="flex items-center justify-between">
                          <span>综合匹配度 {totalScore}%</span>
                          <span>技能匹配度 {skillScore}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>岗位要求匹配度 {requirementScore}%</span>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2 pt-1">
                          {candidateSkills.length > 0 ? (
                            candidateSkills.map((skill) => (
                              <span key={skill} className="text-[12px] px-2.5 py-1 rounded border bg-primary/5 text-primary border-primary/20 font-medium">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[12px] px-2.5 py-1 rounded border bg-surface-container border-outline-variant text-on-surface-variant">
                              技能待补充
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-5 pt-3 border-t border-outline-variant/50 text-[13px] text-on-surface-variant font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            {candidateEducation}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">work_history</span>
                            {candidateExperience}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Link href={`/enterprise/candidates/${candidate.resumeId}`} className="flex-1 h-10 border border-outline-variant text-on-surface rounded-lg font-medium text-[14px] hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center">
                          查看详情
                        </Link>
                        <button className={cn('flex-1 h-10 rounded-lg text-[14px] font-semibold shadow-sm active:scale-95 transition-all hover:opacity-90', idx === 0 ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container')}>
                          邀请面试
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-on-surface-variant">暂无匹配候选人</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

