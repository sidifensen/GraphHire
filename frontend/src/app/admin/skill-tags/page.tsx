'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type SkillTagItem } from '@/lib/api/admin';

export default function AdminSkillTagsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<SkillTagItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    adminApi
      .getSkillList({
        keyword: searchKeyword || undefined,
        category: selectedCategory || undefined,
        page,
        pageSize,
      })
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
      })
      .catch(() => {
        setError('加载失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchKeyword, selectedCategory, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive stats from data
  const totalNodes = total;
  const todayNew = list.length;
  const pendingSynonymClusters = list.filter((item) => item.synonyms && item.synonyms.length > 0).length;

  // Format job count with k suffix
  const formatJobCount = (count: number): string => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  // Get categories from list for filter dropdown
  const categories = Array.from(new Set(list.map((item) => item.category)));

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="skill-tags" />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader />

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-8 pb-16 bg-surface">
          <div className="max-w-7xl mx-auto">
            {/* Page Intro */}
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight mb-2">认知图谱与标签治理</h2>
                <p className="text-on-surface-variant font-body text-base">管理并优化全站职业与技能本体，提升 AI 匹配精度。</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  导出图谱数据
                </button>
                <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg font-medium shadow-[0_4px_12px_rgba(0,61,166,0.2)] hover:shadow-[0_6px_16px_rgba(0,61,166,0.3)] transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  创建新节点
                </button>
              </div>
            </div>

            {/* Asymmetric Grid Layout */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Core Data Management (70%) */}
              <div className="col-span-8 flex flex-col gap-6">
                {/* Toolbar */}
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_2px_12px_-4px_rgba(14,28,44,0.04)] flex items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="relative w-72">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                      <input
                        className="w-full bg-surface-container-low text-on-surface pl-10 pr-4 py-2.5 rounded-lg border-transparent focus:border-transparent focus:ring-0 outline-none transition-all border-b-2 border-b-transparent focus:border-b-primary font-body text-sm"
                        placeholder="搜索节点名称或同义词..."
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => {
                          setSearchKeyword(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                    <select
                      className="bg-surface-container-low text-on-surface px-4 py-2.5 rounded-lg border-none focus:ring-0 outline-none font-body text-sm cursor-pointer appearance-none"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">全部分类</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select className="bg-surface-container-low text-on-surface px-4 py-2.5 rounded-lg border-none focus:ring-0 outline-none font-body text-sm cursor-pointer appearance-none">
                      <option>全部状态</option>
                      <option>活跃</option>
                      <option>待合并</option>
                      <option>停用</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-lg text-tertiary bg-surface-container hover:bg-surface-variant transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined">tune</span>
                    </button>
                  </div>
                </div>

                {/* Data List */}
                <div className="flex flex-col gap-4">
                  {/* List Header */}
                  <div className="grid grid-cols-12 px-6 py-2 text-xs font-semibold text-outline tracking-wider uppercase">
                    <div className="col-span-3">节点名称</div>
                    <div className="col-span-2">图谱分类</div>
                    <div className="col-span-2">同义词群</div>
                    <div className="col-span-2">引用热度</div>
                    <div className="col-span-1">状态</div>
                    <div className="col-span-2 text-right">操作</div>
                  </div>

                  {loading && (
                    <div className="flex justify-center py-12">
                      <span className="text-on-surface-variant">加载中...</span>
                    </div>
                  )}

                  {!loading && error && (
                    <div className="flex justify-center py-12">
                      <span className="text-error">{error}</span>
                    </div>
                  )}

                  {!loading && !error && list.length === 0 && (
                    <div className="flex justify-center py-12">
                      <span className="text-on-surface-variant">暂无数据</span>
                    </div>
                  )}

                  {!loading && !error && list.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_16px_-6px_rgba(14,28,44,0.03)] hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-all duration-300 group"
                    >
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-3 flex flex-col gap-1">
                          <span className="font-headline font-bold text-lg text-on-surface">{item.name}</span>
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">history</span> ID: N-{item.id}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-medium">{item.category}</span>
                        </div>
                        <div className="col-span-2 flex flex-col gap-1">
                          <span className="font-medium text-on-surface text-sm">
                            {item.synonyms && item.synonyms.length > 0 ? `${item.synonyms.length} 个别名` : '无别名'}
                          </span>
                          <span className="text-xs text-outline truncate pr-4">
                            {item.synonyms && item.synonyms.length > 0 ? item.synonyms.slice(0, 2).join(', ') + (item.synonyms.length > 2 ? '...' : '') : '-'}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[16px]">share</span>
                          </div>
                          <span className="font-headline font-bold text-on-surface">{formatJobCount(item.jobCount)}</span>
                        </div>
                        <div className="col-span-1">
                          <span className="inline-flex items-center gap-1.5 text-primary text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary"></span> 活跃
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-tertiary" title="编辑节点">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-tertiary" title="合并同义词">
                            <span className="material-symbols-outlined text-[18px]">call_merge</span>
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-error-container hover:text-error flex items-center justify-center text-tertiary transition-colors" title="停用">
                            <span className="material-symbols-outlined text-[18px]">block</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {total > pageSize && (
                    <div className="mt-4 flex justify-center">
                      <button
                        className="text-primary font-medium text-sm flex items-center gap-2 hover:bg-surface-container px-6 py-3 rounded-full transition-colors"
                        onClick={() => setPage((p) => p + 1)}
                      >
                        加载更多图谱节点 <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cognitive Insights & Dashboard (30%) */}
              <div className="col-span-4 flex flex-col gap-6">
                {/* Core Metrics Card */}
                <div
                  className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_-4px_rgba(14,28,44,0.04)]"
                  style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0, 82, 217, 0.05) 0%, transparent 40%)' }}
                >
                  <h3 className="font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">data_exploration</span>
                    图谱健康度
                  </h3>
                  <div className="flex flex-col gap-8">
                    {/* Metric 1 */}
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">总计本体节点</p>
                      <div className="flex items-end gap-3">
                        <span className="font-headline text-4xl font-extrabold text-on-surface leading-none">{totalNodes.toLocaleString()}</span>
                        <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[16px]">trending_up</span> +12%
                        </span>
                      </div>
                    </div>
                    {/* Metric 2 & 3 in Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low rounded-lg p-4">
                        <p className="text-xs text-outline mb-2">当前页节点</p>
                        <span className="font-headline text-2xl font-bold text-primary">{list.length}</span>
                      </div>
                      <div className="bg-error-container/30 rounded-lg p-4 border border-error-container">
                        <p className="text-xs text-on-error-container mb-2">含别名节点</p>
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-2xl font-bold text-error">{pendingSynonymClusters}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations Card */}
                <div className="bg-surface-container-highest rounded-xl p-6 relative overflow-hidden">
                  {/* Decorative blur */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                  <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2 relative z-10">
                    <span className="material-symbols-outlined text-primary-container icon-fill">auto_awesome</span>
                    认知引擎建议
                  </h3>
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-dim">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-on-surface">图谱规模统计</span>
                        <span className="text-[10px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">实时</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        当前图谱共有 <span className="font-medium">{totalNodes.toLocaleString()}</span> 个本体节点，分布在{' '}
                        <span className="font-medium">{categories.length}</span> 个分类中。
                      </p>
                      <button className="w-full text-center text-sm font-medium text-primary hover:bg-surface-container py-2 rounded transition-colors">
                        查看分布详情
                      </button>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-dim">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-on-surface">别名治理建议</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        检测到 <span className="font-medium">{pendingSynonymClusters}</span> 个节点存在同义词定义，建议定期审查并合并相似别名以提升匹配精度。
                      </p>
                      <button className="w-full text-center text-sm font-medium text-tertiary hover:bg-surface-container py-2 rounded transition-colors">
                        查看别名详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
