import { PublicHeader } from '@/components/shared/layout';
import { GlassCard } from '@/components/shared/layout';

export default function MatchDetailPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <PublicHeader />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Match Header */}
        <header className="mb-12 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-blue-100 flex items-center justify-center ring-4 ring-primary-fixed shadow-xl text-3xl font-bold text-primary">A</div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">94%</div>
            </div>
            <div className="flex items-center gap-3 text-outline-variant">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm ring-1 ring-outline-variant/10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">G</span>
              </div>
            </div>
            <div className="ml-2">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">高级数据架构师</h1>
              <p className="text-on-surface-variant font-medium">Meta Platforms, Inc. • 加州，门洛帕克</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-surface-container-high text-on-primary-fixed-variant font-semibold hover:bg-surface-variant transition-colors">
              稍后保存
            </button>
            <button className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
              立即申请
            </button>
          </div>
        </header>

        {/* Main Content Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: AI Insight & Radar */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI Explanation Card */}
            <div className="glass-card p-8 rounded-xl ring-1 ring-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-primary">psychology</span>
              </div>
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full mb-4 ring-1 ring-secondary/10">AI 洞察</span>
              <h2 className="font-headline text-xl font-bold mb-4">为什么您非常匹配</h2>
              <p className="text-on-surface-variant leading-relaxed">
                您是一个极佳的匹配人选，因为您的 <span className="text-primary font-semibold">Python 专业知识</span> 与核心要求完美契合。您在 <span className="text-primary font-semibold">分布式系统</span> 方面的大规模实战经验涵盖了职位描述中提到的 95% 的技术挑战。
              </p>
              <div className="mt-6 flex items-center gap-2 text-secondary font-semibold text-sm">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                由图谱智聘核心引擎计算
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h3 className="font-headline text-lg font-bold mb-8 flex justify-between items-center">
                匹配维度
                <span className="material-symbols-outlined text-primary">analytics</span>
              </h3>
              <div className="relative w-full aspect-square flex items-center justify-center">
                {/* Radar Grid */}
                <div className="absolute inset-0 opacity-20" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: 'var(--surface-container-high)' }} />
                <div className="absolute inset-4 opacity-40" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: 'var(--surface-container)' }} />
                <div className="absolute inset-8 opacity-60" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', background: 'var(--surface-container-low)' }} />
                {/* SVG Polygon */}
                <svg className="w-full h-full drop-shadow-xl overflow-visible" viewBox="0 0 100 100">
                  <polygon fill="rgba(0, 91, 191, 0.15)" points="50,10 90,40 80,85 30,85 10,40" stroke="#005bbf" strokeWidth="1.5" />
                  <circle cx="50" cy="10" fill="#005bbf" r="2" />
                  <circle cx="90" cy="40" fill="#005bbf" r="2" />
                  <circle cx="80" cy="85" fill="#005bbf" r="2" />
                  <circle cx="30" cy="85" fill="#005bbf" r="2" />
                  <circle cx="10" cy="40" fill="#005bbf" r="2" />
                </svg>
                {/* Labels */}
                <span className="absolute top-0 -mt-6 text-[10px] font-bold text-outline tracking-wider uppercase">技能</span>
                <span className="absolute top-1/4 -right-12 text-[10px] font-bold text-outline tracking-wider uppercase">经验</span>
                <span className="absolute bottom-0 -right-4 text-[10px] font-bold text-outline tracking-wider uppercase">薪资</span>
                <span className="absolute bottom-0 -left-4 text-[10px] font-bold text-outline tracking-wider uppercase">地点</span>
                <span className="absolute top-1/4 -left-12 text-[10px] font-bold text-outline tracking-wider uppercase">教育</span>
              </div>
            </div>
          </div>

          {/* Right Column: Skill Verification Table */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="p-8">
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">技能验证</h3>
              <p className="text-on-surface-variant mt-1">深度解读技术与文化契合度。</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-outline uppercase">职位要求</th>
                    <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-outline uppercase">您的掌握程度</th>
                    <th className="px-8 py-4 text-center text-[10px] font-bold tracking-widest text-outline uppercase">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {/* Skill Row 1 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-semibold block text-on-surface">Python (专家级)</span>
                      <span className="text-xs text-on-surface-variant">架构大规模数据管道</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[95%]" />
                        </div>
                        <span className="text-sm font-bold text-primary">Lvl 9/10</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="material-symbols-outlined text-green-600 bg-green-50 p-1.5 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </td>
                  </tr>
                  {/* Skill Row 2 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-semibold block text-on-surface">AWS 基础设施</span>
                      <span className="text-xs text-on-surface-variant">Terraform 和 CloudFormation</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[80%]" />
                        </div>
                        <span className="text-sm font-bold text-primary">Lvl 8/10</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="material-symbols-outlined text-green-600 bg-green-50 p-1.5 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </td>
                  </tr>
                  {/* Skill Row 3 - Gap */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-semibold block text-on-surface">Go (Golang)</span>
                      <span className="text-xs text-on-surface-variant">构建微服务</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="bg-surface-container-highest h-full w-[30%]" />
                        </div>
                        <span className="text-sm font-bold text-on-surface-variant">Lvl 3/10</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="material-symbols-outlined text-error bg-error-container p-1.5 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    </td>
                  </tr>
                  {/* Skill Row 4 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-semibold block text-on-surface">分布式数据库</span>
                      <span className="text-xs text-on-surface-variant">Cassandra, DynamoDB 经验</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[100%]" />
                        </div>
                        <span className="text-sm font-bold text-primary">Lvl 10/10</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="material-symbols-outlined text-green-600 bg-green-50 p-1.5 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-surface-container-low/20">
              <div className="flex items-start gap-4 p-4 rounded-xl border-l-4 border-primary bg-primary/5">
                <span className="material-symbols-outlined text-primary">info</span>
                <div className="text-sm text-on-surface-variant">
                  <p className="font-bold text-on-surface mb-1">图谱智聘专业建议：</p>
                  我们建议在您的求职信中重点强调 Cassandra 经验，以弥补 Go 语言熟练度的不足。Meta 更看重核心架构知识，而非特定语法的精通程度。
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
