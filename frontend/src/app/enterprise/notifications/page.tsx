'use client';

import { useEffect, useMemo, useState } from 'react';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { notificationApi, type Notification } from '@/lib/api/notification';

const tabs = [
  { label: '全部', value: 'ALL' },
  { label: '新推荐', value: 'CANDIDATE_RECOMMENDATION' },
  { label: '简历投递', value: 'RESUME_SUBMITTED' },
  { label: '认证反馈', value: 'COMPANY_AUTH_RESULT' },
  { label: '系统公告', value: 'SYSTEM_NOTIFICATION' },
] as const;

export default function NotificationsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('ALL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getMyUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  const loadNotifications = async (nextTab = tab) => {
    setLoading(true);
    setError(null);
    try {
      const response = nextTab === 'ALL'
        ? await notificationApi.getMyList()
        : await notificationApi.getMyByType(nextTab);
      setNotifications(response);
      await loadUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : '通知列表加载失败');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(tab);
  }, [tab]);

  const handleMarkAsRead = async (id: number) => {
    setMessage(null);
    try {
      await notificationApi.markAsRead(id);
      setMessage('通知已标记为已读');
      await loadNotifications(tab);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '标记已读失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMessage(null);
    try {
      await notificationApi.markAllMyAsRead();
      setMessage('全部通知已标记为已读');
      await loadNotifications(tab);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '全部标记已读失败');
    }
  };

  const handleDeleteRead = async () => {
    setMessage(null);
    try {
      await notificationApi.deleteMyRead();
      setMessage('已清空已读通知');
      await loadNotifications(tab);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '清空已读失败');
    }
  };

  const unreadInCurrentTab = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  return (
    <EnterpriseContent>
      <EnterprisePageHeader title="通知中心" description={`当前共有 ${unreadCount} 条未读通知`} />

      <div className="flex justify-between items-end mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 bg-surface-container-highest p-1 rounded-lg flex-wrap">
          {tabs.map((item) => (
            <button
              key={item.value}
              className={`px-4 py-2 font-medium rounded text-sm transition-colors relative ${tab === item.value ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest/50'}`}
              onClick={() => setTab(item.value)}
            >
              {item.label}
              {item.value !== 'ALL' && unreadCount > 0 && tab !== item.value && item.value === 'CANDIDATE_RECOMMENDATION' ? (
                <span className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-error rounded-full"></span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-tertiary bg-surface-container-high hover:bg-surface-variant rounded-lg transition-colors" onClick={() => void handleMarkAllAsRead()}>
            <span className="material-symbols-outlined text-sm">done_all</span>
            全部标记已读
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-tertiary bg-surface-container-high hover:bg-surface-variant rounded-lg transition-colors" onClick={() => void handleDeleteRead()}>
            <span className="material-symbols-outlined text-sm">delete</span>
            清空已读
          </button>
        </div>
      </div>

      {message && <div className="mb-4 rounded-lg bg-surface-container p-4 text-sm text-on-surface">{message}</div>}

      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">通知加载中...</div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadNotifications(tab)}>重试</button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">当前筛选条件下暂无通知。</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-on-surface-variant">当前列表未读 {unreadInCurrentTab} 条</div>
          {notifications.map((item) => (
            <div key={item.id} className={`bg-surface-container-lowest rounded-xl p-6 flex gap-5 transition-shadow relative group ${item.isRead ? 'opacity-75 hover:opacity-100' : 'hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]'}`}>
              {!item.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container rounded-l-xl"></div>}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg(item.type)}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: item.isRead ? "'FILL' 0" : "'FILL' 1" }}>{iconName(item.type)}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="mt-1 text-xs text-on-surface-variant">{typeLabel(item.type)}</div>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">{formatDate(item.createdAt)}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.content}</p>
                <div className="mt-2 flex gap-3">
                  {!item.isRead && (
                    <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline" onClick={() => void handleMarkAsRead(item.id)}>
                      标记已读 <span className="material-symbols-outlined text-sm">done</span>
                    </button>
                  )}
                  {item.referenceId ? <span className="text-xs text-tertiary">关联 ID：{item.referenceId}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </EnterpriseContent>
  );
}

function typeLabel(type: Notification['type']) {
  switch (type) {
    case 'CANDIDATE_RECOMMENDATION':
      return '新推荐';
    case 'RESUME_SUBMITTED':
      return '简历投递';
    case 'COMPANY_AUTH_RESULT':
      return '认证反馈';
    case 'SYSTEM_NOTIFICATION':
      return '系统公告';
    case 'JOB_RECOMMENDATION':
      return '职位推荐';
    case 'INTERVIEW_INVITED':
      return '面试邀请';
    case 'RESUME_VIEWED':
      return '简历被查看';
    case 'RESUME_PARSED':
      return '简历解析';
    default:
      return type;
  }
}

function iconName(type: Notification['type']) {
  switch (type) {
    case 'CANDIDATE_RECOMMENDATION':
    case 'JOB_RECOMMENDATION':
      return 'psychology';
    case 'RESUME_SUBMITTED':
    case 'RESUME_PARSED':
      return 'description';
    case 'COMPANY_AUTH_RESULT':
      return 'verified';
    default:
      return 'campaign';
  }
}

function iconBg(type: Notification['type']) {
  switch (type) {
    case 'CANDIDATE_RECOMMENDATION':
    case 'JOB_RECOMMENDATION':
      return 'bg-primary-fixed text-primary';
    case 'RESUME_SUBMITTED':
    case 'RESUME_PARSED':
      return 'bg-surface-variant text-on-surface-variant';
    case 'COMPANY_AUTH_RESULT':
      return 'bg-tertiary/15 text-tertiary';
    default:
      return 'bg-secondary-fixed text-secondary';
  }
}

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
