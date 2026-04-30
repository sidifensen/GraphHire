'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { companyApi } from "@/lib/api/company";
import type { EnterpriseJobDetail } from "@/lib/types/enterprise";

export default function JobEdit() {
  const router = useRouter();
  const { id } = useParams();
  const jobId = Number(id);

  const [job, setJob] = useState<EnterpriseJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const detail = await companyApi.getJobDetail(jobId);
        if (cancelled) return;

        setJob(detail);
        setTitle(detail.title || "");
        setDepartment(detail.department || "");
        setCity(detail.location?.city || "");
        setSalaryMin(detail.salaryRange?.min?.toString() || "");
        setSalaryMax(detail.salaryRange?.max?.toString() || "");
        setDescription(detail.description || "");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "职位详情加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!Number.isFinite(jobId)) {
      setError("无效职位ID");
      setLoading(false);
      return;
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && city.trim().length > 0,
    [title, city],
  );

  const onSave = async () => {
    if (!job || saving || !canSubmit) return;

    setSaving(true);
    setError("");
    try {
      await companyApi.updateJob(jobId, {
        title: title.trim(),
        department: department.trim() || undefined,
        headcount: job.headcount ?? undefined,
        skills: job.skills ?? undefined,
        location: { city: city.trim() },
        salaryRange: {
          min: Number(salaryMin || "0"),
          max: Number(salaryMax || "0"),
          unit: job.salaryRange?.unit || "k/月",
        },
        description: description.trim(),
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-on-surface-variant">职位信息加载中...</div>;
  }

  if (error && !job) {
    return <div className="p-6 text-error">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background relative pb-[80px]">
      <main className="w-full max-w-[375px] md:max-w-3xl mx-auto flex-1 overflow-y-auto px-container-margin py-stack-gap-md space-y-stack-gap-md pb-[100px]">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">基本信息</h2>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">职位名称</label>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
              placeholder="输入职位名称"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">所属部门</label>
            <div className="relative">
              <select
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">未设置</option>
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">职位要求</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">最低薪资 (k)</label>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant">最高薪资 (k)</label>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-stack-gap-md">
          <h2 className="font-label-md text-label-md text-primary tracking-wider uppercase">职位详情</h2>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">职位描述</label>
            <textarea
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow resize-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md text-on-surface-variant">任职要求</label>
            <textarea
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow resize-none"
              rows={4}
              defaultValue={job?.requiredSkills?.join("、") ?? ""}
              readOnly
            ></textarea>
          </div>
        </div>

        {error ? <div className="text-error text-sm">{error}</div> : null}
      </main>

      <div className="fixed bottom-0 w-full max-w-[375px] md:max-w-3xl mx-auto left-0 right-0 bg-surface-container-lowest border-t border-surface-variant p-4 pb-safe z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <button
          onClick={onSave}
          disabled={!canSubmit || saving}
          className="w-full h-12 bg-primary text-on-primary rounded-lg font-headline-sm text-[16px] font-medium flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {saving ? "保存中..." : "保存修改"}
        </button>
      </div>
    </div>
  );
}
