'use client';

import React, { useMemo, useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { Clock, ChevronRight, Undo2 } from 'lucide-react';
import { personApi, type Application } from '@/lib/api/person';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

const tabs = ['全部', '待处理', '已查看', '面试邀请', '不合适'] as const;

type TabType = (typeof tabs)[number];

function mapStatusToTab(status: string): TabType {
  if (status === 'PENDING') {
    return '待处理';
  }
  if (status === 'VIEWED') {
    return '已查看';
  }
  if (status === 'INTERVIEW_INVITED') {
    return '面试邀请';
  }
  return '不合适';
}

function statusBadge(status: string) {
  if (status === 'INTERVIEW_INVITED') {
    return { text: '面试邀请', className: 'bg-primary/10 text-primary' };
  }
  if (status === 'VIEWED') {
    return { text: '已查看', className: 'bg-primary/10 text-primary' };
  }
  if (status === 'PENDING') {
    return { text: '待处理', className: 'bg-surface-mid text-on-surface-variant' };
  }
  if (status === 'WITHDRAWN') {
    return { text: '已撤回', className: 'bg-surface-high opacity-70 text-outline' };
  }
  if (status === 'ACCEPTED') {
    return { text: '已接受', className: 'bg-green-500/10 text-green-600' };
  }
  return { text: '不合适', className: 'bg-surface-high opacity-60 text-outline' };
}

function formatAppliedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function ApplicationRecords() {
  const [activeTab, setActiveTab] = useState<TabType>('全部');
  const [list, setList] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const loadApplications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await personApi.getApplications();
      setList(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载投递记录失败';
      setError(errorMessage || '加载投递记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const filteredList = useMemo(() => {
    if (activeTab === '全部') {
      return list;
    }
    return list.filter((item) => mapStatusToTab(item.status) === activeTab);
  }, [activeTab, list]);

  const handleWithdraw = async (applicationId: number) => {
    setWithdrawingId(applicationId);
    setError(null);
    setMessage(null);
    try {
      await personApi.withdrawApplication(applicationId);
      setMessage('已撤回该投递');
      await loadApplications();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '撤回失败';
      setError(errorMessage || '撤回失败');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="投递记录" />

      <nav className="bg-surface-lowest/90 backdrop-blur-md sticky top-16 md:top-32 z-40 flex overflow-x-auto px-5 md:px-12 gap-8 pt-4 hide-scrollbar border-b border-surface-mid">
        <div className="max-w-7xl mx-auto w-full flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-body-md md:text-lg font-bold pb-4 md:pb-6 whitespace-nowrap px-1 transition-all border-b-2 ${
                activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-5 pb-12 md:px-8 md:py-12">
        <div className="flex gap-6 lg:gap-8">
          <UserWorkbenchSidebar />
          <section className="flex-1">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
            ) : null}
            {message ? (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
            ) : null}
            {loading ? <div className="text-sm text-on-surface-variant">投递记录加载中...</div> : null}

            <div className="divide-y divide-surface-mid overflow-hidden rounded-2xl border border-surface-mid bg-surface-lowest">
              {filteredList.map((app) => {
                const badge = statusBadge(app.status);
                const pending = app.status === 'PENDING';
                const isWithdrawing = withdrawingId === app.id;

                return (
                  <article
                    key={app.id}
                    data-testid="application-row"
                    className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-low md:px-6 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                        {app.jobTitle ?? `职位#${app.jobId}`}
                      </h2>
                      <p className="mt-1 text-sm text-on-surface-variant opacity-80">{app.companyName ?? '企业未知'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">匹配度 {app.matchScore ?? '-'}%</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>

                    <span className="flex items-center gap-2 text-[10px] text-outline md:text-xs">
                      <Clock size={14} className="text-primary/60" />
                      投递时间: {formatAppliedAt(app.appliedAt)}
                    </span>

                    <div className="flex justify-start lg:justify-end">
                      {pending ? (
                        <button
                          aria-label={`撤回-${app.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleWithdraw(app.id);
                          }}
                          disabled={isWithdrawing}
                          className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-error disabled:opacity-60"
                        >
                          <Undo2 size={14} />
                          {isWithdrawing ? '撤回中...' : '撤回'}
                        </button>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-low transition-all group-hover:bg-primary group-hover:text-white md:h-10 md:w-10">
                          <ChevronRight size={18} />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
