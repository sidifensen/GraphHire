import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getUserList, updateUserStatus } = vi.hoisted(() => ({
  getUserList: vi.fn().mockResolvedValue({
    list: [
      {
        id: 2,
        username: 'test_user',
        realName: '测试用户',
        email: 'test@example.com',
        phone: '13900000000',
        type: 'PERSON',
        status: 'ACTIVE',
        createdAt: '2026-04-24 10:00:00',
        lastLoginAt: '2026-04-24 12:00:00',
        avatarUrl: '',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  updateUserStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getUserList,
    updateUserStatus,
  },
}));

import AdminUsersPage from '@/app/admin/users/page';

describe('AdminUsersPage', () => {
  it('loads users from backend and updates status', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(getUserList).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('测试用户')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '禁用' }));

    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalledWith(2, 'DISABLED');
    });
  });
});
