'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Briefcase, CheckCircle, ChevronRight, GraduationCap, MapPin, Share2, X, XCircle, Zap } from 'lucide-react';
import { publicApi, type Company, type Job } from '@/lib/api/public';
import { chatApi } from '@/lib/api/chat';
import { matchApi, type GraphScore } from '@/lib/api/match';
import { formatCompanyScale } from '@/features/user-filters/constants';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { useRouter } from 'next/navigation';

const DEFAULT_COMPANY_LOGO = '/default-avatar.svg';

function resolveLogoUrl(url?: string | null) {
  if (!url) return DEFAULT_COMPANY_LOGO;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  if (url.startsWith('/')) return `${getApiBaseUrl()}${url}`;
  return `${getApiBaseUrl()}/${url}`;
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return '薪资面议';
  const minText = min ? `${Math.round(min / 1000)}k` : '';
  const maxText = max ? `${Math.round(max / 1000)}k` : '';
  return minText && maxText ? `${minText}-${maxText}` : minText || maxText;
}

function formatEducation(code?: number | null) {
  const educationMap: Record<number, string> = {
    1: '中专',
    2: '大专',
    3: '本科',
    4: '硕士',
    5: '博士',
  };
  if (!code) return '学历不限';
  return educationMap[code] ?? '学历不限';
}

function formatExperience(experience?: string | null) {
  if (!experience) return '经验不限';
  return experience;
}

function formatJobType(jobType?: number | null) {
  const typeMap: Record<number, string> = {
    1: '全职',
    2: '兼职/临时',
    3: '实习',
  };
  if (!jobType) return '不限';
  return typeMap[jobType] ?? `类型${jobType}`;
}

function formatCompanyAuthStatus(status?: string | null) {
  if (!status) return '未知';
  const upper = status.toUpperCase();
  if (upper === 'VERIFIED') return '已认证';
  if (upper === 'PENDING') return '待认证';
  if (upper === 'REJECTED') return '认证未通过';
  return status;
}

function formatAnnualSalaryTag(salaryMin?: number | null, salaryMax?: number | null) {
  if (!salaryMin && !salaryMax) return '薪资面议';
  return '15薪';
}

function buildJobDescriptionSections(job: Job) {
  const sections: Array<{ title: string; items: string[] }> = [];
  const responsibilities = (job.description ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  if (responsibilities.length > 0) {
    sections.push({ title: '岗位职责', items: responsibilities });
  }
  if (job.requiredSkills && job.requiredSkills.length > 0) {
    sections.push({
      title: '任职要求',
      items: job.requiredSkills.map((skill) => `熟悉 ${skill}`),
    });
  }
  if (sections.length === 0) {
    sections.push({
      title: '岗位职责',
      items: ['职位描述待补充'],
    });
  }
  return sections;
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = Number(params?.id);

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchModal, setMatchModal] = useState<{ open: boolean; loading: boolean; score: GraphScore | null; error: string | null }>({
    open: false, loading: false, score: null, error: null,
  });

  useEffect(() => {
    if (!Number.isFinite(jobId)) {
      setError('无效职位ID');
      setLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const jobResult = await publicApi.jobs.getById(jobId);
        if (!active) return;
        setJob(jobResult);

        const companyId = jobResult.companyId;
        if (companyId && Number.isFinite(companyId)) {
          const companyResult = await publicApi.companies.getById(companyId);
          if (!active) return;
          setCompany(companyResult);
        } else {
          setCompany(null);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '职位详情加载失败');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [jobId]);

  const descriptionSections = useMemo(() => {
    if (!job) return [];
    return buildJobDescriptionSections(job);
  }, [job]);

  const companyLink = useMemo(() => {
    if (company?.id) return `/companies/${company.id}`;
    if (job?.companyId) return `/companies/${job.companyId}`;
    return '/companies';
  }, [company, job]);

  const companyName = company?.name || job?.companyName || '未知企业';
  const companyIndustry = company?.industryName || job?.companyIndustryName || '未知行业';
  const companyScale = formatCompanyScale(company?.scale ?? job?.companyScale ?? null);
  const companyLogoUrl = resolveLogoUrl(company?.avatarUrl ?? job?.companyAvatarUrl ?? null);
  const companyAuthStatusText = formatCompanyAuthStatus(company?.authStatus ?? job?.companyAuthStatus ?? null);

  const handleStartChat = async () => {
    if (!Number.isFinite(jobId)) return;
    try {
      const result = await chatApi.startConversation({ jobId });
      if (result?.conversationId) {
        router.push(`/chat/${result.conversationId}`);
      }
    } catch {
      // keep silent and allow user retry
    }
  };

  const handleSmartMatch = async () => {
    if (!Number.isFinite(jobId)) return;
    setMatchModal({ open: true, loading: true, score: null, error: null });
    try {
      const triggerResult = await matchApi.triggerMatch({ jobId });
      // 后端返回 MatchRecord，id 字段即为 matchId
      const matchId = (triggerResult as unknown as { id: number }).id ?? triggerResult.matchId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detail = await matchApi.getMatchDetail(matchId) as any;
      // MatchDetailResponse.score 是嵌套的 MatchScore 对象，需展平为 GraphScore 结构
      const raw = detail?.score ?? {};
      const levelStr: string = typeof detail?.level === 'string'
        ? detail.level
        : (detail?.level?.name ?? '');
      const graphScore: GraphScore = {
        personId: 0,
        jobId: detail?.jobId ?? jobId,
        totalScore: Math.round(raw.total ?? 0),
        skillScore: Math.round(raw.skillScore ?? 0),
        requirementScore: Math.round(raw.requirementScore ?? 0),
        cityScore: Math.round(raw.cityScore ?? 0),
        salaryScore: Math.round(raw.salaryScore ?? 0),
        educationScore: Math.round(raw.educationScore ?? 0),
        matchLevel: levelStr,
        matchedSkills: [],
        missingSkills: [],
        matchRate: (raw.total ?? 0) / 100,
        reason: detail?.matchReason ?? '',
      };
      setMatchModal({ open: true, loading: false, score: graphScore, error: null });
    } catch (err) {
      setMatchModal({ open: true, loading: false, score: null, error: err instanceof Error ? err.message : '匹配失败，请稍后重试' });
    }
  };

  if (loading) {
    return <div className="p-6 text-on-surface-variant">职位详情加载中...</div>;
  }

  if (error || !job) {
    return <div className="p-6 text-error">{error || '职位不存在'}</div>;
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 md:top-16 z-50 h-16 bg-surface-lowest/90 backdrop-blur-md border-b border-surface-mid flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full">
        <div className="max-w-7xl mx-auto w-full px-5 flex items-center justify-between relative h-full">
          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface"
            >
              <ArrowLeft size={24} />
            </Link>
          </div>
          <h1 className="font-h3 text-h3 text-on-surface absolute left-1/2 -translate-x-1/2 whitespace-nowrap" />
          <div className="flex items-center gap-1 min-w-[40px] justify-end">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-5 md:px-8 pt-6 md:pt-12 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">{job.title || '未知职位'}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-3xl font-black text-primary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="text-sm font-bold text-outline bg-surface-low px-3 py-1 rounded-lg">
                    {formatAnnualSalaryTag(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Tag icon={MapPin} text={[job.city, job.district].filter(Boolean).join(' · ') || '地点待补充'} />
                <Tag icon={Briefcase} text={formatJobType(job.jobType)} />
                <Tag icon={GraduationCap} text={formatEducation(job.educationCode)} />
              </div>

              <div className="mt-6 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-white px-4 py-4 md:px-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-black text-on-surface">所需技能</h2>
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-primary shadow-sm">
                    {(job.requiredSkills ?? []).length} 项
                  </span>
                </div>
                {job.requiredSkills && job.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        data-testid={`job-required-skill-${skill}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-[0_3px_12px_rgba(37,99,235,0.12)]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">暂无技能要求</p>
                )}
              </div>
            </section>

            <section className="space-y-8 bg-surface-lowest md:p-8 md:rounded-3xl md:border md:border-surface-mid">
              <div>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-on-surface">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  职位描述
                </h2>
                <div className="space-y-8">
                  {descriptionSections.map((section) => (
                    <div key={section.title}>
                      <h4 className="font-black text-base mb-4 text-on-surface flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {section.title}
                      </h4>
                      <ul className="text-body-lg text-on-surface-variant leading-relaxed space-y-3 list-none">
                        {section.items.map((item, index) => (
                          <li key={`${section.title}-${index}`} className="flex gap-3">
                            <span className="text-primary font-black mt-1">{String(index + 1).padStart(2, '0')}.</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <section className="sticky top-24">
              <Link
                href={companyLink}
                className="flex flex-col gap-6 p-6 md:p-8 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid hover:border-primary/20 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={companyLogoUrl}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-surface-mid object-contain bg-white p-2 group-hover:scale-105 transition-transform"
                    alt="company logo"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_COMPANY_LOGO;
                    }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-black text-on-surface truncate group-hover:text-primary transition-colors">{companyName}</h3>
                    <p className="text-xs font-bold text-on-surface-variant mt-1">{companyAuthStatusText} · {companyScale}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-surface-mid">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-outline">行业</span>
                    <span className="text-on-surface">{companyIndustry}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-outline">规模</span>
                    <span className="text-on-surface">{companyScale}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary text-sm font-black pt-2">
                  进入公司主页 <ChevronRight size={16} />
                </div>
              </Link>

              <div className="hidden lg:flex flex-col gap-4 mt-8">
                <button onClick={() => void handleStartChat()} className="flex items-center justify-center gap-3 h-14 w-full rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                  立即沟通
                </button>
                <button onClick={() => void handleSmartMatch()} className="flex items-center justify-center gap-3 h-14 w-full rounded-2xl border-2 border-primary text-primary font-black text-lg hover:bg-primary/5 active:scale-[0.98] transition-all">
                  <Zap size={20} fill="currentColor" />
                  智能匹配竞争力
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-lowest flex gap-4 p-5 border-t border-surface-mid pb-safe z-50">
        <button onClick={() => void handleSmartMatch()} className="flex-1 h-12 rounded-xl border border-primary text-primary font-bold flex items-center justify-center gap-2 active:bg-primary/5 transition-colors">
          <Zap size={18} fill="currentColor" />
          智能匹配
        </button>
        <button onClick={() => void handleStartChat()} className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          立即沟通
        </button>
      </div>

      {matchModal.open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <button type="button" aria-label="关闭匹配弹窗" className="absolute inset-0 bg-black/45" onClick={() => setMatchModal((p) => ({ ...p, open: false }))} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg rounded-2xl bg-surface-lowest border border-surface-mid shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-mid">
              <p className="font-black text-on-surface flex items-center gap-2"><Zap size={16} fill="currentColor" className="text-primary" />智能匹配竞争力</p>
              <button type="button" onClick={() => setMatchModal((p) => ({ ...p, open: false }))} className="text-on-surface-variant hover:text-on-surface transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {matchModal.loading ? (
                <div className="py-12 text-center text-on-surface-variant text-sm">匹配分析中，请稍候...</div>
              ) : matchModal.error ? (
                <div className="py-8 text-center text-error text-sm">{matchModal.error}</div>
              ) : matchModal.score ? (
                <MatchScorePanel score={matchModal.score} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Tag({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-low text-on-surface-variant rounded-full text-[10px] font-bold">
      <Icon size={14} />
      {text}
    </div>
  );
}

const LEVEL_LABEL: Record<string, string> = {
  HIGH: '高度匹配', MEDIUM: '中等匹配', LOW: '低度匹配',
};
const LEVEL_COLOR: Record<string, string> = {
  HIGH: 'bg-green-500/10 text-green-600 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  LOW: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs font-bold text-on-surface-variant shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-mid overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-black text-on-surface shrink-0">{score}</span>
    </div>
  );
}

function MatchScorePanel({ score }: { score: GraphScore }) {
  const levelKey = (score.matchLevel ?? '').toUpperCase();
  const levelLabel = LEVEL_LABEL[levelKey] ?? score.matchLevel;
  const levelColor = LEVEL_COLOR[levelKey] ?? 'bg-surface-mid text-on-surface-variant border-surface-mid';
  return (
    <div className="space-y-5">
      {/* 总分 */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-black text-primary leading-none">{score.totalScore}</div>
        <div className="space-y-1">
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${levelColor}`}>{levelLabel}</span>
          <p className="text-xs text-on-surface-variant">匹配率 {Math.round((score.matchRate ?? 0) * 100)}%</p>
        </div>
      </div>
      {/* 维度分 */}
      <div className="space-y-2.5 rounded-xl bg-surface-low px-4 py-4">
        <ScoreBar label="技能" score={score.skillScore} />
        <ScoreBar label="要求" score={score.requirementScore} />
        <ScoreBar label="薪资" score={score.salaryScore} />
        <ScoreBar label="城市" score={score.cityScore} />
        <ScoreBar label="学历" score={score.educationScore} />
      </div>
      {/* 已匹配技能 */}
      {score.matchedSkills?.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-black text-on-surface flex items-center gap-1"><CheckCircle size={13} className="text-green-500" />已匹配技能</p>
          <div className="flex flex-wrap gap-1.5">
            {score.matchedSkills.map((s) => (
              <span key={s} className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600">{s}</span>
            ))}
          </div>
        </div>
      ) : null}
      {/* 缺失技能 */}
      {score.missingSkills?.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-black text-on-surface flex items-center gap-1"><XCircle size={13} className="text-red-400" />待补强技能</p>
          <div className="flex flex-wrap gap-1.5">
            {score.missingSkills.map((s) => (
              <span key={s} className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-0.5 text-xs font-bold text-red-500">{s}</span>
            ))}
          </div>
        </div>
      ) : null}
      {/* AI 分析 */}
      {score.reason ? (
        <div className="rounded-xl border border-surface-mid bg-surface-low px-4 py-3 text-sm text-on-surface-variant leading-relaxed">
          {score.reason}
        </div>
      ) : null}
    </div>
  );
}
