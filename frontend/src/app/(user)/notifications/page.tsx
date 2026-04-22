'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { authStore } from '@/lib/stores/auth-store';
import { notificationApi, type Notification } from '@/lib/api/notification';

type NotificationCategory = 'all' | 'resume' | 'job' | 'application' | 'system';

function getCategory(type: Notification['type']): NotificationCategory {
  switch (type) {
    case 'RESUME_PARSED':
      return 'resume';
    case 'JOB_RECOMMENDATION':
      return 'job';
    case 'RESUME_VIEWED':
    case 'RESUME_SUBMITTED':
    case 'INTERVIEW_INVITED':
      return 'application';
    default:
      return 'system';
  }
}

function getTag(type: Notification['type']) {
  switch (type) {
    case 'RESUME_PARSED':
      return '简历解析';
    case 'JOB_RECOMMENDATION':
      return '职位推荐';
    case 'RESUME_VIEWED':
      return '简历被查看';
    case 'RESUME_SUBMITTED':
      return '投递反馈';
    case 'INTERVIEW_INVITED':
      return '面试邀请';
    default:
      return '系统通知';
  }
}

function getAction(notification: Notification) {
  switch (notification.type) {
    case 'RESUME_PARSED':
      return { label: '查看图谱', href: '/skill-graph' };
    case 'JOB_RECOMMENDATION':
      return notification.referenceId ? { label: '查看匹配', href: `/match/${notification.referenceId}` } : { label: '查看职位', href: '/jobs' };
    case 'RESUME_VIEWED':
    case 'RESUME_SUBMITTED':
    case 'INTERVIEW_INVITED':
      return { label: '查看详情', href: '/notifications' };
    default:
      return undefined;
  }
}

function formatTime(value: string | undefined) {
  if (!value) return '未知时间';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
}

function NotificationCard({ notification, onRead }: { notification: Notification; onRead: (id: number) => void }) {
  const isUnread = !notification.isRead;
  const action = getAction(notification);
  const tag = getTag(notification.type);

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] group relative overflow-hidden flex gap-5 items-start ${
        !isUnread ? 'opacity-75 hover:opacity-100' : ''
      }`}
    >
      {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container" />}

      <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 text-on-primary-fixed">
        <span className="material-symbols-outlined">notifications</span>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-1 gap-4">
          <h3 className={`font-headline text-lg flex items-center gap-2 ${isUnread ? 'font-bold' : 'font-semibold'} text-on-surface`}>
            {isUnread && <span className="w-2 h-2 bg-error rounded-full inline-block" />}
            {notification.title}
          </h3>
          <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatTime(notification.createdAt)}</span>
        </div>

        <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{notification.content}</p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 bg-surface-container text-on-surface text-xs rounded-full">{tag}</span>
          {action && (
            <a href={action.href} className="text-primary text-sm font-medium flex items-center gap-1">
              {action.label}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          )}
          {isUnread && (
            <button className="text-sm text-primary" onClick={() => onRead(notification.id)}>
              标记已读
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const user = authStore((state) => state.user);
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      setNotificationList([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const [list, unread] = await Promise.all([
        notificationApi.getList(user.id),
        notificationApi.getUnreadCount(user.id),
      ]);
      setNotificationList(list);
      setUnreadCount(unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : '通知加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [user?.id]);

  const filteredNotifications = useMemo(() => {
    return activeCategory === 'all'
      ? notificationList
      : notificationList.filter((item) => getCategory(item.type) === activeCategory);
  }, [activeCategory, notificationList]);

  const categories = [
    { key: 'all' as NotificationCategory, label: '全部' },
    { key: 'resume' as NotificationCategory, label: '简历解析' },
    { key: 'job' as NotificationCategory, label: '职位推荐' },
    { key: 'application' as NotificationCategory, label: '投递反馈' },
    { key: 'system' as NotificationCategory, label: '系统通知' },
  ];

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await notificationApi.markAllAsRead(user.id);
    setNotificationList((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: number) => {
    await notificationApi.markAsRead(id);
    setNotificationList((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  if (!user?.id && !loading) {
    return (
      <div className="flex-grow flex flex-col min-h-screen">
        <main className="flex-grow flex justify-center items-center text-on-surface-variant">请先登录后查看通知。</main>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      <main className="flex-grow flex justify-center max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-4">
        <div className="flex-1 max-w-4xl w-full flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">通知中心</h1>
              <p className="text-on-surface-variant">您有 {unreadCount} 条未读消息，请注意查收。</p>
            </div>

            {unreadCount > 0 && (
              <button onClick={() => void handleMarkAllRead()} className="text-primary hover:text-primary-container font-medium text-sm flex items-center gap-1 self-start sm:self-auto transition-colors">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                全部标记已读
              </button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`relative px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      data-testid="notification-category-indicator"
                      layoutId="notification-category-indicator"
                      className="absolute inset-0 rounded-full bg-primary-fixed"
                      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeCategory}
            data-testid="notification-list-panel"
            data-category={activeCategory}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            {loading ? (
              <div className="text-center py-16 text-on-surface-variant">通知加载中...</div>
            ) : error ? (
              <div className="text-center py-16 flex flex-col gap-4 items-center">
                <p className="text-error">{error}</p>
                <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadNotifications()}>重试</button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                  >
                    <NotificationCard notification={notification} onRead={handleMarkRead} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">notifications_off</span>
                <p className="text-on-surface-variant text-sm">暂无通知</p>
              </div>
            )}
          </motion.div>

          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="text-center py-8">
              <p className="text-on-surface-variant text-sm">没有更多通知了</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
