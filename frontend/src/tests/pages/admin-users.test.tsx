import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getUserList, getUserDetail, updateUserStatus } = vi.hoisted(() => ({
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
        avatarUrl: 'https://cdn.example.com/a.png',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  getUserDetail: vi.fn().mockResolvedValue({
    user: {
      id: 2,
      username: 'test_user',
      realName: '测试用户',
      email: 'test@example.com',
      phone: '13900000000',
      type: 'PERSON',
      status: 'ACTIVE',
      createdAt: '2026-04-24 10:00:00',
      lastLoginAt: '2026-04-24 12:00:00',
      avatarUrl: 'https://cdn.example.com/a.png',
    },
    personInfo: {
      id: 11,
      userId: 2,
      realName: '测试用户',
      gender: 1,
      age: 25,
      phone: '13900000000',
      email: 'test@example.com',
      education: '本科',
      city: '上海',
      targetCity: '杭州',
      expectedSalary: 25000,
    },
  }),
  updateUserStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getUserList,
    getUserDetail,
    updateUserStatus,
  },
}));

import AdminUsersPage from '@/app/admin/users/page';

describe('AdminUsersPage', () => {
  it('展示用户上次登录时间、详情弹窗并可禁用用户', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(getUserList).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('测试用户')).toBeInTheDocument();
    expect(screen.getByText('2026-04-24 12:00:00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '详情' }));

    await waitFor(() => {
      expect(getUserDetail).toHaveBeenCalledWith(2);
    });

    expect(await screen.findByText('用户详情')).toBeInTheDocument();
    expect(screen.getByText('求职者信息（person_info）')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '禁用' }));

    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalledWith(2, 'DISABLED');
    });
  });
});
