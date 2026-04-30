import React from 'react';
import { MOCK_COMPANIES, MOCK_JOBS } from '../mockData';
import { TopNav } from '../components/TopNav';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CompanyDetail() {
  const company = MOCK_COMPANIES[0];

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="公司详情" showShare />

      <main className="max-w-7xl mx-auto w-full px-5 md:px-8 mt-5 md:mt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Company Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Section */}
            <section className="relative p-6 md:p-10 bg-surface-lowest rounded-3xl border border-surface-mid overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl bg-white border border-surface-mid shadow-sm p-4 flex items-center justify-center">
                  <img src={company.logo} className="w-full h-full object-contain" alt="logo" />
                </div>
                <div className="flex flex-col pt-2 w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-3xl md:text-4xl font-black text-on-surface leading-tight">{company.name}</h2>
                    <button className="hidden md:block px-6 py-2.5 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm">
                      关注公司
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-4 py-1.5 bg-surface-low rounded-xl text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-wider">{company.industry}</span>
                    <span className="px-4 py-1.5 bg-surface-low rounded-xl text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-wider">{company.stage}</span>
                    <span className="px-4 py-1.5 bg-surface-low rounded-xl text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-wider">{company.size}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Bento Stats */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-surface-lowest rounded-3xl p-6 shadow-sm border border-surface-mid text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-primary">
                  <Calendar size={18} />
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">成立时间</span>
                </div>
                <div className="font-black text-xl text-on-surface">{company.founded}</div>
              </div>
              <div className="bg-surface-lowest rounded-3xl p-6 shadow-sm border border-surface-mid text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-primary">
                  <MapPin size={18} />
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">总部地点</span>
                </div>
                <div className="font-black text-xl text-on-surface">{company.headquarters}</div>
              </div>
              <div className="hidden md:block bg-surface-lowest rounded-3xl p-6 shadow-sm border border-surface-mid">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Calendar size={18} />
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">在招职位</span>
                </div>
                <div className="font-black text-xl text-on-surface">128 个</div>
              </div>
            </section>

            {/* Company Introduction */}
            <section className="bg-surface-lowest rounded-3xl p-6 md:p-10 shadow-sm border border-surface-mid">
              <h3 className="text-2xl font-black mb-6 text-on-surface flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                公司介绍
              </h3>
              <div className="text-body-lg text-on-surface-variant leading-relaxed space-y-4">
                <p>{company.intro}</p>
                <button className="text-primary text-sm font-black flex items-center gap-2 hover:gap-3 transition-all">
                  阅读更多公司动态 <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Open Positions (Sticky) */}
          <div className="lg:col-span-1">
            <section className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-on-surface">在招职位</h3>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">99+</span>
                </div>
                <Link to="/jobs" className="text-primary text-sm font-black flex items-center gap-1 hover:gap-2 transition-all">
                  全部职位 <ChevronRight size={16} />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {MOCK_JOBS.map((job) => (
                  <div key={job.id}>
                    <JobMiniCard job={job} />
                  </div>
                ))}
              </div>
              
              <button className="hidden lg:flex w-full h-14 items-center justify-center bg-surface-lowest border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary/5 transition-colors">
                订阅职位更新
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function JobMiniCard({ job }: { job: any }) {
  return (
    <Link 
      to={`/jobs/${job.id}`}
      className="block bg-surface-lowest rounded-2xl p-5 shadow-sm border border-surface-mid relative overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-on-surface pr-4 truncate">{job.title}</h4>
        <span className="text-primary font-bold whitespace-nowrap">{job.salary.split('·')[0]}</span>
      </div>
      <div className="flex gap-2">
        {job.tags.slice(0, 2).map((tag: any) => (
          <span key={tag} className="text-[10px] font-bold text-on-surface-variant opacity-60">#{tag}</span>
        ))}
      </div>
    </Link>
  );
}
