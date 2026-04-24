'use client';

import { Search, ChevronDown, Download, AlertCircle, Network, CheckCircle2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  size: string;
  applyDate: string;
  status: '待审核' | '已通过' | '已拒绝';
  initial: string;
}

const mockCompanies: Company[] = [
  { id: '1', name: '腾讯科技（深圳）有限公司', code: '9144030071526726XG', industry: '互联网/IT', size: '10000人以上', applyDate: '2023-10-24 14:30', status: '待审核', initial: 'T' },
  { id: '2', name: '阿里巴巴（中国）网络技术有限公司', code: '91330100716105852F', industry: '电子商务', size: '10000人以上', applyDate: '2023-10-23 09:15', status: '已通过', initial: 'A' },
  { id: '3', name: '星火创新科技有限公司', code: '91110108MA01XXXXX', industry: '人工智能', size: '100-499人', applyDate: '2023-10-24 16:45', status: '待审核', initial: 'X' },
];

export default function AdminEnterpriseReviewPage() {
  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">企业审核</h2>
            <p className="mt-1 text-sm text-outline">管理和审批入驻企业资质与账号信息</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl dark:hover:bg-white/5">
            <Download size={16} />
            导出报表
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: '待审核企业', value: '142', trend: '+12%', icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '今日已处理', value: '56', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary-fixed' },
            { label: '高风险拦截', value: '8', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', alert: true },
          ].map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    item.bg,
                    item.color,
                    item.bg.includes('bg-primary-fixed') && 'dark:bg-primary/20',
                    item.bg.includes('bg-blue-50') && 'dark:bg-blue-900/20',
                    item.bg.includes('bg-rose-50') && 'dark:bg-rose-900/20'
                  )}
                >
                  <item.icon size={20} />
                </div>
                {item.trend ? <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">{item.trend}</span> : null}
                {item.alert ? (
                  <span className="flex items-center gap-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                    <AlertCircle size={10} />
                    需关注
                  </span>
                ) : null}
              </div>
              <p className="mb-1 text-xs font-medium text-outline">{item.label}</p>
              <h3 className="font-display text-2xl font-bold">{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
          <div className="flex gap-6">
            {['全部', '待审核', '已通过', '已拒绝'].map((tab, index) => (
              <button
                key={tab}
                className={cn(
                  'border-b-2 pb-1 text-sm font-medium transition-all',
                  index === 0 ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface dark:hover:text-slate-200'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                placeholder="搜索企业..."
                className="w-64 rounded-lg border border-outline-variant/30 bg-surface py-1.5 pl-9 pr-4 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-semibold text-on-surface transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              更多筛选
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <AdminDataTable
          data={mockCompanies}
          pagination={{ currentPage: 1, totalPages: 5, totalItems: 142 }}
          columns={[
            {
              header: '企业名称',
              accessor: (company) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface font-bold text-primary dark:border-slate-700 dark:bg-slate-800">
                    {company.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{company.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase text-outline">{company.code}</p>
                  </div>
                </div>
              ),
              className: 'w-[40%]',
            },
            { header: '所属行业', accessor: 'industry', className: 'text-sm text-outline' },
            { header: '人员规模', accessor: 'size', className: 'text-sm text-outline' },
            { header: '申请时间', accessor: (company) => <span className="font-display text-sm text-outline">{company.applyDate}</span> },
            {
              header: '状态',
              accessor: (company) => (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset',
                    company.status === '待审核'
                      ? 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-900/30'
                      : company.status === '已通过'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/30'
                        : 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-900/30'
                  )}
                >
                  {company.status}
                </span>
              ),
            },
            {
              header: '操作',
              className: 'text-right',
              accessor: (company) => (
                <div className="flex justify-end gap-3">
                  <button className="text-xs font-bold text-primary hover:underline">详情</button>
                  {company.status === '待审核' ? (
                    <>
                      <button className="text-xs font-bold text-secondary hover:underline">通过</button>
                      <button className="text-xs font-bold text-rose-600 hover:underline">拒绝</button>
                    </>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
