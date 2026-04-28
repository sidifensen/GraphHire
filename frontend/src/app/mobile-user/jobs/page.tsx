"use client";

import React, { useState } from 'react';
import { Search, ChevronDown, Zap, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { Link } from "../_lib/router";
import { motion } from 'framer-motion';
import { MOCK_JOBS } from "../_data/mockData";
import { useLoading } from "../_hooks/useLoading";
import { JobCardSkeleton } from "../_components/Skeleton";

export default function JobList() {
  const [search, setSearch] = useState('');
  const isLoading = useLoading();

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Search Header */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-white border-b border-surface-mid px-5 py-3 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text" 
              placeholder="搜索职位、公司、关键词"
              className="w-full h-11 pl-10 pr-4 bg-surface-low border border-surface-mid rounded-xl text-body-md focus:border-primary-container outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 h-11 px-3 bg-surface-low border border-surface-mid rounded-xl text-xs font-bold text-on-surface">
            北京 <ChevronDown size={14} />
          </button>
        </div>

        {/* Scrollable Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
          <button className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold whitespace-nowrap shadow-md">
            行业分类 <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-surface-mid text-on-surface-variant rounded-full text-xs font-bold whitespace-nowrap">
            薪资要求 <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-surface-mid text-on-surface-variant rounded-full text-xs font-bold whitespace-nowrap">
            经验要求 <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-surface-mid text-on-surface-variant rounded-full text-xs font-bold whitespace-nowrap">
            学历要求 <ChevronDown size={12} />
          </button>
        </div>
      </header>

      {/* Main List */}
      <main className="pt-32 px-5 flex flex-col gap-4">
        {isLoading ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : (
          filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={`/jobs/${job.id}`}
                className="block bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,82,255,0.05)] border-l-4 border-primary hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-on-surface mb-1">{job.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{job.company}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{job.salary}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-surface-low text-[10px] font-bold text-on-surface-variant rounded-lg">{tag}</span>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-surface-mid pt-3">
                  <div className="flex items-center gap-2">
                    <img src={job.hrAvatar} className="w-6 h-6 rounded-full object-cover" alt="hr" />
                    <span className="text-[10px] text-outline">{job.hrName} · {job.postDate}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    job.matchScore > 90 ? 'bg-primary/10 text-primary' : 'bg-surface-mid text-outline'
                  }`}>
                    {job.matchScore > 90 ? <Zap size={12} fill="currentColor" /> : <CheckCircle size={12} />}
                    {job.matchScore}% 匹配
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}


