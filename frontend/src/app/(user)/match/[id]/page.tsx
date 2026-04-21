'use client';

import { useParams } from 'next/navigation';

const matchData = {
  id: '1',
  jobTitle: '高级认知交互设计师',
  company: '星海人工智能研究院',
  location: '杭州',
  salary: '15k - 25k',
  experience: '3-5年',
  education: '本科及以上',
  matchScore: 92,
  isRecommended: true,
  aiAnalysis: {
    summary: '基于您的图谱节点数据，系统认为您是该职位的极佳候选人。您在复杂数据可视化和系统架构设计方面的深厚积累，完美契合了该职位的核心诉求。',
    insights: [
      {
        icon: 'done_all',
        title: '核心技能完美覆盖',
        description: '要求 Figma、Principle 及数据洞察能力，您的历史项目中均有深度应用记录。',
      },
      {
        icon: 'trending_up',
        title: '行业经验高度吻合',
        description: '您过去在企业级 SaaS 领域的经验，为认知交互设计提供了扎实的业务视角。',
      },
    ],
  },
  skills: [
    { name: '系统化设计思维', matchLevel: '高匹配', jobLevel: 100, userLevel: 95, jobLabel: '精通', userLabel: '资深专家' },
    { name: 'AI 交互模式创新', matchLevel: '高匹配', jobLevel: 80, userLevel: 85, jobLabel: '熟练', userLabel: '熟练且有实操案例' },
    { name: '前端代码基础 (React/Vue)', matchLevel: '部分匹配', jobLevel: 60, userLevel: 40, jobLabel: '了解即可', userLabel: '基础了解' },
  ],
  dimensions: [
    { name: '技能', score: 95 },
    { name: '经验', score: 90 },
    { name: '学历', score: 100 },
    { name: '薪资', score: 85 },
    { name: '地点', score: 90 },
  ],
};

function CircularProgress({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full transform -rotate-90 absolute top-0 left-0"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="stroke-surface-container-highest"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth="8"
        />
        <circle
          className="stroke-primary transition-all duration-1000 ease-out"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline font-bold text-primary block leading-none" style={{ fontSize: size * 0.3 }}>
          {score}<span className="text-[0.5em]">%</span>
        </span>
        <span className="text-[10px] text-tertiary font-medium uppercase tracking-widest mt-1">
          总匹配度
        </span>
      </div>
    </div>
  );
}

function SkillComparison({ skill }: { skill: typeof matchData.skills[0] }) {
  const isHighMatch = skill.matchLevel === '高匹配';
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium text-on-surface">{skill.name}</span>
        <span className={`font-bold ${isHighMatch ? 'text-primary' : 'text-tertiary-container'} text-sm`}>
          {skill.matchLevel}
        </span>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary/40 h-full"
            style={{ width: `${skill.jobLevel}%` }}
          />
        </div>
        <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
          <div
            className={isHighMatch ? 'bg-primary' : 'bg-tertiary-container'}
            style={{ width: `${skill.userLevel}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-tertiary">
        <span className="w-1/2">职位期望：{skill.jobLabel}</span>
        <span className="w-1/2 pl-4">您的图谱：{skill.userLabel}</span>
      </div>
    </div>
  );
}

function DimensionBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-12 text-sm text-tertiary font-medium">{name}</span>
      <div className="flex-1 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-bold text-primary">{score}%</span>
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex-grow flex flex-col min-h-screen pb-24">

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (65%) */}
          <div className="w-full lg:w-[65%] space-y-8">
            {/* Match Overview Card */}
            <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      hub
                    </span>
                    <h1 className="text-3xl font-headline font-bold text-on-surface">
                      {matchData.jobTitle}
                    </h1>
                  </div>
                  <p className="text-tertiary text-lg mb-6">
                    {matchData.company} · {matchData.location}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium">
                      {matchData.salary}
                    </span>
                    <span className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium">
                      {matchData.experience}
                    </span>
                    <span className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium">
                      {matchData.education}
                    </span>
                    {matchData.isRecommended && (
                      <span className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        AI 极力推荐
                      </span>
                    )}
                  </div>
                </div>
                <CircularProgress score={matchData.matchScore} />
              </div>
            </section>

            {/* AI Reasoning */}
            <section className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow duration-300 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  insights
                </span>
                AI 深度认知解析
              </h2>
              <div className="space-y-6">
                <p className="text-on-surface-variant leading-relaxed text-base">
                  {matchData.aiAnalysis.summary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchData.aiAnalysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="bg-surface-container-low p-5 rounded-lg flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">{insight.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-on-surface mb-1">{insight.title}</h3>
                        <p className="text-sm text-tertiary">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Skill Comparison Detail */}
            <section className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-shadow duration-300 border border-outline-variant/15">
              <h2 className="text-xl font-headline font-bold mb-8 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  compare_arrows
                </span>
                技能维度明细对比
              </h2>
              <div className="space-y-8">
                {matchData.skills.map((skill, index) => (
                  <SkillComparison key={index} skill={skill} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (35%) */}
          <div className="w-full lg:w-[35%] space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 sticky top-24">
              <h3 className="text-lg font-headline font-bold mb-6 text-on-surface">
                五维匹配雷达分析
              </h3>
              <div className="space-y-5">
                {matchData.dimensions.map((dim, index) => (
                  <DimensionBar key={index} name={dim.name} score={dim.score} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 p-6 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto flex justify-center">
          <button className="bg-gradient-to-r from-primary to-primary-container text-white px-12 py-4 rounded-xl text-lg font-bold font-headline shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-300 w-full md:w-auto md:min-w-[400px] flex justify-center items-center gap-2 hover:-translate-y-0.5 active:scale-95">
            <span className="material-symbols-outlined">send</span>
            立即投递
          </button>
        </div>
      </div>
    </div>
  );
}
