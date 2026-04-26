import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import NotificationsPage from '@/app/(user)/notifications/page';

const getList = vi.fn();
const getUnreadCount = vi.fn();
const markAllAsRead = vi.fn();
const markAsRead = vi.fn();
const authStoreMock = vi.fn();

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/notification', () => ({
  notificationApi: {
    getList: (...args: unknown[]) => getList(...args),
    getUnreadCount: (...args: unknown[]) => getUnreadCount(...args),
    markAllAsRead: (...args: unknown[]) => markAllAsRead(...args),
    markAsRead: (...args: unknown[]) => markAsRead(...args),
  },
}));

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'u', type: 'PERSON' } }));
    getList.mockResolvedValue([
      { id: 1, type: 'JOB_RECOMMENDATION', title: '真实职位推荐', content: '请查看真实职位', isRead: false, createdAt: '2026-04-21T10:00:00', referenceId: 9 },
      { id: 2, type: 'RESUME_PARSED', title: '简历解析完成', content: '图谱已更新', isRead: true, createdAt: '2026-04-21T09:00:00' },
    ]);
    getUnreadCount.mockResolvedValue(1);
    markAllAsRead.mockResolvedValue(undefined);
    markAsRead.mockResolvedValue(undefined);
  });

  it('loads and renders real notifications', async () => {
    render(<NotificationsPage />);
    await screen.findByText('真实职位推荐');
    expect(getList).toHaveBeenCalledWith(1);
    expect(screen.getByText('您有 1 条未读消息，请注意查收。')).toBeDefined();
  });

  it('marks all notifications as read', async () => {
    render(<NotificationsPage />);
    await screen.findByText('真实职位推荐');
    screen.getByText('全部标记已读').click();
    await waitFor(() => expect(markAllAsRead).toHaveBeenCalledWith(1));
  });

  it('moves category motion indicator when switching category', async () => {
    render(<NotificationsPage />);
    await screen.findByText('真实职位推荐');

    const allButton = screen.getByRole('button', { name: '全部' });
    expect(within(allButton).getByTestId('notification-category-indicator')).toBeDefined();

    const resumeButton = screen.getByRole('button', { name: '简历解析' });
    resumeButton.click();

    await waitFor(() => {
      expect(within(resumeButton).getByTestId('notification-category-indicator')).toBeDefined();
    });
  });

  it('renders login hint when user missing', async () => {
    authStoreMock.mockImplementation((selector) => selector({ user: null }));
    render(<NotificationsPage />);
    await screen.findByText('请先登录后查看通知。');
  });
});