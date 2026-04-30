'use client';

import React, { useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { MOCK_APPLICATIONS } from '@/app/(user)/_mock/mockData';
import { Clock, ChevronRight } from 'lucide-react';

export default function ApplicationRecords() {
  const tabs = ['全部', '待处理', '已查看', '面试邀请', '不合适'];
  const [activeTab, setActiveTab] = useState('全部');

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="投递记录" />
      
      <nav className="bg-surface-lowest/90 backdrop-blur-md sticky top-16 md:top-32 z-40 flex overflow-x-auto px-5 md:px-12 gap-8 pt-4 hide-scrollbar border-b border-surface-mid">
        <div className="max-w-7xl mx-auto w-full flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-body-md md:text-lg font-bold pb-4 md:pb-6 whitespace-nowrap px-1 transition-all border-b-2 ${
                activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-5 md:py-12 md:px-8 max-w-7xl mx-auto w-full pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {MOCK_APPLICATIONS.map((app) => (
            <article 
              key={app.id} 
              className={`bg-surface-lowest rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border-l-4 cursor-pointer hover:bg-surface-low transition-all group hover:shadow-lg hover:-translate-y-1 ${
                app.status === 'interview' ? 'border-primary' : app.status === 'viewed' ? 'border-secondary-container' : 'border-surface-mid'
              }`}
            >
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {app.title}
                </h2>
                <StatusBadge status={app.status!} />
              </div>
              
              <div className="flex justify-between items-center mb-6 md:mb-8 text-sm md:text-base">
                <span className="text-on-surface-variant opacity-80">{app.company}</span>
                <span className="text-primary font-bold">{app.salary}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-surface-low">
                <span className="text-[10px] md:text-xs text-outline flex items-center gap-2">
                  <Clock size={14} className="text-primary/60" />
                  投递时间: {app.applyDate}
                </span>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-surface-low group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    interview: 'bg-primary/10 text-primary',
    viewed: 'bg-primary/10 text-primary',
    pending: 'bg-surface-mid text-on-surface-variant',
    unsuitable: 'bg-surface-high opacity-60 text-outline',
  };
  
  const labels: Record<string, string> = {
    interview: '面试邀请',
    viewed: '已查看',
    pending: '待处理',
    unsuitable: '不合适',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ml-2 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}