'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Download, AlertCircle, Network, CheckCircle2 } from 'lucide-react';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api/admin';

interface Company {
  id: number;
  name: string;
  avatarUrl: string | null;
  code: string;
  industry: string | null;
  size: string | null;
  address: string | null;
  contact: string | null;
  phone: string | null;
  licenseUrl: string | null;
  applyDate: string;
  status: '待审核' | '已通过' | '已拒绝';
  rejectReason: string | null;
  initial: string;
}

const tabs = ['全部', '待审核', '已通过', '已拒绝'] as const;

type ReviewTab = (typeof tabs)[number];
type CompanyAuthItem = Awaited<ReturnType<typeof adminApi.getCompanyAuthList>>['list'][number];
type SummaryCard = {
  label: string;
  value: string;
  trend?: string | null;
  icon: typeof Network;
  color: string;
  bg: string;
  alert?: boolean;
};

const statusToApi: Record<Exclude<ReviewTab, '全部'>, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
  待审核: 'PENDING',
  已通过: 'APPROVED',
  已拒绝: 'REJECTED',
};

function mapCompany(item: CompanyAuthItem): Company {
  const status = item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已拒绝' : '待审核';
  return {
    id: item.id,
    name: item.companyName,
    avatarUrl: item.avatarUrl ?? null,
    code: item.unifiedSocialCreditCode,
    industry: item.industry ?? null,
    size: item.scale ?? null,
    address: item.address ?? null,
    contact: item.contact ?? item.legalPerson ?? null,
    phone: item.phone ?? null,
    licenseUrl: item.businessLicenseUrl ?? null,
    applyDate: item.submittedAt ?? '-',
    status,
    rejectReason: item.rejectReason ?? null,
    initial: (item.companyName || '?').slice(0, 1).toUpperCase(),
  };
}

function CompanyAvatar({ company }: { company: Company }) {
  const [broken, setBroken] = useState(false);
  if (company.avatarUrl && !broken) {
    return (
      <img
        src={company.avatarUrl}
        alt={`${company.name} 头像`}
        className="h-10 w-10 rounded-lg border border-outline-variant/30 object-cover dark:border-slate-700"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface font-bold text-primary dark:border-slate-700 dark:bg-slate-800">
      {company.initial}
    </div>
  );
}

export default function AdminEnterpriseReviewPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('全部');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedTodayCount, setApprovedTodayCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  const queryStatus = useMemo(() => {
    if (activeTab === '全部') return undefined;
    return statusToApi[activeTab];
  }, [activeTab]);

  const loadData = async () => {
    const [current, pending, approved, rejected] = await Promise.all([
      adminApi.getCompanyAuthList({ status: queryStatus, keyword: keyword || undefined, page, pageSize }),
      adminApi.getCompanyAuthList({ status: 'PENDING', page: 1, pageSize: 1 }),
      adminApi.getCompanyAuthList({ status: 'APPROVED', page: 1, pageSize: 1000 }),
      adminApi.getCompanyAuthList({ status: 'REJECTED', page: 1, pageSize: 1 }),
    ]);

    setList(current.list.map(mapCompany));
    setTotal(current.total);
    setPageSize(current.pageSize);
    setPendingCount(pending.total);
    setRejectedCount(rejected.total);

    const today = new Date().toISOString().slice(0, 10);
    setApprovedTodayCount(approved.list.filter((item) => (item.reviewedAt ?? '').slice(0, 10) === today).length);
  };

  useEffect(() => {
    void loadData();
  }, [queryStatus, keyword, page]);

  const handleApprove = async (id: number) => {
    await adminApi.updateCompanyAuth(id, { status: 'APPROVED' });
    await loadData();
  };

  const handleReject = async (id: number) => {
    await adminApi.updateCompanyAuth(id, { status: 'REJECTED', rejectReason: '管理员审核拒绝' });
    await loadData();
  };

  return (
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
          {([
            { label: '待审核企业', value: String(pendingCount), trend: null, icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '今日已处理', value: String(approvedTodayCount), icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary-fixed' },
            { label: '高风险拦截', value: String(rejectedCount), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', alert: true },
          ] as SummaryCard[]).map((item, index) => (
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
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={cn(
                  'border-b-2 pb-1 text-sm font-medium transition-all',
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface dark:hover:text-slate-200'
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
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
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
          data={list}
          pagination={{
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / Math.max(pageSize, 1))),
            totalItems: total,
            pageSize: Math.max(pageSize, 1),
            onPageChange: (nextPage) => setPage(nextPage),
          }}
          columns={[
            {
              header: '企业名称',
              accessor: (company) => (
                <div className="flex items-center gap-3">
                  <CompanyAvatar company={company} />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{company.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase text-outline">{company.code}</p>
                    <p className="mt-1 text-xs text-outline">{company.address ?? '-'}</p>
                  </div>
                </div>
              ),
              className: 'w-[36%] normal-case tracking-normal text-[13px] font-semibold text-slate-600',
            },
            { header: '所属行业', accessor: (company) => company.industry ?? '-', className: 'normal-case tracking-normal text-[13px] font-semibold text-slate-600' },
            { header: '人员规模', accessor: (company) => company.size ?? '-', className: 'normal-case tracking-normal text-[13px] font-semibold text-slate-600' },
            { header: '申请时间', accessor: (company) => <span className="font-display text-sm text-outline">{company.applyDate}</span>, className: 'normal-case tracking-normal text-[13px] font-semibold text-slate-600' },
            {
              header: '状态',
              className: 'normal-case tracking-normal text-[13px] font-semibold text-slate-600',
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
              className: 'text-right normal-case tracking-normal text-[13px] font-semibold text-slate-600',
              accessor: (company) => (
                <div className="flex justify-end gap-3">
                  <button className="text-xs font-bold text-primary hover:underline" onClick={() => setDetailCompany(company)}>详情</button>
                  {company.status === '待审核' ? (
                    <>
                      <button className="text-xs font-bold text-secondary hover:underline" onClick={() => void handleApprove(company.id)}>
                        通过
                      </button>
                      <button className="text-xs font-bold text-rose-600 hover:underline" onClick={() => void handleReject(company.id)}>
                        拒绝
                      </button>
                    </>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
        {detailCompany ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface">企业详情</h3>
                <button className="text-sm font-semibold text-outline hover:text-on-surface" onClick={() => setDetailCompany(null)}>关闭</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-on-surface">
                <p><span className="text-outline">企业名称：</span>{detailCompany.name}</p>
                <p><span className="text-outline">统一社会信用代码：</span>{detailCompany.code}</p>
                <p><span className="text-outline">所属行业：</span>{detailCompany.industry ?? '-'}</p>
                <p><span className="text-outline">人员规模：</span>{detailCompany.size ?? '-'}</p>
                <p><span className="text-outline">联系人：</span>{detailCompany.contact ?? '-'}</p>
                <p><span className="text-outline">联系电话：</span>{detailCompany.phone ?? '-'}</p>
                <p className="col-span-2"><span className="text-outline">公司地址：</span>{detailCompany.address ?? '-'}</p>
                <p className="col-span-2"><span className="text-outline">营业执照地址：</span>{detailCompany.licenseUrl ?? '-'}</p>
                <p><span className="text-outline">申请时间：</span>{detailCompany.applyDate}</p>
                <p><span className="text-outline">当前状态：</span>{detailCompany.status}</p>
                <p className="col-span-2"><span className="text-outline">拒绝原因：</span>{detailCompany.rejectReason ?? '-'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
  );
}
