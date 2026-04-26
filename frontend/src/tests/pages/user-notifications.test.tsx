import { render, screen } from '@testing-library/react';
import NotificationsPage from '@/app/(user)/notifications/page';
import { notificationApi } from '@/lib/api/notification';

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: { user: { id: number } }) => unknown) => selector({ user: { id: 1 } }),
}));

vi.mock('@/lib/api/notification', () => ({
  notificationApi: {
    getList: vi.fn(),
    getUnreadCount: vi.fn(),
    markAllAsRead: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

describe('User Notifications Page', () => {
  test('将历史英文投递通知文案转换为中文展示', async () => {
    vi.mocked(notificationApi.getList).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        type: 'RESUME_SUBMITTED',
        title: 'Resume Submitted',
        content: 'Your resume has been submitted successfully for position: 运营专员（校招）',
        isRead: false,
        createdAt: '2026-04-25T16:12:32',
      },
    ]);
    vi.mocked(notificationApi.getUnreadCount).mockResolvedValue(1);

    render(<NotificationsPage />);

    expect(await screen.findByText('简历投递成功')).toBeInTheDocument();
    expect(screen.getByText('您的简历已成功投递至职位：运营专员（校招）')).toBeInTheDocument();
    expect(screen.queryByText('Resume Submitted')).not.toBeInTheDocument();
  });
});

