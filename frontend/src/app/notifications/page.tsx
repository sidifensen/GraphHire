'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type NotificationCategory = 'all' | 'resume' | 'job' | 'application';

interface Notification {
  id: string;
  type: 'ai-match' | 'resume-complete' | 'application-viewed';
  category: NotificationCategory;
  title: string;
  content: React.ReactNode;
  timestamp: string;
  isUnread: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  tags: string[];
  action?: {
    label: string;
    href: string;
  };
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'ai-match',
    category: 'job',
    title: 'AI 深度匹配推荐：高级前端工程师',
    content: (
      <>
        根据您最新的能力图谱，发现 <span className="font-medium text-primary">字节跳动</span> 的高级前端工程师职位与您的匹配度高达{' '}
        <span className="font-bold text-primary text-base">92%</span>。该职位高度契合您的 React 与 WebGL 技能栈。
      </>
    ),
    timestamp: '刚刚',
    isUnread: true,
    icon: 'smart_toy',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-on-primary-fixed',
    tags: ['职位推荐'],
    action: {
      label: '查看详情',
      href: '/jobs/1',
    },
  },
  {
    id: '2',
    type: 'resume-complete',
    category: 'resume',
    title: '简历解析完成，能力图谱已更新',
    content: (
      <>
        您的《张三_前端开发_5年经验.pdf》已由 AI 解析完毕。系统提取了 15 项核心技能，并已将您的认知图谱结构化。您可以前往检查并微调。
      </>
    ),
    timestamp: '2小时前',
    isUnread: true,
    icon: 'document_scanner',
    iconBg: 'bg-surface-container-high',
    iconColor: 'text-tertiary',
    tags: ['简历解析'],
    action: {
      label: '查看图谱',
      href: '/skill-graph',
    },
  },
  {
    id: '3',
    type: 'application-viewed',
    category: 'application',
    title: '投递状态更新：简历被查看',
    content: (
      <>
        您投递的 <span className="font-medium text-on-surface">腾讯科技 - 资深全栈开发</span> 岗位，HR 已查看您的简历图谱，请保持关注后续通知。
      </>
    ),
    timestamp: '昨天 14:30',
    isUnread: false,
    icon: 'assignment_turned_in',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-tertiary',
    tags: ['投递反馈'],
  },
];

const categories = [
  { key: 'all' as NotificationCategory, label: '全部', hasUnread: false },
  { key: 'resume' as NotificationCategory, label: '简历解析', hasUnread: false },
  { key: 'job' as NotificationCategory, label: '职位推荐', hasUnread: true },
  { key: 'application' as NotificationCategory, label: '投递反馈', hasUnread: false },
];

function NotificationCard({ notification }: { notification: Notification }) {
  const hasUnreadIndicator = notification.isUnread;

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] cursor-pointer group relative overflow-hidden flex gap-5 items-start ${
        !hasUnreadIndicator ? 'opacity-75 hover:opacity-100' : ''
      }`}
    >
      {/* Unread left border indicator */}
      {hasUnreadIndicator && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container" />
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-full ${notification.iconBg} flex items-center justify-center flex-shrink-0 ${notification.iconColor}`}
      >
        <span className="material-symbols-outlined">{notification.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3
            className={`font-headline text-lg flex items-center gap-2 ${
              hasUnreadIndicator ? 'font-bold' : 'font-semibold'
            } text-on-surface`}
          >
            {hasUnreadIndicator && <span className="w-2 h-2 bg-error rounded-full inline-block" />}
            {notification.title}
          </h3>
          <span className="text-xs text-on-surface-variant whitespace-nowrap ml-4">
            {notification.timestamp}
          </span>
        </div>

        <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
          {notification.content}
        </p>

        <div className="flex items-center gap-3">
          {notification.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-surface-container text-on-surface text-xs rounded-full"
            >
              {tag}
            </span>
          ))}

          {notification.action && (
            <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {notification.action.label}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter((n) => n.isUnread).length;

  const filteredNotifications =
    activeCategory === 'all'
      ? notificationList
      : notificationList.filter((n) => n.category === activeCategory);

  const handleMarkAllRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      <Header forceShowNotifications={true} />

      <main className="flex-grow flex justify-center max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8">
        <div className="flex-1 max-w-4xl w-full flex flex-col gap-8">
          {/* Page Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">通知中心</h1>
              <p className="text-on-surface-variant">
                您有 {unreadCount} 条未读消息，请注意查收。
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-primary hover:text-primary-container font-medium text-sm flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                全部标记已读
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cat.label}
                  {cat.hasUnread && <span className="w-2 h-2 bg-error rounded-full" />}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="flex flex-col gap-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">
                  notifications_off
                </span>
                <p className="text-on-surface-variant text-sm">暂无通知</p>
              </div>
            )}
          </div>

          {/* Load More / End State */}
          {filteredNotifications.length > 0 && (
            <div className="text-center py-8">
              <p className="text-on-surface-variant text-sm">没有更多通知了</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
