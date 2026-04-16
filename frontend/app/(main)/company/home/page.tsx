import { StatCard } from '@/components/shared/layout';

export default function CompanyHomePage() {
  return (
    <div className="ml-64 pt-16 min-h-screen">
      {/* Welcome Header */}
      <header className="mb-10 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">早安，招聘团队</h2>
            <p className="mt-2 text-on-surface-variant font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
              2024年5月24日 · 星期五
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-surface-container-high text-on-primary-fixed-variant rounded-xl font-semibold flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              查看推荐简历
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              发布新职位
            </button>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 p-8">
        {/* Data Overview Cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: 待处理投递 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">inbox</span>
              </div>
              <h3 className="text-sm font-label font-bold text-outline uppercase tracking-wider">待处理投递</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-headline font-extrabold text-on-surface">12</span>
                <span className="text-xs font-bold text-error bg-error-container/50 px-2 py-0.5 rounded-full">+3 较昨日</span>
              </div>
            </div>
          </div>
          {/* Card 2: 新匹配候选人 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
              </div>
              <h3 className="text-sm font-label font-bold text-outline uppercase tracking-wider">新匹配候选人</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-headline font-extrabold text-on-surface">8</span>
                <span className="text-xs font-bold text-primary-container bg-primary-fixed/50 px-2 py-0.5 rounded-full">AI 智能匹配</span>
              </div>
            </div>
          </div>
          {/* Card 3: 在招职位 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined">work_history</span>
              </div>
              <h3 className="text-sm font-label font-bold text-outline uppercase tracking-wider">在招职位</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-headline font-extrabold text-on-surface">5</span>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">进行中</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Recent Jobs & AI Insights */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Recent Jobs Section */}
          <section className="bg-surface-container-lowest rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface">近期发布职位</h3>
                <p className="text-sm text-outline mt-1">实时监控各职位投递与匹配动态</p>
              </div>
              <button className="text-primary text-sm font-bold hover:underline">查看全部</button>
            </div>
            <div className="space-y-4">
              {/* Job Item 1 */}
              <div className="group flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">高级后端开发工程师</h4>
                    <p className="text-xs text-outline mt-1 flex items-center gap-2">
                      发布于 2小时前
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      北京 · 远程
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-secondary font-bold">
                      <span className="material-symbols-outlined text-sm">stars</span>
                      <span>24 个匹配</span>
                    </div>
                    <p className="text-[10px] text-outline mt-0.5">算法推荐得分 95+</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              </div>
              {/* Job Item 2 */}
              <div className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low/30 hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">palette</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">资深UI/UX设计师</h4>
                    <p className="text-xs text-outline mt-1 flex items-center gap-2">
                      发布于 昨日
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      上海
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-secondary font-bold">
                      <span className="material-symbols-outlined text-sm">stars</span>
                      <span>18 个匹配</span>
                    </div>
                    <p className="text-[10px] text-outline mt-0.5">算法推荐得分 88+</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              </div>
              {/* Job Item 3 */}
              <div className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low/30 hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">monitoring</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">产品运营经理</h4>
                    <p className="text-xs text-outline mt-1 flex items-center gap-2">
                      发布于 3天前
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      深圳
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-secondary font-bold">
                      <span className="material-symbols-outlined text-sm">stars</span>
                      <span>32 个匹配</span>
                    </div>
                    <p className="text-[10px] text-outline mt-0.5">算法推荐得分 92+</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Quick Insight Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-secondary-container to-secondary/20 p-6 rounded-2xl border border-secondary/10 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-secondary/10 text-9xl">magic_button</span>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-white/50 backdrop-blur-sm text-[10px] font-bold text-secondary rounded uppercase tracking-tighter">AI Insight</span>
                </div>
                <h4 className="font-headline font-bold text-on-secondary-container text-lg leading-snug">后端开发人才库中有 12 位与您的新职位相匹配。</h4>
                <p className="mt-3 text-sm text-on-secondary-fixed-variant leading-relaxed">基于图谱分析，这些候选人具备极高的技能重合度，建议立即查看。</p>
                <button className="mt-6 flex items-center gap-1 text-secondary font-bold text-sm">
                  立即查看
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">insights</span>
              </div>
              <h4 className="font-bold text-on-surface">招聘效能分析</h4>
              <p className="mt-2 text-sm text-on-surface-variant px-4">上周平均初试通过率为 68%，高于行业平均水平 12%。</p>
              <div className="mt-6 w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[68%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:hidden">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
