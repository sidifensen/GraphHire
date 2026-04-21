'use client';

const mockJobs = [
  {
    id: 1,
    title: '资深前端架构师 (认知计算方向)',
    company: '字节跳动',
    location: '北京·中关村',
    experience: '5-10年',
    salary: '50K - 80K',
    skills: ['React 生态', '微前端架构', 'Node.js'],
    urgent: true,
    matchScore: 98,
  },
  {
    id: 2,
    title: 'AI 交互设计师',
    company: '百度',
    location: '深圳·南山区',
    experience: '3-5年',
    salary: '35K - 50K',
    skills: ['认知心理学', '数据可视化', 'Figma'],
    urgent: false,
    matchScore: 88,
  },
  {
    id: 3,
    title: '认知图谱研发工程师',
    company: '图谱智聘 (官方直招)',
    location: '上海·浦东新区',
    experience: '不限',
    salary: '40K - 65K',
    skills: ['知识图谱构建', 'Neo4j', 'Python', 'NLP'],
    urgent: false,
    matchScore: 75,
  },
];

function CircularProgress({ score, color = 'text-primary' }: { score: number; color?: string }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-surface-container-high"
          cx="48"
          cy="48"
          fill="transparent"
          r="42"
          stroke="currentColor"
          strokeWidth="8"
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          cx="48"
          cy="48"
          fill="transparent"
          r="42"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline text-2xl font-black text-primary">
          {score}
          <span className="text-sm">%</span>
        </span>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="flex-grow flex flex-col min-h-screen">

      <main className="flex-grow max-w-[1200px] w-full mx-auto px-6 py-12">
        {/* Search & Cognitive Filters Area */}
        <section className="bg-surface-container-low rounded-[1.5rem] p-8 mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed to-transparent" />
          <div className="relative z-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-8">
              探索智能匹配职位
            </h1>
            <div className="flex gap-4 mb-6">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">
                  search_insights
                </span>
                <input
                  className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-0 text-lg shadow-sm"
                  placeholder="输入职位、公司或图谱技能节点..."
                  type="text"
                />
              </div>
              <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
                搜索图谱
              </button>
            </div>
            {/* Multi-dimensional Filters */}
            <div className="flex flex-wrap gap-3">
              <button className="bg-surface-container-lowest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors shadow-sm">
                推荐城市
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button className="bg-surface-container-lowest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors shadow-sm">
                薪资范畴
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button className="bg-surface-container-lowest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-surface-variant transition-colors shadow-sm">
                经验要求
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <div className="w-px h-6 bg-outline-variant mx-2 self-center" />
              <button className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">magic_button</span>
                高匹配度优先
              </button>
            </div>
          </div>
        </section>

        {/* Job Card List */}
        <section className="flex flex-col gap-6">
          {mockJobs.map((job) => (
            <article
              key={job.id}
              className="bg-surface-container-lowest rounded-[1.5rem] p-8 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-container-low/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 ease-in-out" />
              <div className="flex-grow pr-8 relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="font-headline text-2xl font-bold text-primary">{job.title}</h2>
                  {job.urgent && (
                    <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                      急聘
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-on-surface-variant text-sm mb-6">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">business</span>
                    <span className="font-medium text-on-surface">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">work</span>
                    <span>{job.experience}</span>
                  </div>
                  <div className="font-headline font-bold text-primary-container text-lg ml-auto">
                    {job.salary}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">hub</span>
                    图谱技能匹配
                  </span>
                </div>
              </div>
              {/* AI Match Score */}
              <div className="flex flex-col items-center justify-center pl-8 border-l-2 border-surface-container-low relative z-10 w-[180px]">
                <CircularProgress
                  score={job.matchScore}
                  color={job.matchScore >= 90 ? 'text-primary' : 'text-primary-container'}
                />
                <span className="text-xs font-medium text-tertiary mt-3 tracking-wide">
                  AI 认知匹配度
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Pagination */}
        <nav className="mt-16 flex justify-center items-center gap-2">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-sm">
            1
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors">
            2
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors">
            3
          </button>
          <span className="text-on-surface-variant px-2">...</span>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors">
            12
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </nav>
      </main>

    </div>
  );
}
