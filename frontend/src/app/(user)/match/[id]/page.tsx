'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';
import { personApi, type PersonMatchDetail } from '@/lib/api/person';
import { publicApi, type Job } from '@/lib/api/public';
import { matchApi, type GraphScore } from '@/lib/api/match';
import { resumeApi } from '@/lib/api/resume';

function CircularProgress({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox={`0 0 ${size} ${size}`}>
        <circle className="stroke-surface-container-highest" cx={size / 2} cy={size / 2} fill="none" r={radius} strokeWidth="8" />
        <circle className="stroke-primary transition-all duration-1000 ease-out" cx={size / 2} cy={size / 2} fill="none" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline font-bold text-primary block leading-none" style={{ fontSize: size * 0.3 }}>{score}<span className="text-[0.5em]">%</span></span>
        <span className="text-[10px] text-tertiary font-medium uppercase tracking-widest mt-1">总匹配度</span>
      </div>
    </div>
  );
}

function formatSalary(job?: Job | null) {
  if (!job || (!job.salaryMin && !job.salaryMax)) return '薪资面议';
  const min = job.salaryMin ? `${Math.round(job.salaryMin / 1000)}k` : '';
  const max = job.salaryMax ? `${Math.round(job.salaryMax / 1000)}k` : '';
  return min && max ? `${min} - ${max}` : min || `${max}以下`;
}

export default function MatchDetailPage() {
  const params = useParams();
  const user = authStore((state) => state.user);
  const jobId = Number(params.id);
  const [detail, setDetail] = useState<PersonMatchDetail | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [graphScore, setGraphScore] = useState<GraphScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResumeSelect, setShowResumeSelect] = useState(false);
  const [resumes, setResumes] = useState<Array<{ id: number; fileName: string; isDefault: boolean }>>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);

  const loadData = async () => {
    if (!jobId) {
      setError('无效的职位参数');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const [matchDetailResult, jobDetailResult] = await Promise.allSettled([
        personApi.getMatchDetail(jobId),
        publicApi.jobs.getById(jobId),
      ]);
      const matchDetail = matchDetailResult.status === 'fulfilled' ? matchDetailResult.value : null;
      const jobDetail = jobDetailResult.status === 'fulfilled' ? jobDetailResult.value : null;

      setDetail(matchDetail);
      setJob(jobDetail);

      if (!matchDetail && !jobDetail) {
        const rootError = matchDetailResult.status === 'rejected'
          ? matchDetailResult.reason
          : jobDetailResult.status === 'rejected'
            ? jobDetailResult.reason
            : new Error('匹配详情加载失败');
        throw rootError;
      }

      if (user?.id) {
        const graph = await matchApi.getGraphScore(user.id, jobId).catch(() => null);
        setGraphScore(graph);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '匹配详情加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [jobId, user?.id]);

  const dimensions = useMemo(() => {
    const score = detail?.score;
    return [
      { name: '技能', score: Math.round(score?.skillScore ?? graphScore?.matchRate ?? 0) },
      { name: '经验', score: Math.round(score?.expScore ?? 0) },
      { name: '学历', score: Math.round(score?.eduScore ?? 0) },
      { name: '薪资', score: Math.round(score?.salScore ?? 0) },
      { name: '地点', score: Math.round(score?.cityScore ?? 0) },
    ];
  }, [detail, graphScore]);

  const skillRows = useMemo(() => {
    const matched = graphScore?.matchedSkills ?? [];
    const missing = graphScore?.missingSkills ?? [];
    return [
      ...matched.map((item) => ({ name: item, matchLevel: '高匹配', score: 100 })),
      ...missing.map((item) => ({ name: item, matchLevel: '待补足', score: 40 })),
    ];
  }, [graphScore]);

  const totalScore = Math.round(detail?.score?.total ?? graphScore?.totalScore ?? 0);

  const loadResumes = async () => {
    try {
      const list = await resumeApi.getMyResumes();
      const sorted = list.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      setResumes(sorted.map(r => ({ id: r.id, fileName: r.fileName, isDefault: r.isDefault })));
      const defaultResume = sorted.find(r => r.isDefault) || sorted[0];
      if (defaultResume) setSelectedResumeId(defaultResume.id);
    } catch (err) {
      console.error('Failed to load resumes', err);
    }
  };

  const handleApply = async () => {
    if (resumes.length === 0) {
      setShowResumeSelect(true);
      await loadResumes();
      return;
    }
    if (resumes.length === 1) {
      setSelectedResumeId(resumes[0].id);
    }
    setShowResumeSelect(true);
  };

  const confirmApply = async () => {
    if (!selectedResumeId) return;
    try {
      setApplying(true);
      await personApi.apply({ jobId, resumeId: selectedResumeId });
      alert('投递成功！');
      setShowResumeSelect(false);
    } catch (err: any) {
      alert(err.message || '投递失败，请重试');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="flex-grow flex items-center justify-center min-h-screen text-on-surface-variant">匹配详情加载中...</div>;
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-error">{error}</p>
        <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadData()}>重试</button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen pb-24">
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[65%] space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                    <h1 className="text-3xl font-headline font-bold text-on-surface">{job?.title ?? detail?.job?.title ?? '匹配职位'}</h1>
                  </div>
                  <p className="text-tertiary text-lg mb-6">{job?.companyName ?? detail?.job?.companyName ?? '企业信息待补充'} · {job?.city ?? '地点待补充'}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium">{formatSalary(job)}</span>
                    {detail?.level && <span className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium">匹配等级：{detail.level}</span>}
                    {graphScore?.matchLevel && <span className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">auto_awesome</span>AI {graphScore.matchLevel}</span>}
                  </div>
                </div>
                <CircularProgress score={totalScore} />
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow duration-300 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                职位要求
              </h2>
              {job?.requiredSkills && job.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant">该职位暂未提供结构化技能要求</p>
              )}
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow duration-300 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 text-on-surface"><span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>AI 深度认知解析</h2>
              <div className="space-y-6">
                <p className="text-on-surface-variant leading-relaxed text-base">{graphScore?.reason ?? detail?.matchReason ?? '当前已切换正式接口，等待更多匹配分析结果。'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-5 rounded-lg flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-primary">done_all</span></div>
                    <div>
                      <h3 className="font-medium text-on-surface mb-1">已匹配技能</h3>
                      <p className="text-sm text-tertiary">{(graphScore?.matchedSkills ?? []).join('、') || '暂无结构化技能匹配结果'}</p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-5 rounded-lg flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-primary">trending_up</span></div>
                    <div>
                      <h3 className="font-medium text-on-surface mb-1">待补足技能</h3>
                      <p className="text-sm text-tertiary">{(graphScore?.missingSkills ?? []).join('、') || '暂无明显短板技能'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow duration-300 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-8 flex items-center gap-2 text-on-surface"><span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>compare_arrows</span>技能维度明细对比</h2>
              <div className="space-y-8">
                {skillRows.length > 0 ? skillRows.map((skill) => (
                  <div key={skill.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-on-surface">{skill.name}</span>
                      <span className={`font-bold ${skill.matchLevel === '高匹配' ? 'text-primary' : 'text-tertiary'} text-sm`}>{skill.matchLevel}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden"><div className="bg-primary h-full" style={{ width: `${skill.score}%` }} /></div>
                    </div>
                  </div>
                )) : <div className="text-on-surface-variant">暂无技能明细，请稍后重试。</div>}
              </div>
            </section>
          </div>

          <div className="w-full lg:w-[35%] space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 sticky top-24">
              <h3 className="text-lg font-headline font-bold mb-6 text-on-surface">五维匹配雷达分析</h3>
              <div className="space-y-5">
                {dimensions.map((dim) => (
                  <div key={dim.name} className="flex items-center gap-4">
                    <span className="w-12 text-sm text-tertiary font-medium">{dim.name}</span>
                    <div className="flex-1 bg-surface-container-highest rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%` }} /></div>
                    <span className="w-8 text-right text-sm font-bold text-primary">{dim.score}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 p-6 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto flex justify-center">
          <button onClick={() => void handleApply()} className="bg-gradient-to-r from-primary to-primary-container text-white px-12 py-4 rounded-xl text-lg font-bold font-headline shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-300 w-full md:w-auto md:min-w-[400px] flex justify-center items-center gap-2 hover:-translate-y-0.5 active:scale-95">
            <span className="material-symbols-outlined">send</span>
            立即投递
          </button>
        </div>
      </div>

      {showResumeSelect && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-6">选择简历投递</h3>
            <div className="space-y-3 mb-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResumeId(resume.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedResumeId === resume.id ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedResumeId === resume.id ? 'border-primary bg-primary' : 'border-outline'}`}>
                      {selectedResumeId === resume.id && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{resume.fileName}</p>
                      {resume.isDefault && <span className="text-xs text-primary">默认简历</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowResumeSelect(false)} className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors">取消</button>
              <button onClick={() => void confirmApply()} disabled={!selectedResumeId || applying} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {applying ? '投递中...' : '确认投递'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
