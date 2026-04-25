'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicApi, type Company, type Job } from '@/lib/api/public';

function formatSalary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return '薪资面议';
  const min = job.salaryMin ? `${Math.round(job.salaryMin / 1000)}k` : '';
  const max = job.salaryMax ? `${Math.round(job.salaryMax / 1000)}k` : '';
  return min && max ? `${min} - ${max}` : min || `${max}以下`;
}

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = Number(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!companyId) {
      setError('无效的企业参数');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const detail = await publicApi.companies.getById(companyId);
      setCompany(detail);

      const jobPage = await publicApi.jobs.search({ companyId, size: 50 });
      setJobs(jobPage.records ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '企业详情加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [companyId]);

  const subtitle = useMemo(() => {
    const city = company?.city ? `${company.city} · ` : '';
    return `${city}在招 ${jobs.length} 个职位`;
  }, [company?.city, jobs.length]);

  if (loading) {
    return <div className="flex-grow flex items-center justify-center min-h-screen text-on-surface-variant">企业详情加载中...</div>;
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
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-8 flex flex-col gap-8">
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col gap-4">
          <button
            className="self-start text-sm text-primary hover:underline"
            onClick={() => router.push('/companies')}
          >
            返回公司列表
          </button>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{company?.name ?? '企业详情'}</h1>
          <p className="text-on-surface-variant">{subtitle}</p>
          <p className="text-sm text-tertiary">{company?.summary || '已认证企业'}</p>
        </section>

        <section className="bg-surface-container-low rounded-xl p-8">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-6">在招职位</h2>

          {jobs.length === 0 ? (
            <p className="text-on-surface-variant">当前暂无公开在招职位</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <article key={job.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-headline font-semibold text-on-surface">{job.title}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">{job.city || company?.city || '地点待补充'} · {formatSalary(job)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(job.requiredSkills ?? []).slice(0, 6).map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs">{skill}</span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      查看职位匹配
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

