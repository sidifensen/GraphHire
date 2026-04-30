import React from 'react';
import { TopNav } from '../components/TopNav';
import { RefreshCw, User, Code, Layout, Database, Group, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeGraph() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="我的图谱" />

      <main className="flex-1 p-5 md:py-12 md:px-8 flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 pb-28 md:pb-32 max-w-7xl mx-auto w-full">
        {/* Graph Canvas */}
        <section className="md:col-span-8 bg-surface-lowest rounded-3xl md:rounded-[40px] shadow-sm border border-surface-mid h-[400px] md:h-[600px] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-lowest to-surface-lowest"></div>
          
          <div className="absolute top-6 left-8 z-20">
             <h2 className="text-xl md:text-3xl font-black text-on-surface flex items-center gap-3">
               <div className="w-2 h-8 bg-primary rounded-full"></div>
               全景图谱
             </h2>
             <p className="text-xs md:text-sm text-outline font-bold mt-1">基于您的 142 个技能点位生成</p>
          </div>

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <g stroke="var(--color-primary)" strokeDasharray="4 4" strokeWidth="1">
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
            className="z-10 w-24 h-24 md:w-32 md:h-32 bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-surface-lowest"
          >
            <User size={32} className="md:size-48" />
          </motion.div>

          <Node icon={Code} label="前端工程" top="15%" left="50%" delay={0.1} color="bg-secondary-container" />
          <Node icon={Zap} label="性能优化" top="40%" left="15%" delay={0.2} color="bg-primary/10 text-primary" />
          <Node icon={Group} label="团队协作" top="80%" left="20%" delay={0.3} color="bg-surface-mid" />
          <Node icon={Database} label="数据处理" top="80%" right="20%" delay={0.4} color="bg-surface-mid" />
          <Node icon={TrendingUp} label="架构设计" top="40%" right="15%" delay={0.5} color="bg-tertiary/10 text-tertiary" />

          {/* Actions (Desktop Only Overlay) */}
          <div className="md:flex hidden absolute bottom-10 right-10 flex-col gap-3">
             <button className="w-12 h-12 rounded-2xl bg-surface-lowest border border-surface-mid flex items-center justify-center shadow-sm hover:bg-surface-low transition-colors">
               <RefreshCw size={20} className="text-on-surface-variant" />
             </button>
          </div>
        </section>

        {/* Stats Bento (Right Column on Desktop) */}
        <section className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-lowest rounded-[32px] p-6 md:p-8 shadow-sm border border-surface-mid flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Award size={24} />
              <span className="text-sm font-black text-on-surface uppercase tracking-widest">能力概览</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black text-primary">94</span>
              <span className="text-sm text-outline font-bold">综合分</span>
            </div>
            <div className="mt-6 pt-6 border-t border-surface-low">
              <div className="w-full h-3 bg-surface-low rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                />
              </div>
              <div className="flex justify-between mt-4 text-xs font-black">
                <span className="text-outline uppercase tracking-wider">Top 5% 职场精英</span>
                <span className="text-green-500 flex items-center gap-1 font-black">
                   <TrendingUp size={14} /> ↑ 1.2%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-lowest rounded-[32px] p-6 md:p-8 shadow-sm border border-surface-mid flex flex-col gap-4">
            <div className="flex items-center gap-3 text-tertiary">
               <div className="w-6 h-6 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <RefreshCw size={14} className="text-tertiary" />
               </div>
              <span className="text-sm font-black text-on-surface uppercase tracking-widest">知识节点</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black text-on-surface">142</span>
              <span className="text-sm text-outline font-bold">已同步</span>
            </div>
            <div className="mt-6">
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                 您的知识图谱正在随着简历投递和面试反馈动态演化。
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'TypeScript', 'Node.js', 'Next.js'].map(tag => (
                   <span key={tag} className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black rounded-xl border border-primary/10">
                     {tag}
                   </span>
                ))}
                <span className="px-4 py-1.5 bg-surface-mid text-on-surface-variant text-[10px] font-black rounded-xl hover:bg-surface-low cursor-pointer transition-colors">+120</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full min-h-[80px] bg-surface-lowest/90 backdrop-blur-md border-t border-surface-mid pb-safe z-40 md:rounded-t-[32px]">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-4 md:py-8 flex items-center justify-center">
          <button className="w-full md:max-w-[400px] h-14 md:h-16 rounded-2xl md:rounded-[20px] border-2 border-surface-mid text-on-surface font-bold text-sm md:text-base flex justify-center items-center gap-3 hover:bg-surface-low transition-all active:scale-[0.98]">
            <RefreshCw size={20} className="md:size-24" />
            重新生成分析视图
          </button>
        </div>
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
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md border-4 border-surface-lowest ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">{label}</span>
    </motion.div>
  );
}
