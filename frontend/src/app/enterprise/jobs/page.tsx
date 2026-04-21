'use client';

import { useEffect, useState } from 'react';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { companyApi } from '@/lib/api/company';
import { formatJobStatus, formatSalary } from '@/lib/mappers/enterpriseMapper';
import type { EnterpriseJobListItem } from '@/lib/types/enterprise';

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '草稿', value: 'DRAFT' },
  { label: '已关闭', value: 'CLOSED' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<EnterpriseJobListItem[]>([]);
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadJobs = async (nextStatus = status, nextKeyword = keyword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await companyApi.getJobList({ status: nextStatus || undefined, keyword: nextKeyword || undefined });
      setJobs(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '职位列表加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs(status, keyword);
  }, [status]);

  const handleSearch = async () => {
    await loadJobs(status, keyword);
  };

  const handleAction = async (action: 'publish' | 'close' | 'parse', jobId: number) => {
    setActionMessage(null);
    try {
      if (action === 'publish') await companyApi.publishJob(jobId);
      if (action === 'close') await companyApi.closeJob(jobId);
      if (action === 'parse') await companyApi.parseJob(jobId);
      setActionMessage(action === 'parse' ? '职位解析任务已触发' : '职位状态已更新');
      await loadJobs(status, keyword);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : '操作失败');
    }
  };

  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="职位管理"
        description="管理您的招聘需求与 AI 匹配进度"
        action={
          <a className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary-container/20" href="/enterprise/jobs">
            发布新职位
          </a>
        }
      />

      <div className="bg-surface-container-lowest rounded-xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {statusOptions.map((option) => (
            <button
              key={option.value || 'all'}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${status === option.value ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-variant text-on-surface-variant'}`}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            className="w-full md:w-64 pl-4 pr-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-outline"
            placeholder="搜索职位名称..."
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm" onClick={() => void handleSearch()}>搜索</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 items-center">
        <span className="text-sm font-medium text-on-surface-variant mr-2">批量操作:</span>
        <button className="px-3 py-1.5 rounded bg-surface-container-high text-outline text-sm font-medium cursor-not-allowed" disabled>批量下架</button>
        <button className="px-3 py-1.5 rounded bg-surface-container-high text-outline text-sm font-medium cursor-not-allowed" disabled>批量修改</button>
      </div>

      {actionMessage && <div className="mb-4 rounded-lg bg-surface-container p-4 text-sm text-on-surface">{actionMessage}</div>}
      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">职位列表加载中...</div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadJobs(status, keyword)}>重试</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">暂无职位数据</div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-surface-container-lowest rounded-xl p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <input className="rounded border-outline-variant text-primary w-4 h-4" type="checkbox" />
                    <h3 className="text-xl font-bold font-headline text-on-surface">{job.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-xs font-medium">{formatJobStatus(job.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                    <div>{job.department || '未分配部门'}</div>
                    <div className="font-medium text-primary">{formatSalary(job)}</div>
                    <div>{job.city || '城市待定'}</div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col">
                      <span className="text-on-surface-variant text-xs mb-1">曝光量</span>
                      <span className="font-bold text-on-surface font-headline">{job.viewCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-on-surface-variant text-xs mb-1">投递数</span>
                      <span className="font-bold text-on-surface font-headline">{job.applyCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-primary font-medium text-xs mb-1">AI 高匹配</span>
                      <span className="font-bold text-primary font-headline text-lg">{job.matchCount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-surface-container-high pt-4 md:pt-0 md:pl-6">
                  <a className="px-4 py-2 bg-primary-fixed text-on-primary-fixed text-sm font-medium rounded-lg text-center" href={`/enterprise/recommendations?jobId=${job.id}`}>匹配候选人</a>
                  <button className="px-4 py-2 bg-surface-container text-on-surface text-sm font-medium rounded-lg" onClick={() => void handleAction('parse', job.id)}>重新解析</button>
                  <div className="flex justify-end gap-2 pt-2">
                    {job.status === 'PUBLISHED' ? (
                      <button className="p-2 text-outline hover:text-error" title="暂停" onClick={() => void handleAction('close', job.id)}>
                        <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                      </button>
                    ) : (
                      <button className="p-2 text-outline hover:text-primary" title="发布" onClick={() => void handleAction('publish', job.id)}>
                        <span className="material-symbols-outlined text-[20px]">publish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </EnterpriseContent>
  );
}
