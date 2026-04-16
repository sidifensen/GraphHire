import { PublicHeader, PublicFooter } from '@/components/shared/layout';
import { GlassCard } from '@/components/shared/layout';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <PublicHeader />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            优化您的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">职业档案</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            上传您的最新简历。我们的 AI 策展人将提取并对照行业基准验证您的技能，以加速您的职位匹配过程。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Central Upload & Processing Area */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upload Card */}
            <div className="surface-container-lowest glass rounded-xl p-8 border-outline-variant/10">
              {/* Progress State */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">description</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface">resume_alex_chen_v4.pdf</h3>
                    <p className="text-xs text-on-surface-variant">12秒前上传 • 2.4 MB</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">已处理 85%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden mb-8">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full w-[85%]" />
              </div>

              {/* AI Analyzing State */}
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                </div>
                <h4 className="text-xl font-headline font-bold text-on-surface mb-2">简历解析中...</h4>
                <p className="text-sm text-center text-on-surface-variant max-w-sm">
                  我们的神经网络正在将您的经历映射到 2024 人才图谱。这通常不到 30 秒。
                </p>
              </div>
            </div>

            {/* Recent Uploads History */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">上传历史</h5>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">history</span>
                    <span className="text-sm font-medium">resume_final_2023.pdf</span>
                  </div>
                  <span className="text-xs text-on-surface-variant italic">处理于 12月12日</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Extracted Profile Card */}
            <div className="bg-primary-container text-on-primary-container p-8 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                  <h3 className="font-headline text-xl font-bold">提取的档案</h3>
                </div>

                {/* Skills Bento Grid */}
                <div className="space-y-4">
                  {/* Skill Item */}
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-wide">Python (高级)</span>
                      <div className="flex gap-1 mt-1">
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white/30 rounded-full" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black">98%</span>
                      <p className="text-[10px] uppercase opacity-70">置信度</p>
                    </div>
                  </div>

                  {/* Skill Item */}
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-wide">React.js</span>
                      <div className="flex gap-1 mt-1">
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white/30 rounded-full" />
                        <div className="h-1 w-8 bg-white/30 rounded-full" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black">92%</span>
                      <p className="text-[10px] uppercase opacity-70">置信度</p>
                    </div>
                  </div>

                  {/* Skill Item */}
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-wide">项目管理</span>
                      <div className="flex gap-1 mt-1">
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-8 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black">89%</span>
                      <p className="text-[10px] uppercase opacity-70">置信度</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Insights Chips */}
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">识别出的微技能</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border border-white/10">AWS Lambda</span>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border border-white/10">Scrum Master</span>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border border-white/10">CI/CD 流水线</span>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border border-white/10">SQL</span>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border border-white/10">+4 更多</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-surface-container-high rounded-xl p-6 text-center">
              <p className="text-sm text-on-surface-variant mb-4">等待解析完成，或直接进入职位匹配。</p>
              <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                查看匹配职位
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="mt-auto py-12 border-t border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-on-surface-variant">© 2024 图谱智聘。所有简历均已加密并安全存储。</p>
          <div className="flex gap-8 text-sm font-medium text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">隐私政策</a>
            <a className="hover:text-primary transition-colors" href="#">数据处理</a>
            <a className="hover:text-primary transition-colors" href="#">帮助中心</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
