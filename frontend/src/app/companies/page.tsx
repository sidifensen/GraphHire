'use client';

import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const companies = [
  {
    id: 1,
    name: 'TechNova 智谷科技',
    tags: ['人工智能', '1000人以上', 'C轮'],
    description: '专注于通用人工智能及大模型商业化落地的顶尖科技企业，致力于通过认知智能重塑行业生产力，核心团队来自全球顶尖AI实验室。',
    jobCount: 128,
    matchScore: 94,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLFtdFGGmjiBa9J58S1sB3Mvct3dswmKfKhBz3knfvft2_MX_kKLlP0jP7eaes9Uit3tn-r2aDizSDtaINd_lvqU81-Bw536T5NiWMxlDvcoic_pFWTuRlKbmRTj0hs4pnrBH2RM3OxH_OcveBbiY08rdO5mYl10moPeoG1oHb__OjV70qfmZkkt71pG-kUFOZTsWYGGgm7MUWbhVC6A8aoDwnyOySGpiC4hQqmcpyIfhzT9iUa3Lupp2QpjzsQZAvqgwKY8-oatp2',
  },
  {
    id: 2,
    name: 'FinEdge 锐金融',
    tags: ['金融科技', '500-999人', 'B轮'],
    description: '领先的数字金融服务提供商，利用大数据和图谱分析技术，为小微企业和个人用户提供精准、高效的金融风控与信贷服务。',
    jobCount: 56,
    matchScore: 88,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkxGFp567cUx91Y1Vk_Cn7UE7OPAspO1f2Mqzji0YTsmmmERrYtJgaAw1jK153KuSsvsQiRpVjI1mitAcDeAG9jcJcT-1mKk9_f-s-gC_cuaHXzossfwkbrC-8XdsicGa4xfsbbH3j5sVaM_h9XY4-h9IVU5dlULnCVs4GJSJE9jp1yPPemvr7WU14Hsz5F1ZjTlySFbkhKzQ19m6hhhmNGA9kTzx8rM3RwgJnrkYvPA8O5DGlMHnQRn5XrWrVayYmKjxY4kSWhFtH',
  },
  {
    id: 3,
    name: 'CloudMatrix 矩阵云',
    tags: ['企业服务', '100-499人', 'A轮'],
    description: '新一代云原生架构解决方案提供商，为传统企业数字化转型提供安全、稳定、可扩展的底层架构支撑与咨询服务。',
    jobCount: 32,
    matchScore: 82,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6VGRrdL79g2dfrf3Mrhkx6Lb-CNrLEI2_Dto1MBh80TeKR2rRZNL9bJQ3wPJ1zBuC_7bDRXOiZNEX2NqiEvcGq3-yGrMkdchvz1Kfy0ZZDGOQeneJP1Sza-tKgO2MwERkfkniqAFyqSvupT9BXuIfhQyKFcC0LV_wE5C2mEPFK86ieLUaxbOSLw4mdJbwXm17yD6y7yzO7UcMGbHChR1Xu5_MV6Ud1kS4jBhgvekxBDAbZg9nl4-6yDJ5vknLYHGDgi3VRsfavWPy',
  },
];

function CircularScore({ score }: { score: number }) {
  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-surface-container-highest"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray="100, 100"
          strokeWidth="3"
        />
        <path
          className="text-primary"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${score}, 100`}
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="flex-grow max-w-[1440px] mx-auto w-full px-8 py-12 flex flex-col gap-12">
        {/* Search & Filter Area */}
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col gap-8">
          {/* Search Bar */}
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary">search</span>
            </div>
            <input
              className="w-full bg-surface-container-lowest text-on-surface border-none rounded-lg pl-12 pr-4 py-4 shadow-sm focus:ring-0 focus:outline-none transition-all placeholder-on-surface-variant font-body"
              placeholder="搜索公司名称或关键词..."
              type="text"
            />
            <button className="absolute inset-y-2 right-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 rounded-md font-medium hover:opacity-90 transition-opacity">
              智能搜索
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* Industry */}
            <div className="flex items-start gap-4">
              <span className="text-tertiary font-medium whitespace-nowrap pt-1">行业领域</span>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium">不限</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">互联网</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">人工智能</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">金融科技</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">电子商务</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">企业服务</button>
              </div>
            </div>

            {/* Company Size */}
            <div className="flex items-start gap-4">
              <span className="text-tertiary font-medium whitespace-nowrap pt-1">公司规模</span>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium">不限</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">0-20人</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">20-99人</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">100-499人</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">500-999人</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">1000人以上</button>
              </div>
            </div>

            {/* Funding Stage */}
            <div className="flex items-start gap-4">
              <span className="text-tertiary font-medium whitespace-nowrap pt-1">融资阶段</span>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium">不限</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">未融资</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">天使轮</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">A轮</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">B轮</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">C轮及以上</button>
                <button className="px-4 py-1.5 rounded-full bg-surface-variant text-on-surface-variant text-sm hover:bg-surface-container-highest transition-colors">已上市</button>
              </div>
            </div>
          </div>
        </section>

        {/* Company List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {companies.map((company) => (
            <article
              key={company.id}
              className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex justify-between items-start z-10">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                    <Image
                      alt={`${company.name} Logo`}
                      src={company.logo}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 z-10 flex-grow font-body">
                {company.description}
              </p>

              <div className="flex justify-between items-end border-t border-outline-variant/15 pt-4 mt-auto z-10">
                <div className="flex flex-col">
                  <span className="text-xs text-tertiary mb-1">热招职位</span>
                  <a className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4" href="#">
                    {company.jobCount} 个
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-tertiary block">AI 匹配度</span>
                    <span className="text-primary font-headline font-extrabold text-xl">{company.matchScore}%</span>
                  </div>
                  <CircularScore score={company.matchScore} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-tertiary hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-medium shadow-sm">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-tertiary hover:bg-surface-container-high transition-colors font-medium">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-tertiary hover:bg-surface-container-high transition-colors font-medium">3</button>
          <span className="text-tertiary px-2">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-tertiary hover:bg-surface-container-high transition-colors font-medium">12</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-tertiary hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
