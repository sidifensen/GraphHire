'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { companyApi } from '@/lib/api/company';
import { recommendationName, recommendationScore } from '@/lib/mappers/enterpriseMapper';
import type { EnterpriseJobListItem, EnterpriseRecommendation } from '@/lib/types/enterprise';

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<EnterpriseJobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<EnterpriseRecommendation[]>([]);
  const [keyword, setKeyword] = useState('');
  const [expandedResumeId, setExpandedResumeId] = useState<number | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async (jobId: number) => {
    setLoadingRecommendations(true);
    setError(null);
    try {
      const response = await companyApi.getRecommendedResumes({ jobId });
      setRecommendations(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '推荐结果加载失败');
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    setError(null);
    try {
      const response = await companyApi.getJobList({ status: 'PUBLISHED' });
      setJobs(response);
      if (response.length === 0) {
        setSelectedJobId(null);
        setRecommendations([]);
        return;
      }

      const queryJobId = Number(searchParams.get('jobId'));
      const matchedJobId = Number.isFinite(queryJobId) && response.some((job) => job.id === queryJobId)
        ? queryJobId
        : response[0].id;
      setSelectedJobId(matchedJobId);
      await loadRecommendations(matchedJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '职位列表加载失败');
      setJobs([]);
      setRecommendations([]);
      setSelectedJobId(null);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  const filteredRecommendations = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return recommendations;
    }
    return recommendations.filter((item) => {
      const haystacks = [
        recommendationName(item),
        item.matchReason || '',
        item.resume?.fileName || '',
        item.job?.title || '',
      ];
      return haystacks.some((value) => value.toLowerCase().includes(normalized));
    });
  }, [keyword, recommendations]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

  const handleSelectJob = async (jobId: number) => {
    setSelectedJobId(jobId);
    setExpandedResumeId(null);
    await loadRecommendations(jobId);
  };

  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="智能推荐引擎"
        description={selectedJob ? `基于职位“${selectedJob.title}”展示真实候选人匹配结果。` : '请选择已发布职位查看真实推荐结果。'}
        action={
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-[20px]">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-sm text-sm focus:ring-0 focus:border-b-2 focus:border-primary w-64 placeholder:text-outline shadow-sm"
              placeholder="搜索候选人或匹配理由..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        }
      />

      {loadingJobs ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">推荐职位加载中...</div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadJobs()}>重试</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">当前没有已发布职位，暂时无法生成候选人推荐。</div>
      ) : (
        <div className="flex-1 flex overflow-hidden gap-8 max-w-[1440px] mx-auto w-full">
          <aside className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
              <h3 className="font-headline font-semibold text-on-surface mb-4 text-base">在招职位目标</h3>
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    className={`text-left rounded-lg border px-4 py-3 transition-colors ${selectedJobId === job.id ? 'border-primary bg-primary-fixed/40 text-on-surface' : 'border-surface-container-high bg-surface text-on-surface-variant hover:border-primary/40 hover:text-on-surface'}`}
                    onClick={() => void handleSelectJob(job.id)}
                  >
                    <div className="font-medium">{job.title}</div>
                    <div className="mt-1 text-xs text-tertiary">{job.department || '未填写部门'} · {job.city || '城市待定'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
              <h3 className="font-headline font-semibold text-on-surface mb-4 text-base">推荐说明</h3>
              <div className="space-y-3 text-sm text-on-surface-variant">
                <p>推荐列表来自后端真实匹配接口，当前按所选职位实时刷新。</p>
                <p>“邀请面试”尚未接入专用后端流程，因此本页仅展示推荐结果，不伪造成功提示。</p>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-low rounded-xl p-6">
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">{filteredRecommendations.length}</span>
                <span>份推荐简历</span>
                {selectedJob && <span className="text-outline">· {selectedJob.title}</span>}
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-outline rounded-md font-medium text-sm cursor-not-allowed" disabled>
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  批量导出（待接入）
                </button>
              </div>
            </div>

            {loadingRecommendations ? (
              <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">推荐结果加载中...</div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
                {recommendations.length === 0 ? '当前职位暂无推荐候选人。' : '没有匹配搜索条件的候选人。'}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
                {filteredRecommendations.map((item) => {
                  const score = recommendationScore(item);
                  const expanded = expandedResumeId === item.resumeId;
                  return (
                    <div key={`${item.jobId}-${item.resumeId}`} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4 ambient-shadow relative overflow-hidden group">
                      <div className="flex flex-col xl:flex-row gap-6">
                        <div className="xl:w-56 flex-shrink-0">
                          <h3 className="text-lg font-headline font-bold text-on-surface leading-tight">{recommendationName(item)}</h3>
                          <p className="text-sm text-primary font-medium mt-1">简历 ID：{item.resumeId}</p>
                          <p className="text-xs text-on-surface-variant mt-1">目标职位：{item.job?.title || selectedJob?.title || `职位 #${item.jobId}`}</p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-4 border-l border-surface-container-high pl-6 min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">技能匹配 {Math.round(item.score?.skillScore ?? 0)}%</span>
                            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">经验匹配 {Math.round(item.score?.expScore ?? 0)}%</span>
                            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full whitespace-nowrap">学历匹配 {Math.round(item.score?.eduScore ?? 0)}%</span>
                          </div>
                          <div className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant leading-6">
                            {item.matchReason || '后端暂未返回匹配理由，当前仅展示真实匹配分数。'}
                          </div>
                          {expanded && (
                            <div className="rounded-lg border border-surface-container-high p-4 text-sm text-on-surface-variant space-y-2">
                              <div>城市匹配：{Math.round(item.score?.cityScore ?? 0)}%</div>
                              <div>薪资匹配：{Math.round(item.score?.salScore ?? 0)}%</div>
                              <div>附件名称：{item.resume?.fileName || '未提供'}</div>
                            </div>
                          )}
                        </div>

                        <div className="xl:w-40 flex flex-col items-center justify-between flex-shrink-0 border-l border-surface-container-high pl-6 gap-4">
                          <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-primary-fixed text-primary">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-headline font-bold text-primary leading-none">{score}<span className="text-sm">%</span></span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2 bg-surface-container-highest text-primary text-xs font-medium rounded-md hover:bg-surface-container transition-colors" onClick={() => setExpandedResumeId(expanded ? null : item.resumeId)}>
                              {expanded ? '收起' : '详情'}
                            </button>
                            <button className="flex-1 py-2 bg-surface-container-high text-outline text-xs font-medium rounded-md cursor-not-allowed" disabled title="后端暂无面试邀请接口">
                              邀请
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </EnterpriseContent>
  );
}
