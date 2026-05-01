'use client';

import { companyApi } from "@/lib/api/company";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JobCreate() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createDraft = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await companyApi.createJob({
        title: title.trim(),
        location: { city: city.trim() },
        salaryRange: {
          min: Number(salaryMin || "0"),
          max: Number(salaryMax || "0"),
          unit: "k/月",
        },
        description: description.trim(),
      });
      router.push('/enterprise/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存草稿失败");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const jobId = await companyApi.createJob({
        title: title.trim(),
        location: { city: city.trim() },
        salaryRange: {
          min: Number(salaryMin || "0"),
          max: Number(salaryMax || "0"),
          unit: "k/月",
        },
        description: description.trim(),
      });
      await companyApi.publishJob(jobId);
      router.push('/enterprise/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建职位失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="w-full max-w-[375px] md:max-w-5xl mx-auto flex-1 flex flex-col overflow-y-auto px-container-margin md:px-10 py-stack-gap-md pb-10 gap-stack-gap-lg">
        {/* Instructions / Context */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-1 w-9 h-9 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center shrink-0"
            aria-label="返回上一页"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col gap-stack-gap-xs">
          <h2 className="font-headline-md text-headline-md text-on-background">职位详情</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">请提供准确的职位信息，以吸引最合适的候选人。</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3 border border-surface-variant">
          <span className="font-label-md text-label-md text-on-surface-variant">职位状态</span>
          <span className="font-label-md text-label-md text-secondary font-semibold">草稿</span>
        </div>

        <form className="flex flex-col gap-stack-gap-md">
          {/* 职位名称 */}
          <div className="flex flex-col gap-stack-gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">职位名称</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-inline-padding-sm py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
                placeholder="例如：高级前端工程师" 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

          {/* 所在城市 */}
          <div className="flex flex-col gap-stack-gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">所在城市</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-inline-padding-sm pr-10 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline appearance-none" 
                placeholder="选择或输入城市" 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">location_on</span>
            </div>
          </div>

          {/* 薪资范围 (Grid layout) */}
          <div className="grid grid-cols-2 gap-stack-gap-md">
            {/* 最低薪资 */}
            <div className="flex flex-col gap-stack-gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">最低薪资</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-8 pr-3 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
                  placeholder="0" 
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">¥</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-outline text-[12px]">k</span>
              </div>
            </div>
            {/* 最高薪资 */}
            <div className="flex flex-col gap-stack-gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">最高薪资</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT pl-8 pr-3 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
                  placeholder="0" 
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">¥</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-outline text-[12px]">k</span>
              </div>
            </div>
          </div>

          {/* 职位描述 */}
          <div className="flex flex-col gap-stack-gap-xs mt-2">
            <label className="font-label-md text-label-md text-on-surface-variant">职位描述</label>
            <textarea 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-inline-padding-sm py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline resize-none" 
              placeholder="详细描述岗位职责、任职要求及加分项..." 
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          {error ? (
            <div className="text-error text-sm">{error}</div>
          ) : null}
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <button
            onClick={createDraft}
            disabled={submitting}
            className="flex-1 h-[48px] border border-outline-variant text-on-surface font-label-md text-[16px] font-medium rounded-DEFAULT flex items-center justify-center transition-all hover:bg-surface-container-low"
          >
            {submitting ? "保存中..." : "保存为草稿"}
          </button>
          <button 
            onClick={submit}
            disabled={submitting}
            className="flex-1 h-[48px] bg-primary text-on-primary font-label-md text-[16px] font-medium rounded-DEFAULT flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98] active:shadow-md transition-all">
            {submitting ? "发布中..." : "创建并发布"}
          </button>
        </div>
      </main>
    </div>
  );
}
