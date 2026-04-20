'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HomeJobCard } from '@/lib/types/home';

const mockJobs: HomeJobCard[] = [
  {
    id: 1,
    title: '高级 NLP 算法工程师',
    companyName: '星河智联科技有限公司',
    city: '北京',
    district: '海淀区',
    salaryText: '35k-60k',
    requiredSkills: ['大模型训练', 'PyTorch', 'Transformer'],
    hrName: '张女士',
    hrTitle: '招聘总监',
    hrAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBihZa3i2w6nuXoUsHh1E7wZpyMlglNxgjPyjuUto36Tx6piF5Hpgm9oK5zRnfSPnYt812mVWsy2bG92obpk9EbfPOup8Y6SQyzicd1LjFEnzP9evbwZm1RBaoUIOreGQgM4oaC0rDqQzzyWnMpVnSDCmDbL5ydb65N7ccJD9DlKJG7ReoxCBwa7tnM1TF7gPoW-Jln7g8R28YfiKN_tmbuFgn-k_kqgcLgfSH942ythS6Jov7i-nBXQXh-U4zbCs3hQtk5SEk1ucne',
    matchScore: 95,
  },
  {
    id: 2,
    title: 'AIGC 产品经理',
    companyName: '云图数据网络',
    city: '上海',
    district: '徐汇区',
    salaryText: '25k-40k',
    requiredSkills: ['产品规划', 'AI绘画', '商业化'],
    hrName: '李先生',
    hrTitle: '业务负责人',
    hrAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIjTbE1zXWfbLrcc_MbowDsOXiVg7Dg2OpFoA7-8UYNx8kTx2crEiI8gAcrhN0jubn5W3rW2T50bJ4a06SZ0xr-9EEutgCaEg7lCQqpmxSgKhrhzmML_9upWay7nWseKJCnXpHLAUZtva3NNna3KkSc-h2WirpiaKrM7cm0KsKX9AReU8dZtfowXtQSGdwaAM5i_HeBovaaPjzWO8ecD_AgCyeMjvZ9k6WLYA1RSFtwuQ_EaUbqX5Z3iZfwuGRBAKemHMcn30TCVlW',
    matchScore: 88,
  },
  {
    id: 3,
    title: '全栈开发工程师 (Node.js/React)',
    companyName: '绿洲共创',
    city: '深圳',
    district: '南山区',
    salaryText: '20k-35k',
    requiredSkills: ['React', 'Node.js', 'TypeScript'],
    hrName: '王女士',
    hrTitle: 'HRBP',
    matchScore: 82,
  },
];

const hotTags = ['Java', 'AI算法', '产品经理', '数据分析', 'Rust'];

const popularCompanies = [
  { name: '云图数据', icon: 'cloud', color: 'text-primary' },
  { name: '星河智联', icon: 'language', color: 'text-secondary' },
  { name: '盾甲科技', icon: 'security', color: 'text-tertiary' },
  { name: '元界互动', icon: 'view_in_ar', color: 'text-on-surface' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="bg-surface-container-low py-20 relative overflow-hidden">
          {/* Ambient Graphic overlay */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-8 relative z-10 flex flex-col items-center text-center">
            {/* Gradient Title */}
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-6 tracking-tight max-w-4xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                AI 驱动
              </span>
              ，图谱智联
            </h1>

            {/* Subtitle */}
            <p className="text-on-surface-variant text-lg md:text-xl font-body max-w-2xl mb-12">
              构建属于你的认知导视体验，精准匹配理想职业节点。
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] p-2 flex flex-col md:flex-row items-center gap-2 relative">
              {/* Job Search */}
              <div className="flex-1 flex items-center px-4 py-3 relative input-tech-focus w-full">
                <span className="material-symbols-outlined text-tertiary mr-3">search</span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-lg"
                  placeholder="搜索职位、技能或公司..."
                  type="text"
                />
              </div>

              <div className="w-px h-10 bg-surface-container mx-2 hidden md:block" />

              {/* City */}
              <div className="flex-1 md:max-w-[200px] flex items-center px-4 py-3 relative input-tech-focus w-full">
                <span className="material-symbols-outlined text-tertiary mr-3">location_on</span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0"
                  placeholder="城市"
                  type="text"
                />
              </div>

              <div className="w-px h-10 bg-surface-container mx-2 hidden md:block" />

              {/* Salary */}
              <div className="flex-1 md:max-w-[200px] flex items-center px-4 py-3 relative input-tech-focus w-full">
                <span className="material-symbols-outlined text-tertiary mr-3">payments</span>
                <select className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-base cursor-pointer">
                  <option value="">薪资要求</option>
                  <option value="1">10k-20k</option>
                  <option value="2">20k-30k</option>
                  <option value="3">30k以上</option>
                </select>
              </div>

              {/* Search Button */}
              <button className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-8 py-4 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <span>智能搜索</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Hot Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-sm text-tertiary mr-2">热门探索:</span>
              {hotTags.map((tag) => (
                <button
                  key={tag}
                  className="bg-surface-variant text-on-surface-variant hover:bg-surface-container-high rounded-full px-4 py-1.5 text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Editorial Grid */}
        <section className="max-w-[1440px] mx-auto px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Recommended Jobs (8 columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  为您精选职位
                </h2>
                <button className="text-primary hover:text-primary-container text-sm font-medium flex items-center gap-1 transition-colors">
                  查看全部推荐
                  <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                </button>
              </div>

              {mockJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Right Column (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Cognitive Navigation System Card */}
              <div className="bg-surface-container-low rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative background */}
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
                  {/* Smart Analysis */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex flex-shrink-0 items-center justify-center text-primary">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">智能解析</h4>
                      <p className="text-sm text-on-surface-variant">
                        深度语义理解简历与JD，提取核心技能与隐性经验要求。
                      </p>
                    </div>
                  </div>

                  {/* Graph Analysis */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex flex-shrink-0 items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined">hub</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">图谱分析</h4>
                      <p className="text-sm text-on-surface-variant">
                        构建行业知识图谱，发现跨领域职业路径与技能迁移关联。
                      </p>
                    </div>
                  </div>

                  {/* Precision Match */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex flex-shrink-0 items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">my_location</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">精准匹配</h4>
                      <p className="text-sm text-on-surface-variant">
                        多维向量计算，消除信息噪音，直达最高契合度的职场机遇。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Companies Grid */}
              <div className="bg-surface-container-lowest rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-xl font-bold text-on-surface">
                    热门企业
                  </h2>
                  <button className="text-tertiary hover:text-primary text-sm transition-colors material-symbols-outlined">
                    more_horiz
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {popularCompanies.map((company) => (
                    <button
                      key={company.name}
                      className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl hover:bg-surface-container-low transition-colors group"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <span className={`material-symbols-outlined text-3xl ${company.color}`}>
                          {company.icon}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-on-surface">
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function JobCard({ job }: { job: HomeJobCard }) {
  const { title, companyName, city, district, salaryText, requiredSkills, hrName, hrTitle, hrAvatar, matchScore } = job;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] transition-all duration-300 group cursor-pointer border border-transparent hover:border-surface-container-high relative overflow-hidden">
      {/* Subtle gradient indicating high match */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-tertiary mt-1 flex items-center gap-2">
            <span>{companyName}</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>{city}{district ? `·${district}` : ''}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-primary block">{salaryText}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {requiredSkills.map((skill) => (
          <span
            key={skill}
            className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
        <div className="flex items-center gap-3">
          {hrAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={hrName}
              src={hrAvatar}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs">
              HR
            </div>
          )}
          <span className="text-sm text-on-surface-variant">{hrName} · {hrTitle}</span>
        </div>

        {matchScore !== undefined ? (
          <div className="bg-primary-fixed text-on-primary-fixed rounded-full px-4 py-1.5 text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base icon-fill text-primary">robot_2</span>
            AI匹配度：{matchScore}%
          </div>
        ) : (
          <div className="bg-surface-container-highest text-on-surface rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">analytics</span>
            匹配度：{matchScore ?? 0}%
          </div>
        )}
      </div>
    </div>
  );
}
