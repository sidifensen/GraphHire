import { PublicHeader, PublicFooter } from '@/components/shared/layout';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <PublicHeader />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[716px] flex items-center justify-center px-8 py-24 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] bg-primary-fixed opacity-20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary-fixed opacity-20 blur-[100px] rounded-full" />
          </div>
          <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold tracking-widest uppercase border border-outline-variant/20">
                AI 驱动搜索
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-background leading-tight">
                通过 <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">AI 图谱映射</span> <br /> 发现您的理想职位
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-lg">
                超越关键词匹配。我们的智能图谱将您独特的技能特征映射到行业领先公司的高增长机遇中。
              </p>
            </div>
            {/* Search Bar */}
            <div className="glass-card p-2 rounded-2xl border border-outline-variant/20 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-outline mr-3">search</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface" placeholder="职位名称、技能或公司" type="text" />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-outline mr-3">location_on</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface" placeholder="地点或远程办公" type="text" />
              </div>
              <button className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                立即探索
              </button>
            </div>
          </div>
        </section>

        {/* Recommended Section */}
        <section className="max-w-7xl mx-auto px-8 py-20 bg-surface-container-low rounded-[3rem]">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tight">为您推荐</h2>
              <p className="text-on-surface-variant">基于您的近期动态和图谱智聘 AI 档案映射结果。</p>
            </div>
            <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              查看所有匹配 <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Job Card 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-2">
                    <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg">T</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold border border-outline-variant/10">98% 匹配</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-on-surface">高级产品设计师</h3>
                  <p className="text-on-surface-variant font-medium">Lumina Systems</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">远程办公</span>
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">全职</span>
                </div>
              </div>
              <div className="mt-8 pt-6 flex justify-between items-center border-t border-surface-container">
                <span className="text-on-surface font-bold">$140k – $180k</span>
                <button className="text-primary font-bold">立即申请</button>
              </div>
            </div>
            {/* Job Card 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-2">
                    <div className="w-full h-full bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg">V</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold border border-outline-variant/10">95% 匹配</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-on-surface">全栈工程师</h3>
                  <p className="text-on-surface-variant font-medium">Vertex Finance</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">纽约, NY</span>
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">混合办公</span>
                </div>
              </div>
              <div className="mt-8 pt-6 flex justify-between items-center border-t border-surface-container">
                <span className="text-on-surface font-bold">$165k – $210k</span>
                <button className="text-primary font-bold">立即申请</button>
              </div>
            </div>
            {/* Job Card 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-2">
                    <div className="w-full h-full bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-lg">N</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold border border-outline-variant/10">92% 匹配</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-on-surface">AI 研究科学家</h3>
                  <p className="text-on-surface-variant font-medium">Neural Pathways</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">帕罗奥图, CA</span>
                  <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">实地办公</span>
                </div>
              </div>
              <div className="mt-8 pt-6 flex justify-between items-center border-t border-surface-container">
                <span className="text-on-surface font-bold">$190k – $250k</span>
                <button className="text-primary font-bold">立即申请</button>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Skills & Employers */}
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Trending Skills */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-on-surface">您网络中的热门技能</h2>
                <p className="text-on-surface-variant">为您当前符合条件的空缺职位最常要求的技能。</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {['Typescript', 'LLM 微调', '数据可视化', 'Figma', '向量数据库', 'React Native', 'Kubernetes'].map((skill) => (
                  <span key={skill} className="bg-secondary-container/20 text-on-secondary-container px-5 py-2.5 rounded-xl border border-secondary-container/10 text-sm font-semibold hover:bg-secondary-container/40 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {/* Top Employers */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-on-surface">顶级招聘合作伙伴</h2>
                <p className="text-on-surface-variant">正活跃在图谱智聘人才库中招贤纳士的行业领导者。</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {['Stripe', 'Linear', 'OpenAI', 'Shopify', 'Airbnb', 'Notion'].map((company) => (
                  <div key={company} className="h-24 bg-surface-container flex items-center justify-center rounded-xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                    <span className="font-headline font-black text-outline text-lg">{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
