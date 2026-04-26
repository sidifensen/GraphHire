'use client';

import { useEffect, useState } from 'react';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import { companyApi } from '@/lib/api/company';
import type { EnterpriseDashboard } from '@/lib/types/enterprise';
import { dashboardStatusText } from '@/lib/mappers/enterpriseMapper';

export default function EnterpriseDashboardPage() {
  const [data, setData] = useState<EnterpriseDashboard | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, companyInfo] = await Promise.all([
        companyApi.getDashboard(),
        companyApi.getInfo().catch(() => null),
      ]);
      setData(dashboard);
      setCompanyName(companyInfo?.name ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '企业仪表盘加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <EnterpriseContent>
      <div className="rounded-xl bg-surface-container-lowest p-6">
        <p className="text-sm text-on-surface-variant">当前企业</p>
        <h2 className="mt-2 text-2xl font-bold font-headline text-on-surface">{companyName || '未获取到企业名称'}</h2>
      </div>

      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">企业仪表盘加载中...</div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadDashboard()}>重试</button>
        </div>
      ) : !data ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">暂无企业仪表盘数据</div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="待处理投递" value={data.pendingApplicationCount} highlight="真实数据" />
              <StatCard title="新匹配候选人" value={data.newMatchCandidateCount} highlight="自动推荐" />
              <StatCard title="在招职位" value={data.activeJobCount} highlight="已发布" />
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg">职位浏览与转化趋势</h3>
                <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">近 7 天</span>
              </div>
              <div className="rounded-xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
                当前后端已接通真实仪表盘数据，趋势统计后续可在此基础上继续扩展。
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-headline font-semibold text-xl mb-2">启动新招聘</h3>
              <p className="text-primary-fixed-dim text-sm mb-6">使用AI图谱技术，一键生成岗位描述并精准匹配人才池。</p>
              <a className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-medium" href="/enterprise/jobs">
                <span className="material-symbols-outlined text-sm">add</span>
                发布新职位
              </a>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-headline font-semibold text-lg">快捷操作</h3>
              <a className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low" href="/enterprise/recommendations">
                <span className="text-sm font-medium text-on-surface">查看智能推荐</span>
                <span className="material-symbols-outlined text-tertiary">chevron_right</span>
              </a>
              <a className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low" href="/enterprise/employees">
                <span className="text-sm font-medium text-on-surface">员工管理</span>
                <span className="material-symbols-outlined text-tertiary">chevron_right</span>
              </a>
            </div>
          </div>

          <div className="col-span-12">
            <div className="bg-surface-container-lowest rounded-xl p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg">近期发布职位</h3>
                <a className="text-primary text-sm font-medium hover:underline" href="/enterprise/jobs">查看全部</a>
              </div>
              {data.recentJobs.length === 0 ? (
                <div className="text-sm text-on-surface-variant">暂无近期职位</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-on-surface-variant">
                        <th className="pb-4 font-medium">职位名称</th>
                        <th className="pb-4 font-medium">发布部门</th>
                        <th className="pb-4 font-medium text-right">投递数</th>
                        <th className="pb-4 font-medium text-right">AI 匹配候选人</th>
                        <th className="pb-4 font-medium text-right">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentJobs.map((job) => (
                        <tr key={job.id} className="border-t border-surface-container-high">
                          <td className="py-4 font-medium text-on-surface">{job.title}</td>
                          <td className="py-4 text-on-surface-variant">{job.department || '未填写部门'}</td>
                          <td className="py-4 text-right">{job.applyCount}</td>
                          <td className="py-4 text-right">{job.matchCount}</td>
                          <td className="py-4 text-right">{dashboardStatusText(job)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </EnterpriseContent>
  );
}

function StatCard({ title, value, highlight }: { title: string; value: number; highlight: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6">
      <p className="text-sm text-on-surface-variant font-medium mb-2">{title}</p>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-headline font-bold text-primary">{value}</span>
        <span className="text-xs text-secondary-container mb-1">{highlight}</span>
      </div>
    </div>
  );
}
