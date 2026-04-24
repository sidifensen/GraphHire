'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { companyApi } from '@/lib/api/company';

const salaryUnit = 'CNY/MONTH';

export default function JobNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const min = Number(salaryMin);
    const max = Number(salaryMax);

    if (!title.trim() || !description.trim() || !city.trim() || !salaryMin || !salaryMax) {
      setError('请填写所有必填项');
      return;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
      setError('薪资必须为正数');
      return;
    }
    if (min > max) {
      setError('最低薪资不能高于最高薪资');
      return;
    }

    setSubmitting(true);
    try {
      const jobId = await companyApi.createJob({
        title: title.trim(),
        location: { city: city.trim() },
        salaryRange: { min, max, unit: salaryUnit },
        description: description.trim(),
      });
      await companyApi.publishJob(jobId);
      router.push('/enterprise/jobs?created=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建岗位失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="新增岗位"
        description="填写岗位信息并直接发布到招聘市场"
        action={<a className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm" href="/enterprise/jobs">返回职位管理</a>}
      />

      <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-5">
        <label className="flex flex-col gap-2 text-sm text-on-surface">
          职位名称
          <input className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="flex flex-col gap-2 text-sm text-on-surface">
          城市
          <input className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm text-on-surface">
            最低薪资
            <input className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-on-surface">
            最高薪资
            <input className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-on-surface">
          职位描述
          <textarea className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high min-h-28" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        {error && <div className="rounded-lg bg-error-container text-error px-4 py-3 text-sm">{error}</div>}

        <div className="pt-2">
          <button
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium disabled:opacity-60"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '创建并发布'}
          </button>
        </div>
      </div>
    </EnterpriseContent>
  );
}
