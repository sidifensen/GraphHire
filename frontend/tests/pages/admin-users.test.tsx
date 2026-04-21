import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('加载成功时展示真实用户列表', async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('a@test.com')).toBeInTheDocument();
  });

  it('点击禁用会调用状态修改接口', async () => {
    render(<AdminUsersPage />);

    const disableBtn = await screen.findByRole('button', { name: '禁用' });
    fireEvent.click(disableBtn);

    expect(mockedAdminApi.updateUserStatus).toHaveBeenCalledWith(1, 'DISABLED');
  });

  it('勾选后可批量禁用', async () => {
    render(<AdminUsersPage />);

    const checkbox = await screen.findByRole('checkbox', { name: 'select-1' });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: '批量禁用' }));

    expect(mockedAdminApi.batchDisableUsers).toHaveBeenCalledWith({ userIds: [1] });
  });

  it('导出按钮为禁用态', async () => {
    render(<AdminUsersPage />);

    const exportBtn = await screen.findByRole('button', { name: '批量导出（暂未开放）' });
    expect(exportBtn).toBeDisabled();
  });
});
