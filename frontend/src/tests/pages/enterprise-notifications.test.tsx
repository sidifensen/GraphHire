import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPage from '@/app/enterprise/notifications/page';
import { notificationApi } from '@/lib/api/notification';

vi.mock('@/lib/api/notification', () => ({
  notificationApi: {
    getMyList: vi.fn(),
    getMyByType: vi.fn(),
    getMyUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllMyAsRead: vi.fn(),
  },
}));

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(notificationApi.getMyUnreadCount).mockResolvedValue(2);
    vi.mocked(notificationApi.getMyList).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        type: 'CANDIDATE_RECOMMENDATION',
        title: '推荐了高匹配候选人',
        content: '系统为您匹配到了新的候选人',
        isRead: false,
        createdAt: '2026-04-21T10:00:00',
      },
    ]);
    vi.mocked(notificationApi.getMyByType).mockResolvedValue([
      {
        id: 2,
        userId: 1,
        type: 'SYSTEM_NOTIFICATION',
        title: '系统升级公告',
        content: '系统已完成升级',
        isRead: true,
        createdAt: '2026-04-21T09:00:00',
      },
    ]);
    vi.mocked(notificationApi.markAsRead).mockResolvedValue();
    vi.mocked(notificationApi.markAllMyAsRead).mockResolvedValue();
  });

  test('渲染真实通知列表', async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText('推荐了高匹配候选人')).toBeInTheDocument();
    expect(screen.getByText('当前共有 2 条未读通知')).toBeInTheDocument();
    expect(screen.getByText('当前列表未读 1 条')).toBeInTheDocument();
  });

  test('支持按类型筛选', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await screen.findByText('推荐了高匹配候选人');
    await user.click(screen.getByRole('button', { name: '系统公告' }));

    await waitFor(() => {
      expect(notificationApi.getMyByType).toHaveBeenCalledWith('SYSTEM_NOTIFICATION');
    });
    expect(await screen.findByText('系统升级公告')).toBeInTheDocument();
  });

  test('支持标记单条已读和全部已读', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await screen.findByText('推荐了高匹配候选人');
    await user.click(screen.getByRole('button', { name: /^标记已读/ }));

    await waitFor(() => {
      expect(notificationApi.markAsRead).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText('通知已标记为已读')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /全部标记已读/ }));
    await waitFor(() => {
      expect(notificationApi.markAllMyAsRead).toHaveBeenCalled();
    });
    expect(await screen.findByText('全部通知已标记为已读')).toBeInTheDocument();
  });

  test('加载失败后可以重试', async () => {
    vi.mocked(notificationApi.getMyList)
      .mockRejectedValueOnce(new Error('notification failed'))
      .mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<NotificationsPage />);

    expect(await screen.findByText('notification failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试' }));
    expect(await screen.findByText('当前筛选条件下暂无通知。')).toBeInTheDocument();
  });
});
