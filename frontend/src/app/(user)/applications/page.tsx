'use client';

import React, { useMemo, useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { Clock, ChevronRight, Undo2 } from 'lucide-react';
import { personApi, type Application } from '@/lib/api/person';

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

      <main className="p-5 md:py-12 md:px-8 max-w-7xl mx-auto w-full pb-12">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
        ) : null}
        {loading ? <div className="text-sm text-on-surface-variant">投递记录加载中...</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredList.map((app) => {
            const badge = statusBadge(app.status);
            const pending = app.status === 'PENDING';
            const isWithdrawing = withdrawingId === app.id;

            return (
              <article
                key={app.id}
                className="bg-surface-lowest rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border-l-4 cursor-pointer hover:bg-surface-low transition-all group hover:shadow-lg hover:-translate-y-1 border-surface-mid"
              >
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {app.jobTitle ?? `职位#${app.jobId}`}
                  </h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ml-2 ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-6 md:mb-8 text-sm md:text-base">
                  <span className="text-on-surface-variant opacity-80">{app.companyName ?? '企业未知'}</span>
                  <span className="text-primary font-bold">匹配度 {app.matchScore ?? '-'}%</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-surface-low gap-3">
                  <span className="text-[10px] md:text-xs text-outline flex items-center gap-2">
                    <Clock size={14} className="text-primary/60" />
                    投递时间: {formatAppliedAt(app.appliedAt)}
                  </span>

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
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-surface-low group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
