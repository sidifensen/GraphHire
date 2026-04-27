"use client";

import React from 'react';
import { TopNav } from '../components/TopNav';
import { RefreshCw, User, Code, Layout, Database, Group, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeGraph() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="我的图谱" />

      <main className="flex-1 p-5 flex flex-col gap-6 pb-28">
        {/* Graph Canvas */}
        <section className="bg-white rounded-3xl shadow-sm border border-surface-mid h-[400px] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-white to-white"></div>
          
          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <g stroke="#003ec7" strokeDasharray="4 4" strokeWidth="1">
              <line x1="50%" y1="50%" x2="50%" y2="15%" />
              <line x1="50%" y1="50%" x2="85%" y2="40%" />
              <line x1="50%" y1="50%" x2="80%" y2="80%" />
              <line x1="50%" y1="50%" x2="20%" y2="80%" />
              <line x1="50%" y1="50%" x2="15%" y2="40%" />
            </g>
          </svg>

          {/* Nodes */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="z-10 w-24 h-24 bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white"
          >
            <User size={32} />
          </motion.div>

          <Node icon={Code} label="前端工程" top="15%" left="50%" delay={0.1} color="bg-secondary-container" />
          <Node icon={Zap} label="性能优化" top="40%" left="15%" delay={0.2} color="bg-primary/10 text-primary" />
          <Node icon={Group} label="团队协作" top="80%" left="20%" delay={0.3} color="bg-surface-mid" />
          <Node icon={Database} label="数据处理" top="80%" right="20%" delay={0.4} color="bg-surface-mid" />
          <Node icon={TrendingUp} label="架构设计" top="40%" right="15%" delay={0.5} color="bg-tertiary/10 text-tertiary" />
        </section>

        {/* Stats Bento */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-mid flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Award size={18} />
              <span className="text-xs font-bold text-on-surface-variant uppercase">综合评分</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-primary">94</span>
              <span className="text-xs text-outline font-bold">/ 100</span>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-low">
              <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold">
                <span className="text-outline">Top 5%</span>
                <span className="text-green-500 font-bold">↑ 1.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-mid flex flex-col gap-2">
            <div className="flex items-center gap-2 text-tertiary">
               <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase">技能节点</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-on-surface">142</span>
              <span className="text-xs text-outline font-bold">已点亮</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-bold rounded-full">React</span>
              <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-bold rounded-full">Node.js</span>
              <span className="px-2 py-0.5 bg-surface-low text-outline text-[9px] font-bold rounded-full">+120</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full px-5 py-4 bg-white/90 backdrop-blur-md border-t border-surface-mid pb-safe z-40">
        <button className="w-full h-14 rounded-2xl border-2 border-surface-mid text-on-surface font-bold flex justify-center items-center gap-2 hover:bg-surface-low transition-colors">
          <RefreshCw size={20} />
          重置视图
        </button>
      </div>
    </div>
  );
}

function Node({ icon: Icon, label, top, left, right, delay, color }: any) {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className="absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ top, left, right }}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md border-4 border-white ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

