'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchPublicJobs } from '@/lib/api/homeApi';
import type { HomeJobCard } from '@/lib/types/home';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [jobs, setJobs] = useState<HomeJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async (params?: { keyword?: string; city?: string }) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchPublicJobs({ keyword: params?.keyword, city: params?.city, size: 12 });
      setJobs(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '职位列表加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs({ keyword, city });
  }, []);

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 py-12">
        <section className="bg-surface-container-low rounded-[1.5rem] p-8 mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed to-transparent" />
          <div className="relative z-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-8">探索智能匹配职位</h1>
            <div className="flex gap-4 mb-6 flex-col md:flex-row">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">search_insights</span>
                <input
                  className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-0 text-lg shadow-sm"
                  placeholder="输入职位或公司关键词..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="md:w-56 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">location_on</span>
                <input
                  className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-0 text-lg shadow-sm"
                  placeholder="城市"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <button
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 min-h-14"
                onClick={() => void loadJobs({ keyword, city })}
              >
                搜索职位
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
              <span className="px-4 py-2 rounded-full bg-surface-container-lowest">真实职位接口</span>
              <span className="px-4 py-2 rounded-full bg-surface-container-lowest">支持关键词与城市筛选</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">职位数据加载中...</div>
          ) : error ? (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <p className="text-error">{error}</p>
              <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadJobs({ keyword, city })}>重试</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">暂无匹配职位，请调整筛选条件后重试。</div>
          ) : (
            jobs.map((job) => (
              <article
                key={job.id}
                className="bg-surface-container-lowest rounded-[1.5rem] p-8 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] group relative overflow-hidden"
              >
                <div className="flex-grow pr-8 relative z-10">
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <h2 className="font-headline text-2xl font-bold text-primary">{job.title}</h2>
                  </div>
                  <div className="flex items-center gap-6 text-on-surface-variant text-sm mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">business</span>
                      <span className="font-medium text-on-surface">{job.companyName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span>{job.city}{job.district ? `·${job.district}` : ''}</span>
                    </div>
                    <div className="font-headline font-bold text-primary-container text-lg ml-auto">{job.salaryText}</div>
                  </div>
                  {job.requiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <span key={skill} className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant">该职位已切换到正式接口，更多技能标签将在后端结构化字段补齐后继续丰富。</div>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
