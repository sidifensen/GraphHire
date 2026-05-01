'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingTextLoader from '@/components/ui/LoadingTextLoader';
import { fetchHomeOverview } from '@/lib/api/homeApi';
import type { HomeCompanyCard, HomeJobCard, HomeOverview } from '@/lib/types/home';

const emptyOverview: HomeOverview = {
  featuredJobs: [],
  popularCompanies: [],
  hotCities: [],
};

interface HomePageClientProps {
  initialOverview: HomeOverview;
  initialError: string;
}

export default function HomePageClient({ initialOverview, initialError }: HomePageClientProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [overview, setOverview] = useState<HomeOverview>(initialOverview || emptyOverview);

  const hasData = useMemo(
    () => overview.featuredJobs.length > 0 || overview.popularCompanies.length > 0,
    [overview]
  );

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchHomeOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '首页数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (city.trim()) params.set('city', city.trim());
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow w-full">
        <section className="bg-surface-container-low py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-8 relative z-10 flex flex-col items-center text-center">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-6 tracking-tight max-w-4xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                AI 驱动
              </span>
              ，图谱智联
            </h1>

            <p className="text-on-surface-variant text-lg md:text-xl font-body max-w-2xl mb-12">
              构建属于你的认知导视体验，精准匹配理想职业节点。
            </p>

            <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] p-2 flex flex-col md:flex-row items-center gap-2 relative">
              <div className="flex-1 flex items-center px-4 py-3 relative input-tech-focus w-full">
                <span className="material-symbols-outlined text-tertiary mr-3">search</span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-lg"
                  placeholder="搜索职位或公司..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="w-px h-10 bg-surface-container mx-2 hidden md:block" />

              <div className="flex-1 md:max-w-[200px] flex items-center px-4 py-3 relative input-tech-focus w-full">
                <span className="material-symbols-outlined text-tertiary mr-3">location_on</span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0"
                  placeholder="城市"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <button
                className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-8 py-4 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={handleSearch}
              >
                <span>智能搜索</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {overview.hotCities.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <span className="text-sm text-tertiary mr-2">热门城市:</span>
                {overview.hotCities.map((item) => (
                  <button
                    key={item}
                    className="bg-surface-variant text-on-surface-variant hover:bg-surface-container-high rounded-full px-4 py-1.5 text-sm transition-colors"
                    onClick={() => setCity(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-8 py-16 w-full">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-4 text-center text-on-surface-variant">
              <LoadingTextLoader className="text-primary" label="Loading" />
              <p>首页数据加载中...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <p className="text-error">{error}</p>
              <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadOverview()}>
                重试
              </button>
            </div>
          ) : !hasData ? (
            <div className="py-16 text-center text-on-surface-variant">暂无可展示的真实首页数据</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">为您精选职位</h2>
                  <button
                    className="text-primary hover:text-primary-container text-sm font-medium flex items-center gap-1 transition-colors"
                    onClick={() => router.push('/jobs')}
                  >
                    查看全部职位
                    <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                  </button>
                </div>

                {overview.featuredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/jobs/${job.id}`);
                      }
                    }}
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>

              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-surface-container-low rounded-2xl p-8 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 30%, #003da6 2px, transparent 2px), radial-gradient(circle at 80% 60%, #4a6ae7 2px, transparent 2px)',
                      backgroundSize: '60px 60px',
                    }}
                  />

                  <h2 className="font-headline text-xl font-bold text-on-surface mb-6 relative z-10">
                    认知导视体系
                  </h2>

                  <div className="flex flex-col gap-6 relative z-10">
                    <InfoItem icon="psychology" title="智能解析" text="首页职位、企业和城市热点均来自正式接口聚合结果。" />
                    <InfoItem icon="hub" title="图谱分析" text="后端优先输出可展示结构，减少前端临时拼装字段。" />
                    <InfoItem icon="my_location" title="真实浏览" text="公共浏览页已经切换为真实职位与真实企业数据。" />
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-headline text-xl font-bold text-on-surface">热门企业</h2>
                    <button
                      className="text-tertiary hover:text-primary text-sm transition-colors material-symbols-outlined"
                      onClick={() => router.push('/companies')}
                    >
                      more_horiz
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {overview.popularCompanies.map((company) => (
                      <button
                        key={company.id}
                        className="flex flex-col items-start justify-center p-4 bg-surface rounded-xl hover:bg-surface-container-low transition-colors group text-left"
                        onClick={() => router.push('/companies')}
                      >
                        <span className="text-sm font-semibold text-on-surface">{company.name}</span>
                        <span className="text-xs text-tertiary mt-1">{company.city || '城市待补充'} · 在招 {company.jobCount} 个职位</span>
                        <span className="text-xs text-on-surface-variant mt-2">{company.summary}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function InfoItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-primary-fixed flex flex-shrink-0 items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h4 className="font-bold text-on-surface mb-1">{title}</h4>
        <p className="text-sm text-on-surface-variant">{text}</p>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: HomeJobCard }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-all duration-300 group border border-transparent hover:border-surface-container-high relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />

      <div className="flex justify-between items-start mb-4 relative z-10 gap-6">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-tertiary mt-1 flex items-center gap-2 flex-wrap">
            <span>{job.companyName}</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>{job.city}{job.district ? `·${job.district}` : ''}</span>
          </p>
        </div>
        <span className="text-xl font-bold text-primary block whitespace-nowrap">{job.salaryText}</span>
      </div>

      {job.requiredSkills.length > 0 ? (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {job.requiredSkills.map((skill) => (
            <span key={skill} className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs">
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-sm text-on-surface-variant">当前职位已切换真实接口，技能标签待后端进一步补充结构化结果。</div>
      )}
    </div>
  );
}
