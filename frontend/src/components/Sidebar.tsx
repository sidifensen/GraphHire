'use client';

const features = [
  {
    icon: 'psychology',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    title: '智能解析',
    description: '深度语义理解简历与JD，提取核心技能与隐性经验要求。',
  },
  {
    icon: 'hub',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    title: '图谱分析',
    description: '构建行业知识图谱，发现跨领域职业路径与技能迁移关联。',
  },
  {
    icon: 'my_location',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    title: '精准匹配',
    description: '多维向量计算，消除信息噪音，直达最高契合度的职场机遇。',
  },
];

const companies = [
  { name: '云图数据', icon: 'cloud', color: 'text-primary' },
  { name: '星河智联', icon: 'language', color: 'text-secondary' },
  { name: '盾甲科技', icon: 'security', color: 'text-tertiary' },
  { name: '元界互动', icon: 'view_in_ar', color: 'text-on-surface' },
];

export default function Sidebar() {
  return (
    <div className="lg:col-span-4 flex flex-col gap-8">
      {/* Cognitive Guide System Card */}
      <div className="bg-surface-container-low rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative node network background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, #003da6 2px, transparent 2px), radial-gradient(circle at 80% 60%, #4a6ae7 2px, transparent 2px)',
            backgroundSize: '60px 60px',
          }}
        />
        <h2 className="font-headline text-xl font-bold text-on-surface mb-6 relative z-10">
          认知导视体系
        </h2>
        <div className="flex flex-col gap-6 relative z-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-full ${feature.iconBg} flex flex-shrink-0 items-center justify-center ${feature.iconColor}`}>
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">{feature.title}</h4>
                <p className="text-sm text-on-surface-variant">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Companies */}
      <div className="bg-surface-container-lowest rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-bold text-on-surface">热门企业</h2>
          <button className="text-tertiary hover:text-primary text-sm transition-colors material-symbols-outlined">
            more_horiz
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {companies.map((company) => (
            <a
              key={company.name}
              href="#"
              className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl hover:bg-surface-container-low transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className={`material-symbols-outlined ${company.color} text-3xl`}>
                  {company.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-on-surface">{company.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
