"use client";

import React, { useState } from 'react';
import { TopNav } from "../_components/TopNav";
import { MOCK_APPLICATIONS } from "../_data/mockData";
import { Clock, ChevronRight } from 'lucide-react';

export default function ApplicationRecords() {
  const tabs = ['全部', '待处理', '已查看', '面试邀请', '不合适'];
  const [activeTab, setActiveTab] = useState('全部');

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="投递记录" />
      
      <nav className="bg-surface-lowest sticky top-16 z-40 flex overflow-x-auto px-5 gap-8 pt-4 hide-scrollbar border-b border-surface-mid">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-body-md font-bold pb-3 whitespace-nowrap px-1 transition-all border-b-2 ${
              activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="p-5 flex flex-col gap-4 pb-12">
        {MOCK_APPLICATIONS.map((app) => (
          <article 
            key={app.id} 
            className={`bg-surface-lowest rounded-2xl p-5 shadow-sm border-l-4 cursor-pointer hover:bg-surface-low transition-colors group ${
              app.status === 'interview' ? 'border-primary' : app.status === 'viewed' ? 'border-secondary-container' : 'border-surface-mid'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                {app.title}
              </h2>
              <StatusBadge status={app.status!} />
            </div>
            
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-on-surface-variant opacity-80">{app.company}</span>
              <span className="text-primary font-bold">{app.salary}</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-surface-low">
              <span className="text-[10px] text-outline flex items-center gap-1">
                <Clock size={12} />
                投递时间: {app.applyDate}
              </span>
              <ChevronRight className="text-outline group-hover:text-primary transition-all" size={18} />
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    interview: 'bg-primary/10 text-primary',
  viewed: 'bg-secondary-container/50 text-on-secondary-container',
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


