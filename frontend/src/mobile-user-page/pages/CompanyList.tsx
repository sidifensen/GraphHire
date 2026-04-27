"use client";

import React, { useState } from 'react';
import { Search, Bell, Share2, Building2 } from 'lucide-react';
import { Link } from '@/mobile-user-page/router';
import { motion } from 'framer-motion';
import { MOCK_COMPANIES } from '../mockData';
import { useLoading } from '../hooks/useLoading';
import { Skeleton } from '../components/Skeleton';

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const isLoading = useLoading(600);

  const filteredCompanies = MOCK_COMPANIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const hotCompanies = MOCK_COMPANIES.slice(1, 3);
  const allCompanies = MOCK_COMPANIES.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Top App Bar */}
      <header className="bg-white sticky top-0 z-50 flex items-center justify-between px-5 h-16 border-b border-surface-mid shadow-sm">
        <button className="text-primary p-2 -ml-2 hover:bg-primary/10 rounded-full transition-colors">
          <Search size={24} />
        </button>
        <div className="text-xl font-black text-primary tracking-tighter">GraphHire</div>
        <Link to="/notifications" className="text-primary p-2 -mr-2 hover:bg-primary/10 rounded-full transition-colors relative">
          <Bell size={24} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </Link>
      </header>

      <main className="pt-4 flex flex-col gap-6">
        {/* Search Section */}
        <section className="px-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text" 
              placeholder="搜索公司、行业或关键词"
              className="w-full h-11 pl-10 pr-4 bg-white border border-surface-mid rounded-xl text-body-md focus:border-primary outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* Categories */}
        <section className="overflow-x-auto hide-scrollbar px-5">
          <div className="flex gap-2 whitespace-nowrap">
            <button className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-full border border-transparent">全部行业</button>
            {['互联网/AI', '金融科技', '新能源', '生物医疗'].map(cat => (
              <button key={cat} className="bg-white text-on-surface border border-surface-mid font-bold text-xs px-4 py-2 rounded-full hover:bg-surface-low transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Recommendations */}
        <section className="px-5">
          <h2 className="text-xl font-black mb-4">热门推荐</h2>
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              [1, 2].map(i => <div key={i}><Skeleton className="h-40 rounded-2xl" /></div>)
            ) : (
              hotCompanies.map(company => (
                <Link 
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-surface-mid flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={company.logo} className="w-12 h-12 rounded-lg object-contain mb-2 border border-surface-low" alt={company.name} />
                  <h3 className="font-bold text-sm w-full truncate mb-1">{company.name}</h3>
                  <p className="text-[10px] text-outline truncate w-full mb-3">{company.industry} · {company.size}</p>
                  <div className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                    热招 {company.openPositions} 职位
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* All Companies */}
        <section className="px-5 flex flex-col gap-4">
          <h2 className="text-xl font-black">全部公司</h2>
          <div className="flex flex-col gap-3">
             {isLoading ? (
               [1, 2, 3].map(i => <div key={i}><Skeleton className="h-32 rounded-2xl" /></div>)
             ) : (
               allCompanies.map(company => (
                <Link 
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-surface-mid flex gap-4 items-start active:bg-surface-low transition-all"
                >
                  <img src={company.logo} className="w-14 h-14 rounded-lg object-contain bg-white border border-surface-low p-1 mt-1" alt={company.name} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-on-surface truncate pr-2">{company.name}</h3>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded whitespace-nowrap">在招 {company.openPositions}</span>
                    </div>
                    <p className="text-[11px] text-outline mb-2">{company.industry} · {company.stage} · {company.headquarters.split(' · ')[1] || company.headquarters}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {company.intro}
                    </p>
                  </div>
                </Link>
              ))
             )}
          </div>
        </section>
      </main>
    </div>
  );
}

