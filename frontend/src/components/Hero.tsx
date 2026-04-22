'use client';

import { useState } from 'react';

const popularTags = ['Java', 'AI算法', '产品经理', '数据分析', 'Rust'];

const salaryOptions = [
  { value: '', label: '薪资要求' },
  { value: '1', label: '10k-20k' },
  { value: '2', label: '20k-30k' },
  { value: '3', label: '30k以上' },
];

export default function Hero() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [salary, setSalary] = useState('');

  const handleSearch = () => {
    console.log('Search:', { keyword, city, salary });
  };

  return (
    <section className="w-full bg-surface-container-low py-20 relative overflow-hidden flex-shrink-0">
      {/* Ambient Graphic */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 relative z-10 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-6 tracking-tight max-w-4xl leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            AI 驱动
          </span>
          ，图谱智联
        </h1>

        <p className="text-on-surface-variant text-lg md:text-xl font-body max-w-2xl mb-12">
          构建属于你的认知导视体验，精准匹配理想职业节点。
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl ambient-shadow p-2 flex flex-col md:flex-row items-center gap-2 relative">
          {/* Keyword Search */}
          <div className="flex-1 flex items-center px-4 py-3 relative input-tech-focus w-full">
            <span className="material-symbols-outlined text-tertiary mr-3">search</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索职位、技能或公司..."
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-lg"
            />
          </div>

          <div className="w-px h-10 bg-surface-container mx-2 hidden md:block" />

          {/* City */}
          <div className="flex-1 md:max-w-[200px] flex items-center px-4 py-3 relative input-tech-focus w-full">
            <span className="material-symbols-outlined text-tertiary mr-3">location_on</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="城市"
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0"
            />
          </div>

          <div className="w-px h-10 bg-surface-container mx-2 hidden md:block" />

          {/* Salary */}
          <div className="flex-1 md:max-w-[200px] flex items-center px-4 py-3 relative input-tech-focus w-full">
            <span className="material-symbols-outlined text-tertiary mr-3">payments</span>
            <select
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-base cursor-pointer"
            >
              {salaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-8 py-4 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>智能搜索</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <span className="text-sm text-tertiary mr-2">热门探索:</span>
          {popularTags.map((tag) => (
            <a
              key={tag}
              href="#"
              className="bg-surface-variant text-on-surface-variant hover:bg-surface-container-high rounded-full px-4 py-1.5 text-sm transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
