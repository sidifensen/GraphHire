import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('加载数据时渲染用户列表', async () => {
    const { container } = render(<AdminUsersPage />);

    await waitFor(() => {
      expect(container.querySelector('[class*="border"]')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('页面包含用户标题', async () => {
    const { getByText } = render(<AdminUsersPage />);

    await waitFor(() => {
      expect(getByText('用户治理与分析')).toBeTruthy();
    }, { timeout: 3000 });
  });
});
