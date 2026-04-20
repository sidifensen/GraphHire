import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import JobCard from '@/components/JobCard';
import Sidebar from '@/components/Sidebar';
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

export default function HomePage() {
  return (
    <div className="flex-grow flex flex-col w-full">
      <NavBar />

      <main className="flex-grow flex flex-col w-full">
        <Hero />

        {/* Main Editorial Grid */}
        <section className="max-w-[1440px] mx-auto px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Recommended Jobs (65%) */}
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

            {/* Right Column: Sidebar (35%) */}
            <Sidebar />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white full-width border-t border-slate-100 flex flex-col md:flex-row justify-between items-center px-12 py-8 mt-20">
        <div className="text-tertiary font-body text-xs tracking-wide">
          © 2024 GraphHire 图谱智聘. 认知导视 AI 招聘系统
        </div>
        <div className="flex gap-6 mt-4 md:mt-0 font-body text-xs tracking-wide">
          <a className="text-slate-400 hover:text-primary hover:underline underline-offset-4 transition-all" href="#">
            关于我们
          </a>
          <a className="text-slate-400 hover:text-primary hover:underline underline-offset-4 transition-all" href="#">
            联系方式
          </a>
          <a className="text-slate-400 hover:text-primary hover:underline underline-offset-4 transition-all" href="#">
            服务条款
          </a>
          <a className="text-slate-400 hover:text-primary hover:underline underline-offset-4 transition-all" href="#">
            隐私政策
          </a>
        </div>
      </footer>
    </div>
  );
}
