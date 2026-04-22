'use client';

import { useEffect, useState } from 'react';
import { fetchPublicCompanies } from '@/lib/api/homeApi';
import type { HomeCompanyCard } from '@/lib/types/home';

export default function CompaniesPage() {
  const [keyword, setKeyword] = useState('');
  const [companies, setCompanies] = useState<HomeCompanyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCompanies = async (params?: { keyword?: string }) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchPublicCompanies({ keyword: params?.keyword, size: 12 });
      setCompanies(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '企业列表加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-4 flex flex-col gap-12">
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col gap-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary">search</span>
            </div>
            <input
              className="w-full bg-surface-container-lowest text-on-surface border-none rounded-lg pl-12 pr-32 py-4 shadow-sm focus:ring-0 focus:outline-none transition-all placeholder-on-surface-variant font-body"
              placeholder="搜索公司名称..."
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              className="absolute inset-y-2 right-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 rounded-md font-medium hover:opacity-90 transition-opacity"
              onClick={() => void loadCompanies({ keyword })}
            >
              搜索
            </button>
          </div>

          <div className="flex flex-wrap gap-3 w-full max-w-5xl mx-auto text-sm text-on-surface-variant">
            <span className="px-4 py-2 rounded-full bg-surface-container-lowest">真实企业接口</span>
            <span className="px-4 py-2 rounded-full bg-surface-container-lowest">按企业名称筛选</span>
            <span className="px-4 py-2 rounded-full bg-surface-container-lowest">展示在招职位数量</span>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-16 text-on-surface-variant">企业数据加载中...</div>
        ) : error ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <p className="text-error">{error}</p>
            <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadCompanies({ keyword })}>重试</button>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">暂无可展示企业，请稍后重试。</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {companies.map((company) => (
              <article
                key={company.id}
                className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex justify-between items-start z-10 gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-medium">
                        已认证企业
                      </span>
                      {company.city && (
                        <span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-medium">
                          {company.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-on-surface-variant text-sm leading-relaxed z-10 flex-grow font-body">{company.summary}</p>

                <div className="flex justify-between items-end border-t border-outline-variant/15 pt-4 mt-auto z-10">
                  <div className="flex flex-col">
                    <span className="text-xs text-tertiary mb-1">热招职位</span>
                    <span className="text-primary font-bold text-lg">{company.jobCount} 个</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">数据来自正式企业浏览接口</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
