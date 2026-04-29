"use client";

import { useParams, Link } from "../../_lib/router";
import { MapPin, Briefcase, GraduationCap, Zap, ChevronRight } from "lucide-react";
import { MOCK_COMPANIES, MOCK_JOBS } from "../../_data/mockData";
import { TopNav } from "../../_components/TopNav";

export default function JobDetail() {
  const { id } = useParams();
  const job = MOCK_JOBS.find((entry) => entry.id === id) || MOCK_JOBS[0];
  const company = MOCK_COMPANIES.find((entry) => entry.name === job.company) || MOCK_COMPANIES[0];

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <TopNav title="" showShare />

      <main className="px-5 pt-6 pb-24">
        <section className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">{job.title}</h1>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-primary">{job.salary}</span>
            <span className="text-sm text-outline">15薪</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag icon={MapPin} text={job.location} />
            <Tag icon={Briefcase} text={job.experience} />
            <Tag icon={GraduationCap} text={job.education} />
          </div>
        </section>

        <section className="mb-8">
          <Link
            to={`/companies/${company.id}`}
            className="flex items-center gap-4 p-4 bg-surface-lowest rounded-2xl shadow-sm border border-surface-mid active:scale-[0.98] transition-transform"
          >
            <img src={job.companyLogo} className="w-14 h-14 rounded-xl border border-surface-mid object-contain bg-surface-lowest p-1" alt="logo" />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-on-surface truncate">{company.name}</h3>
              <p className="text-xs text-on-surface-variant truncate">
                {company.stage} · {company.size} · {company.industry}
              </p>
            </div>
            <ChevronRight className="text-outline" size={20} />
          </Link>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              职位描述
            </h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm mb-2 text-on-surface">岗位职责：</h4>
                <ul className="text-body-md text-on-surface-variant leading-relaxed space-y-2 list-disc pl-5">
                  {(job.description
                    ? [job.description]
                    : [
                        "负责大规模语言模型（LLM）的微调与优化，提升在特定垂直领域的表现。",
                        "设计并实现高效的推荐算法架构，解决海量数据下的高并发推荐问题。",
                        "跟进业内最新的AI技术动态，将前沿研究成果转化为实际产品落地。",
                      ]
                  ).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2 text-on-surface">任职要求：</h4>
                <ul className="text-body-md text-on-surface-variant leading-relaxed space-y-2 list-disc pl-5">
                  {(job.requirements && job.requirements.length > 0
                    ? job.requirements
                    : ["计算机、数学或相关专业硕士及以上学历，具有扎实的机器学习基础。", "熟练掌握Python/C++，熟悉PyTorch、TensorFlow。"]
                  ).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-surface-lowest flex gap-4 p-5 border-t border-surface-mid pb-safe z-50">
        <button className="flex-1 h-12 rounded-xl border border-primary text-primary font-bold flex items-center justify-center gap-2 active:bg-primary/5 transition-colors">
          <Zap size={18} fill="currentColor" />
          开始智能匹配
        </button>
        <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          立即投递
        </button>
      </div>
    </div>
  );
}

function Tag({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-low text-on-surface-variant rounded-full text-[10px] font-bold">
      <Icon size={14} />
      {text}
    </div>
  );
}
