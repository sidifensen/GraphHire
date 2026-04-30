import { useNavigate, useParams } from "react-router-dom";
import { mockJobs } from "../lib/mockData";

export default function JobEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === id) || mockJobs[0];

  return (
    <div className="flex flex-col h-full bg-background relative pb-[80px]">
      
      <main className="w-full max-w-[375px] md:max-w-3xl mx-auto flex-1 overflow-y-auto px-container-margin py-stack-gap-md space-y-stack-gap-md pb-[100px]">
        {/* Basic Information Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">基本信息</h2>
          
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">职位名称</label>
            <input 
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" 
              placeholder="输入职位名称" 
              type="text" 
              defaultValue={job.title}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">所属部门</label>
            <div className="relative">
              <select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" defaultValue={job.department}>
                <option value="研发中心">研发中心</option>
                <option value="产品部">产品部</option>
                <option value="设计部">设计部</option>
                <option value="技术部">技术部</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">工作地点</label>
            <input 
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" 
              type="text" 
              defaultValue={job.location}
            />
          </div>
        </div>

        {/* Job Requirements Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">职位要求</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">最低薪资 (k)</label>
              <input 
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" 
                type="number" 
                defaultValue="25"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">最高薪资 (k)</label>
              <input 
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" 
                type="number" 
                defaultValue="40"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">经验要求</label>
              <div className="relative">
                <select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" defaultValue={job.experience}>
                  <option value="1-3年">1-3年</option>
                  <option value="3-5年">3-5年</option>
                  <option value="5-10年">5-10年</option>
                  <option value="不限">不限</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">学历要求</label>
              <div className="relative">
                <select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" defaultValue={job.education}>
                  <option value="本科">本科</option>
                  <option value="本科及以上">本科及以上</option>
                  <option value="硕士">硕士</option>
                  <option value="不限">不限</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">职位详情</h2>
          
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">职位描述</label>
            <textarea 
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow resize-none" 
              rows={4}
              defaultValue={job.description}
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">任职要求</label>
            <textarea 
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow resize-none" 
              rows={4}
              defaultValue={job.requirements}
            ></textarea>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 w-full max-w-[375px] md:max-w-3xl mx-auto left-0 right-0 bg-surface-container-lowest border-t border-surface-variant p-4 pb-safe z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <button 
          onClick={() => navigate(-1)}
          className="w-full h-12 bg-primary text-on-primary rounded-lg font-headline-sm text-[16px] font-medium flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98] transition-all">
          保存修改
        </button>
      </div>
    </div>
  );
}
