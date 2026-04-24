'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { companyApi } from '@/lib/api/company';
import { formatJobStatus } from '@/lib/mappers/enterpriseMapper';
import type { EnterpriseJobDetail } from '@/lib/types/enterprise';

function formatDetailSalary(job?: EnterpriseJobDetail | null) {
  if (!job?.salaryRange || job.salaryRange.min == null || job.salaryRange.max == null) {
    return '薪资待定';
  }
  return `${Math.round(job.salaryRange.min / 1000)}k-${Math.round(job.salaryRange.max / 1000)}k`;
}

export default function EnterpriseJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<EnterpriseJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = useMemo(() => Number(params?.id), [params?.id]);

  const loadDetail = async () => {
    if (!Number.isFinite(jobId) || jobId <= 0) {
      setError('无效的职位参数');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const detail = await companyApi.getJobDetail(jobId);
      setJob(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : '职位详情加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [jobId]);

  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title={job?.title || '职位详情'}
        description="查看职位信息与招聘指标"
        action={
          Number.isFinite(jobId) && jobId > 0 ? (
            <a className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary-container/20" href={`/enterprise/recommendations?jobId=${jobId}`}>
              查看匹配候选人
            </a>
          ) : null
        }
      />

      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">职位详情加载中...</div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          {error !== '无效的职位参数' ? (
            <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadDetail()}>重试</button>
          ) : null}
        </div>
      ) : !job ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">未找到职位详情</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl bg-surface-container-lowest p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold font-headline text-on-surface">{job.title}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-xs font-medium">{formatJobStatus(job.status)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-on-surface-variant">部门</div>
                <div className="font-medium text-on-surface">{job.department || '未填写'}</div>
              </div>
              <div>
                <div className="text-on-surface-variant">城市</div>
                <div className="font-medium text-on-surface">{job.location?.city || '未填写'}</div>
              </div>
              <div>
                <div className="text-on-surface-variant">招聘人数</div>
                <div className="font-medium text-on-surface">{job.headcount ?? '未填写'}</div>
              </div>
              <div>
                <div className="text-on-surface-variant">薪资范围</div>
                <div className="font-medium text-primary">{formatDetailSalary(job)}</div>
              </div>
              <div>
                <div className="text-on-surface-variant">发布时间</div>
                <div className="font-medium text-on-surface">{job.publishedAt || '未发布'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6">
            <h4 className="text-lg font-semibold font-headline mb-3">职位描述</h4>
            <p className="text-sm text-on-surface-variant whitespace-pre-line">{job.description || '暂无职位描述'}</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6">
            <h4 className="text-lg font-semibold font-headline mb-3">技能要求</h4>
            <div className="flex flex-wrap gap-2">
              {(job.skills ?? job.requiredSkills ?? []).length > 0 ? (
                (job.skills ?? job.requiredSkills ?? []).map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-surface-container text-sm text-on-surface">{skill}</span>
                ))
              ) : (
                <span className="text-sm text-on-surface-variant">暂无技能要求</span>
              )}
            </div>
          </div>
        </div>
      )}
    </EnterpriseContent>
  );
}