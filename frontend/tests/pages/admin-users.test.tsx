import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getUserList: vi.fn(),
    getUserDetail: vi.fn(),
    updateUserStatus: vi.fn(),
    batchDisableUsers: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAdminApi.getUserList.mockResolvedValue({
      list: [{
        id: 1,
        username: 'alice',
        email: 'a@test.com',
        phone: '13800000000',
        type: 'PERSON',
        status: 'ACTIVE',
        createdAt: '2026-04-20',
        lastLoginAt: '2026-04-21',
        avatarUrl: 'https://cdn.example.com/alice.png',
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    mockedAdminApi.getUserDetail.mockResolvedValue({
      user: {
        id: 1,
        username: 'alice',
        email: 'a@test.com',
        phone: '13800000000',
        type: 'PERSON',
        status: 'ACTIVE',
        createdAt: '2026-04-20',
        lastLoginAt: '2026-04-21',
      },
      personInfo: {
        realName: 'Alice',
        gender: 2,
        age: 26,
        phone: '13800000000',
        email: 'a@test.com',
        education: '本科',
        city: '杭州',
        targetCity: '杭州',
        expectedSalary: 30000,
      },
    });
  });

  it('展示重构后的用户管理主标题与筛选区', async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText('用户管理')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索姓名、账号或联系方式')).toBeInTheDocument();
    expect(screen.getByText('全部用户类型')).toBeInTheDocument();
  });

  it('点击详情后拉取用户详情数据且支持禁用', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('禁用')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '详情' }));

    await waitFor(() => {
      expect(adminApi.getUserDetail).toHaveBeenCalledWith(1);
    });

    fireEvent.click(screen.getByRole('button', { name: '禁用' }));

    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith(1, 'DISABLED');
    });
  });
});
