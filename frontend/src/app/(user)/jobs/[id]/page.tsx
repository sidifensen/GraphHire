'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, MapPin, Briefcase, GraduationCap, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_JOBS } from '@/app/(user)/_mock/mockData';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';

export default function JobDetail() {
  const { id } = useParams();
  const job = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[0];

  return (
    <div className="flex flex-col">
      <TopNav title="" showShare />

      <main className="max-w-7xl mx-auto w-full px-5 md:px-8 pt-6 md:pt-12 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Job Info */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">{job.title}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-3xl font-black text-primary">{job.salary}</span>
                  <span className="text-sm font-bold text-outline bg-surface-low px-3 py-1 rounded-lg">15薪</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Tag icon={MapPin} text={job.location} />
                <Tag icon={Briefcase} text={job.experience} />
                <Tag icon={GraduationCap} text={job.education} />
              </div>
            </section>

            <section className="space-y-8 bg-surface-lowest md:p-8 md:rounded-3xl md:border md:border-surface-mid">
              <div>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-on-surface">
                   <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                   职位描述
                </h2>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-black text-base mb-4 text-on-surface flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      岗位职责
                    </h4>
                    <ul className="text-body-lg text-on-surface-variant leading-relaxed space-y-3 list-none">
                      {["负责大规模语言模型（LLM）的微调与优化，提升在特定垂直领域的表现。", 
                        "设计并实现高效的推荐算法架构，解决海量数据下的高并发推荐问题。", 
                        "跟进业内最新的AI技术动态，将前沿研究成果转化为实际产品落地。"].map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-primary font-black mt-1">0{i+1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black text-base mb-4 text-on-surface flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      任职要求
                    </h4>
                    <ul className="text-body-lg text-on-surface-variant leading-relaxed space-y-3 list-none">
                      {["计算机、数学或相关专业硕士及以上学历，具有扎实的机器学习基础。", 
                        "熟练掌握Python/C++，熟悉PyTorch、TensorFlow。"].map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-primary font-black mt-1">0{i+1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Company & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <section className="sticky top-24">
              <Link 
                href="/companies/bytedance"
                className="flex flex-col gap-6 p-6 md:p-8 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid hover:border-primary/20 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img src={job.companyLogo} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-surface-mid object-contain bg-white p-2 group-hover:scale-105 transition-transform" alt="logo" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-black text-on-surface truncate group-hover:text-primary transition-colors">星辰未来科技有限公司</h3>
                    <p className="text-xs font-bold text-on-surface-variant mt-1">D轮及以上 · 1000+人</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-surface-mid">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-outline">行业</span>
                    <span className="text-on-surface">人工智能 / 大数据</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-outline">规模</span>
                    <span className="text-on-surface">1000-9999人</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary text-sm font-black pt-2">
                  进入公司主页 <ChevronRight size={16} />
                </div>
              </Link>

              {/* Desktop Actions */}
              <div className="hidden lg:flex flex-col gap-4 mt-8">
                <button className="flex items-center justify-center gap-3 h-14 w-full rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                  立即投递职位
                </button>
                <button className="flex items-center justify-center gap-3 h-14 w-full rounded-2xl border-2 border-primary text-primary font-black text-lg hover:bg-primary/5 active:scale-[0.98] transition-all">
                  <Zap size={20} fill="currentColor" />
                  智能匹配竞争力
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Actions Only */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-lowest flex gap-4 p-5 border-t border-surface-mid pb-safe z-50">
        <button className="flex-1 h-12 rounded-xl border border-primary text-primary font-bold flex items-center justify-center gap-2 active:bg-primary/5 transition-colors">
          <Zap size={18} fill="currentColor" />
          智能匹配
        </button>
        <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          立即投递
        </button>
      </div>
    </div>
  );
}

function Tag({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-low text-on-surface-variant rounded-full text-[10px] font-bold">
      <Icon size={14} />
      {text}
    </div>
  );
}
