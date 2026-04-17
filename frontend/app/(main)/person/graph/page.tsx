import { PublicHeader } from '@/components/shared/layout';

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <PublicHeader />
      <main className="pt-16 flex min-h-screen">
        {/* Main Visualization Canvas */}
        <section className="flex-1 relative overflow-hidden bg-surface" style={{ backgroundImage: 'radial-gradient(#e1e3e4 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          {/* Breadcrumbs / Controls */}
          <div className="absolute top-6 left-8 z-10 flex gap-4 items-center">
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">hub</span>
              <span className="text-sm font-semibold text-on-surface">能力图谱映射</span>
            </div>
            <div className="flex bg-surface-container-low rounded-full p-1">
              <button className="px-4 py-1.5 rounded-full text-sm bg-surface-container-lowest font-medium">标准视图</button>
              <button className="px-4 py-1.5 rounded-full text-sm text-on-surface-variant hover:text-on-surface">3D 模型</button>
            </div>
          </div>

          {/* Visualization Center */}
          <div className="relative w-full h-full flex items-center justify-center min-h-[600px]">
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--secondary)', stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>
              <line stroke="url(#lineGrad)" strokeDasharray="4" strokeWidth="2" x1="50%" x2="35%" y1="50%" y2="30%" />
              <line stroke="url(#lineGrad)" strokeDasharray="4" strokeWidth="2" x1="50%" x2="65%" y1="50%" y2="35%" />
              <line stroke="url(#lineGrad)" strokeDasharray="4" strokeWidth="2" x1="50%" x2="40%" y1="50%" y2="70%" />
              <line stroke="url(#lineGrad)" strokeDasharray="4" strokeWidth="2" x1="50%" x2="60%" y1="50%" y2="75%" />
            </svg>

            {/* Center Node */}
            <div className="relative z-20">
              <div className="w-24 h-24 rounded-full bg-primary p-1" style={{ animation: 'pulse 2s infinite' }}>
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">A</div>
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className="font-headline font-extrabold text-lg">Alex Rivera</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">全栈开发工程师</p>
              </div>
            </div>

            {/* Skill Clusters */}
            {/* Tech Cluster */}
            <div className="absolute top-[25%] left-[30%] text-center">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 backdrop-blur-md flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
              </div>
              <span className="mt-2 block text-xs font-bold uppercase tracking-tighter">技术栈</span>
              <div className="absolute -top-12 -left-16 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-primary">React</span>
              </div>
              <div className="absolute -top-8 left-12 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-secondary-container">
                <span className="text-[10px] font-black text-on-secondary-container">Node.js</span>
              </div>
            </div>

            {/* Soft Skills Cluster */}
            <div className="absolute top-[30%] right-[30%] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary-container/20 backdrop-blur-md flex items-center justify-center border border-secondary/20">
                <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <span className="mt-2 block text-xs font-bold uppercase tracking-tighter">领导力</span>
            </div>

            {/* Education Cluster */}
            <div className="absolute bottom-[20%] left-[38%] text-center">
              <div className="w-14 h-14 rounded-full bg-surface-variant/40 backdrop-blur-md flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">school</span>
              </div>
              <span className="mt-2 block text-xs font-bold uppercase tracking-tighter">教育背景</span>
            </div>

            {/* Cloud Cluster */}
            <div className="absolute bottom-[25%] right-[35%] text-center">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed-dim/30 backdrop-blur-md flex items-center justify-center border border-tertiary/20">
                <span className="material-symbols-outlined text-tertiary text-2xl">cloud</span>
              </div>
              <span className="mt-2 block text-xs font-bold uppercase tracking-tighter">云架构</span>
            </div>
          </div>
        </section>

        {/* Side Intelligence Panel */}
        <aside className="w-96 bg-surface-container-lowest border-l-0 shadow-2xl z-40 flex flex-col p-8 overflow-y-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-headline font-bold text-2xl leading-tight">高级软件工程师</h2>
                <p className="text-secondary font-semibold text-sm">Google Cloud (已匹配)</p>
              </div>
              <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-black">
                94% 匹配度
              </div>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              根据您的能力图谱，您非常适合此职位。仅需在技术栈上进行细微调整即可满足要求。
            </p>
          </div>

          {/* Radar Chart Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">核心胜任力图</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary">个人</span>
                <span className="text-[10px] font-bold text-outline">目标</span>
              </div>
            </div>
            <div className="relative w-full aspect-square flex items-center justify-center">
              {/* Target Radar */}
              <div className="absolute w-full h-full opacity-50" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: 'var(--surface-container-high)' }} />
              {/* Labels */}
              <span className="absolute top-0 text-[10px] font-bold">技能</span>
              <span className="absolute right-0 top-1/3 text-[10px] font-bold">薪资</span>
              <span className="absolute bottom-0 right-1/4 text-[10px] font-bold">学历</span>
              <span className="absolute bottom-0 left-1/4 text-[10px] font-bold">地点</span>
              <span className="absolute left-0 top-1/3 text-[10px] font-bold">经验</span>
            </div>
          </div>

          {/* Gaps & Actions */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">技能对比分析</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-error">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">缺失技能: Kubernetes</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-error-container text-on-error-container rounded-full">高优先级</span>
                </div>
                <p className="text-xs text-on-surface-variant">该职位需要容器编排经验。建议参加为期2周的快速考证课程。</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-secondary">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">优势技能: React/Next.js</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">专家级</span>
                </div>
                <p className="text-xs text-on-surface-variant">您的掌握程度比该职位的平均候选人高出 20%。</p>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
            使用图谱洞察申请
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
          </button>
        </aside>
      </main>

      {/* FAB Action */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </button>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 91, 191, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(0, 91, 191, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 91, 191, 0); }
        }
      `}</style>
    </div>
  );
}
