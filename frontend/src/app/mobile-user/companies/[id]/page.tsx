"use client";

import { Link, useParams } from "../../_lib/router";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { TopNav } from "../../_components/TopNav";
import { MOCK_COMPANIES, MOCK_JOBS } from "../../_data/mockData";

export default function CompanyDetail() {
  const { id } = useParams();
  const company = MOCK_COMPANIES.find((entry) => entry.id === id) || MOCK_COMPANIES[0];
  const companyJobs = MOCK_JOBS.filter((job) => job.company.includes(company.name)).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="公司详情" showShare />

      <main className="max-w-md mx-auto w-full pb-12">
        <section className="px-5 pt-8 pb-6 relative">
          <div className="absolute top-8 left-5 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 shrink-0 rounded-xl bg-surface-lowest border border-surface-mid shadow-sm p-3 flex items-center justify-center">
              <img src={company.logo} className="w-full h-full object-contain" alt="logo" />
            </div>
            <div className="flex flex-col pt-1">
              <h2 className="text-2xl font-black text-on-surface mb-2">{company.name}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-surface-low rounded-full text-[10px] font-bold text-on-surface-variant uppercase">{company.industry}</span>
                <span className="px-3 py-1 bg-surface-low rounded-full text-[10px] font-bold text-on-surface-variant uppercase">{company.stage}</span>
                <span className="px-3 py-1 bg-surface-low rounded-full text-[10px] font-bold text-on-surface-variant uppercase">{company.size}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 mb-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-surface-lowest rounded-2xl p-4 shadow-sm border border-surface-mid">
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Calendar size={16} />
                <span className="text-[10px] font-bold uppercase">成立时间</span>
              </div>
              <div className="font-bold text-lg text-on-surface">{company.founded}</div>
            </div>
            <div className="bg-surface-lowest rounded-2xl p-4 shadow-sm border border-surface-mid">
              <div className="flex items-center gap-2 mb-1 text-primary">
                <MapPin size={16} />
                <span className="text-[10px] font-bold uppercase">总部地点</span>
              </div>
              <div className="font-bold text-lg text-on-surface">{company.headquarters}</div>
            </div>
          </div>

          <h3 className="text-xl font-black mb-4 text-on-surface">公司介绍</h3>
          <div className="bg-surface-lowest rounded-2xl p-5 shadow-sm border border-surface-mid">
            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-4">{company.intro}</p>
            <button className="text-primary text-xs font-bold flex items-center gap-1">
              展开全部 <ChevronRight size={14} className="rotate-90" />
            </button>
          </div>
        </section>

        <section className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-on-surface">在招职位</h3>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">{companyJobs.length}</span>
            </div>
            <Link to="/jobs" className="text-primary text-xs font-bold flex items-center gap-1">
              查看全部 <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {companyJobs.length > 0 ? (
              companyJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block bg-surface-lowest rounded-2xl p-5 shadow-sm border border-surface-mid relative overflow-hidden active:scale-[0.98] transition-transform"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-on-surface pr-4 truncate">{job.title}</h4>
                    <span className="text-primary font-bold whitespace-nowrap">{job.salary.split("·")[0]}</span>
                  </div>
                  <div className="flex gap-2">
                    {job.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] font-bold text-on-surface-variant opacity-60">#{tag}</span>
                    ))}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-mid bg-surface-lowest px-5 py-8 text-center text-sm text-on-surface-variant">
                暂无在招职位
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
