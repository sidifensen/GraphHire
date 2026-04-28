'use client';

import { useEffect, useMemo, useState } from 'react';
import { authStore } from '@/lib/stores/auth-store';
import { personApi, type Application } from '@/lib/api/person';

const PAGE_SIZE = 10;

type FilterStatus = 'ALL' | Application['status'];

// 顶部筛选标签，和后端状态枚举保持一致，便于前端直接过滤。
const FILTERS: Array<{ key: FilterStatus; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待处理' },
  { key: 'VIEWED', label: '已查看' },
  { key: 'INTERVIEW_INVITED', label: '面试邀请' },
  { key: 'ACCEPTED', label: '已接受' },
  { key: 'REJECTED', label: '已拒绝' },
  { key: 'WITHDRAWN', label: '已撤回' },
];

// 将状态码映射为中文文案，避免在 JSX 中散落判断逻辑。
function getStatusText(status: Application['status']) {
  switch (status) {
    case 'PENDING':
      return '待处理';
    case 'VIEWED':
      return '已查看';
    case 'INTERVIEW_INVITED':
      return '面试邀请';
    case 'ACCEPTED':
      return '已接受';
    case 'REJECTED':
      return '已拒绝';
    case 'WITHDRAWN':
      return '已撤回';
    default:
      return status;
  }
}

// 统一处理投递时间展示；异常时间值回退为 "-" 防止页面报错。
function formatAppliedTime(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return '-';
  }
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
}

// 兼容数组和分页对象两种返回结构，保证页面渲染始终拿到数组。
function normalizeList(data: unknown): Application[] {
  if (Array.isArray(data)) {
    return data as Application[];
  }
  if (data && typeof data === 'object' && 'list' in data && Array.isArray((data as { list?: unknown }).list)) {
    return (data as { list: Application[] }).list;
  }
  return [];
}

export default function ApplicationsPage() {
  const user = authStore((state) => state.user);
  const [list, setList] = useState<Application[]>([]);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    // 未登录时直接清空列表，避免触发无效请求。
    if (!user?.id) {
      setLoading(false);
      setList([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await personApi.getApplications();
      setList(normalizeList(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : '投递记录加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 用户身份切换后重新加载数据，保持列表与当前账号一致。
    void loadApplications();
  }, [user?.id]);

  const filteredList = useMemo(() => {
    if (activeStatus === 'ALL') {
      return list;
    }
    return list.filter((item) => item.status === activeStatus);
  }, [activeStatus, list]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const currentList = useMemo(() => {
    // 前端分页：按当前页截取展示数据。
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredList]);

  if (!user?.id && !loading) {
    return <div className="py-10 text-on-surface-variant">请先登录后查看投递记录。</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">投递记录</h1>
        <p className="text-sm text-on-surface-variant">查看你的投递进度与反馈状态</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeStatus === filter.key ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
            }`}
            onClick={() => {
              setActiveStatus(filter.key);
              setPage(1);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">投递记录加载中...</div>
      ) : error ? (
        <div className="py-16 text-center flex flex-col items-center gap-4">
          <p className="text-error">{error}</p>
          <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadApplications()}>重试</button>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-16 text-center text-on-surface-variant">暂无投递记录</div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {currentList.map((item) => (
              <article key={item.id} className="rounded-xl border border-surface-variant bg-surface-container-lowest p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-on-surface">{item.jobTitle || '-'}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">{item.companyName || '-'}</p>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-surface-container text-on-surface">
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-on-surface-variant">
                  <p>投递时间：{formatAppliedTime(item.appliedAt)}</p>
                  <p>匹配度：{item.matchScore == null ? '-' : `${item.matchScore}%`}</p>
                </div>
              </article>
            ))}
          </div>

          {filteredList.length > PAGE_SIZE ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNo = idx + 1;
                return (
                  <button
                    key={pageNo}
                    className={`w-9 h-9 rounded-md text-sm ${
                      pageNo === currentPage ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                    }`}
                    onClick={() => setPage(pageNo)}
                  >
                    {pageNo}
                  </button>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
