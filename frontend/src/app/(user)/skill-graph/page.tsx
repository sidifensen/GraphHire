'use client';

import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const skills = [
  { id: 1, name: '前端架构', match: 98, level: 'high', icon: 'code', top: '55%', left: '85%' },
  { id: 2, name: '性能优化', match: 0, level: 'medium', icon: 'speed', top: '20%', left: '75%' },
  { id: 3, name: '工程化构建', match: 0, level: 'medium', icon: 'view_quilt', top: '80%', left: '70%' },
  { id: 4, name: 'Node.js', match: 0, level: 'peripheral', icon: 'database', top: '75%', left: '30%' },
  { id: 5, name: '交互设计', match: 0, level: 'potential', icon: 'brush', top: '25%', left: '25%' },
  { id: 6, name: '数据可视', match: 0, level: 'potential', icon: 'analytics', top: '45%', left: '15%' },
];

const dimensions = [
  { name: '前端架构体系', percent: 95 },
  { name: '工程化与 DevOps', percent: 82 },
  { name: '团队与技术管理', percent: 60 },
];

function SkillNode({ skill }: { skill: typeof skills[0] }) {
  const getBgColor = () => {
    switch (skill.level) {
      case 'high': return 'bg-primary text-on-primary';
      case 'medium': return 'bg-primary-container text-on-primary-container';
      case 'peripheral': return 'bg-surface-variant text-on-surface-variant';
      case 'potential': return 'bg-surface-variant text-on-surface-variant border border-dashed border-outline-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div
      className="absolute z-10 flex flex-col items-center"
      style={{ top: skill.top, left: skill.left, transform: 'translate(-50%, -50%)' }}
    >
      <div
        className={`rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer ${getBgColor()}`}
        style={{ width: skill.level === 'high' ? '56px' : skill.level === 'medium' ? '48px' : '40px', height: skill.level === 'high' ? '56px' : skill.level === 'medium' ? '48px' : '40px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: skill.level === 'high' ? '24px' : skill.level === 'medium' ? '20px' : '16px' }}>
          {skill.icon}
        </span>
      </div>
      <div className="mt-2 text-center">
        <span className="block text-on-surface text-xs">{skill.name}</span>
        {skill.match > 0 && (
          <span className="text-[10px] text-primary font-medium bg-primary-fixed px-2 py-0.5 rounded-full mt-1 inline-block">
            {skill.match}% 匹配
          </span>
        )}
        {skill.level === 'potential' && (
          <span className="text-[10px] text-tertiary mt-0.5 block">跨界拓展</span>
        )}
      </div>
    </div>
  );
}

export default function SkillGraphPage() {
  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-10">
        {/* Header & Action Row */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
              认知导视体系
            </h1>
            <p className="text-on-surface-variant text-base">
              AI 深度解析您的职业技能网络，发现潜在关联与价值
            </p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-on-surface-variant">对比目标职位</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none">
              <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-surface-container-lowest transition-transform" />
            </button>
            <span className="text-xs text-primary font-bold ml-2">高级前端架构师</span>
          </div>
        </div>

        {/* Layout Grid: 65% Graph / 35% Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
          {/* Left: Centralized Interactive Graph */}
          <section className="bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden flex flex-col min-h-[600px] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] group">
            {/* Decorative ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-fixed-dim/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-center mb-4 z-10 relative">
              <h2 className="font-headline text-xl font-bold text-on-surface">核心技能图谱</h2>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">zoom_in</span>
                <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">zoom_out</span>
              </div>
            </div>

            {/* Graph Canvas */}
            <div className="flex-grow relative w-full h-full mt-4">
              {/* SVG Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                <line className="opacity-60" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1.5" x1="50%" x2="25%" y1="50%" y2="25%" />
                <line stroke="var(--color-primary-fixed-dim)" strokeWidth="2" x1="50%" x2="75%" y1="50%" y2="20%" />
                <line stroke="var(--color-primary)" strokeWidth="3" x1="50%" x2="85%" y1="50%" y2="55%" />
                <line stroke="var(--color-primary-fixed-dim)" strokeWidth="2" x1="50%" x2="70%" y1="50%" y2="80%" />
                <line stroke="var(--color-outline-variant)" strokeWidth="1.5" x1="50%" x2="30%" y1="50%" y2="75%" />
                <line className="opacity-60" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1.5" x1="50%" x2="15%" y1="50%" y2="45%" />
                <line stroke="var(--color-surface-variant)" strokeWidth="1" x1="85%" x2="75%" y1="55%" y2="20%" />
                <line stroke="var(--color-surface-variant)" strokeWidth="1" x1="85%" x2="70%" y1="55%" y2="80%" />
              </svg>

              {/* Center Avatar Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse opacity-50 scale-110" />
                  <Image
                    alt="用户头像"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBCYbiB_RRR4JLhJv9rLIVIw6eW5ysmYeZJFTzoz4MlRjYcVS6LN-XfxA_wbs3f9BmklLmVX43qufYJlJDAMQIaDHPPRbXP09vR46avH6UkJROtJJo4IjSrhEKg0bPf55SgcrSrHSpTrcyCLgpmOOH7tRgDf4mP6xUvncSc4roOq0aQtJ3ZxDBVbxCBTqwsv0hCfhPn7KTHH6pMDycI0iPggl7H7aELFl_P4MaeINHrdQDJyq3upG0S1KQ1ZNPjKFV8t0YeodoDhu6"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-4 border-surface-container-lowest ring-4 ring-primary-fixed shadow-sm"
                  />
                </div>
                <span className="mt-3 font-headline font-bold text-on-surface bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  当前状态
                </span>
              </div>

              {/* Surrounding Skill Nodes */}
              {skills.map((skill) => (
                <SkillNode key={skill.id} skill={skill} />
              ))}
            </div>
          </section>

          {/* Right: AI Analysis Panel */}
          <aside className="flex flex-col gap-6">
            {/* Score Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline font-bold text-on-surface">AI 综合能力评估</h3>
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="font-headline text-6xl font-black text-primary tracking-tighter leading-none">87</span>
                <span className="text-on-surface-variant font-medium pb-1">/ 100</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">
                您的技能组合在目标岗位池中处于<span className="text-primary font-bold">前 15%</span>的领先水平。
              </p>
            </div>

            {/* Skill Radar/Bars */}
            <div className="bg-surface-container-low rounded-2xl p-6 flex-grow">
              <h3 className="font-headline font-bold text-on-surface mb-6">核心维度重合度</h3>
              <div className="flex flex-col gap-5">
                {dimensions.map((dim, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-on-surface">{dim.name}</span>
                      <span className={dim.percent >= 90 ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'}>
                        {dim.percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${dim.percent}%`,
                          background: dim.percent >= 90
                            ? 'var(--color-primary)'
                            : dim.percent >= 80
                              ? 'linear-gradient(135deg, #003da6 0%, #0052d9 100%)'
                              : 'var(--color-tertiary-fixed-dim)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                <h3 className="font-headline font-bold text-on-surface">技能提升建议</h3>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-on-surface-variant">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>
                    距离目标职位，您的<strong>团队管理</strong>经验略显不足。建议补充敏捷管理相关的理论体系学习。
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>
                    图谱侦测到您的 <strong>Node.js</strong> 技能节点处于边缘，若强化该领域，将解锁"全栈架构"新路径。
                  </span>
                </li>
              </ul>
              <button className="mt-6 w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-medium py-3 rounded-xl hover:opacity-90 transition-opacity">
                生成专属学习路线
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
