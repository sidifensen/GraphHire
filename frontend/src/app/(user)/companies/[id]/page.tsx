'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Briefcase, ChevronRight, MapPin } from 'lucide-react';
import { publicApi, type Company, type Job } from '@/lib/api/public';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { formatCompanyScale } from '@/features/user-filters/constants';

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return '薪资面议';
  const minText = min ? `${Math.round(min / 1000)}k` : '';
  const maxText = max ? `${Math.round(max / 1000)}k` : '';
  return minText && maxText ? `${minText}-${maxText}` : minText || maxText;
}

const DEFAULT_AVATAR = '/default-avatar.svg';

type DetailTab = 'intro' | 'jobs';

function resolveLogoUrl(url?: string | null) {
  if (!url) return DEFAULT_AVATAR;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  if (url.startsWith('/')) return `${getApiBaseUrl()}${url}`;
  return `${getApiBaseUrl()}/${url}`;
}

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>('intro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(companyId)) {
      setError('无效公司ID');
      setLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [companyResult, jobsResult] = await Promise.all([
          publicApi.companies.getById(companyId),
          publicApi.jobs.search({ companyId, page: 1, size: 10, sortBy: 'createTime' }),
        ]);
        if (!active) return;
        setCompany(companyResult);
        setJobs(jobsResult.records ?? []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '公司详情加载失败');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [companyId]);

  const companyDescription = useMemo(() => {
    if (!company) return '';
    return company.description?.trim() || '暂无公司介绍';
  }, [company]);

  if (loading) {
    return <div className="p-6 text-on-surface-variant">公司详情加载中...</div>;
  }

  if (error || !company) {
    return <div className="p-6 text-error">{error || '公司不存在'}</div>;
  }

  return (
    <div className="flex flex-col">
      <main className="mx-auto mt-6 w-full max-w-7xl px-5 pb-24 md:mt-12 md:px-8">
        <div className="mb-5">
          <Link href="/companies" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary">
            <ArrowLeft size={16} /> 返回公司列表
          </Link>
        </div>

        <section className="border-b border-surface-mid bg-surface-lowest px-4 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-surface-mid/70 bg-white md:h-20 md:w-20">
                <img src={resolveLogoUrl(company.avatarUrl)} className="h-full w-full object-cover" alt={company.name} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-on-surface md:text-4xl">{company.name}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                  <MapPin size={14} />
                  <span>{company.address || company.city || '地址待补充'}</span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 text-sm font-bold text-primary">在招 {company.jobCount ?? jobs.length}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="bg-surface-low px-3 py-1 text-xs font-bold text-on-surface-variant">
              {company.industryName || '未知行业'}
            </span>
            <span className="bg-surface-low px-3 py-1 text-xs font-bold text-on-surface-variant">
              {formatCompanyScale(company.scale)}
            </span>
            <span className="bg-surface-low px-3 py-1 text-xs font-bold text-on-surface-variant">
              {company.city || '地点待补充'}
            </span>
          </div>

          <div className="mt-7 border-b border-surface-mid">
            <div role="tablist" aria-label="公司详情内容切换" className="flex items-center gap-8">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'intro'}
                className={`border-b-2 pb-3 text-sm font-bold transition-colors ${
                  activeTab === 'intro'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setActiveTab('intro')}
              >
                公司介绍
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'jobs'}
                className={`border-b-2 pb-3 text-sm font-bold transition-colors ${
                  activeTab === 'jobs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setActiveTab('jobs')}
              >
                在招职位
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 bg-surface-lowest px-4 py-4 md:px-6 md:py-5">
          {activeTab === 'intro' ? (
            <>
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-black text-on-surface">
                <span className="h-6 w-1 bg-primary" />
                公司介绍
              </h2>
              <p className="leading-relaxed whitespace-pre-wrap text-on-surface-variant">{companyDescription}</p>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-on-surface">在招职位</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{jobs.length}</span>
                </div>
                <Link href="/jobs" className="flex items-center gap-1 text-sm font-black text-primary transition-all hover:gap-2">
                  全部职位 <ChevronRight size={16} />
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="border border-dashed border-surface-mid px-4 py-5 text-sm text-on-surface-variant">暂无在招职位</div>
              ) : (
                <div className="flex flex-col border-t border-surface-mid">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block border-b border-surface-mid px-3 py-4 transition-colors hover:bg-surface-low"
                    >
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h3 className="truncate pr-4 font-bold text-on-surface">{job.title}</h3>
                        <span className="whitespace-nowrap font-bold text-primary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <MapPin size={12} />
                        <span>{[job.city, job.district].filter(Boolean).join(' · ') || '地点待补充'}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                        <Briefcase size={12} />
                        <span>{job.requiredSkills?.slice(0, 2).join(' / ') || '技能待补充'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
