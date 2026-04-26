import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';
import { adminApi } from '@/lib/api/admin';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getUserList: vi.fn(),
    getUserDetail: vi.fn(),
    updateUserStatus: vi.fn(),
  },
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminUsersPage', () => {
  const mockUserList = {
    list: [
      {
        id: 1,
        username: 'zhangsan',
        realName: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        type: 'PERSON',
        status: 'ACTIVE',
        createdAt: '2026-04-01',
        lastLoginAt: '2026-04-26 10:00:00',
        avatarUrl: null,
      },
      {
        id: 2,
        username: 'company_hr',
        realName: '李四',
        email: 'lisi@company.com',
        phone: '13900139000',
        type: 'COMPANY',
        status: 'DISABLED',
        createdAt: '2026-03-15',
        lastLoginAt: '2026-04-25 15:30:00',
        avatarUrl: null,
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getUserList).mockResolvedValue(mockUserList);
    vi.mocked(adminApi.getUserDetail).mockResolvedValue({
      user: mockUserList.list[0],
      personInfo: null,
    });
    vi.mocked(adminApi.updateUserStatus).mockResolvedValue();
  });

  it('渲染用户管理页面标题和筛选条件', async () => {
    render(<AdminUsersPage />);

    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('管理系统注册用户及求职者资料')).toBeInTheDocument();
    // 有两个下拉框：用户类型筛选和状态筛选
    expect(screen.getAllByRole('combobox').length).toBe(2);
  });

  it('展示用户列表数据', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('zhangsan')).toBeInTheDocument();
      expect(screen.getByText('13800138000')).toBeInTheDocument();
    });
  });

  it('点击详情按钮打开用户详情弹窗', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    const detailButton = screen.getAllByRole('button', { name: '详情' })[0];
    fireEvent.click(detailButton);

    await waitFor(() => {
      expect(screen.getByText('用户详情')).toBeInTheDocument();
    });
  });

  it('点击禁用按钮调用禁用接口', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    const disableButton = screen.getAllByRole('button', { name: '禁用' })[0];
    fireEvent.click(disableButton);

    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith(1, 'DISABLED');
    });
  });

  it('点击启用按钮调用启用接口', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('李四')).toBeInTheDocument();
    });

    const enableButton = screen.getAllByRole('button', { name: '启用' })[0];
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith(2, 'ACTIVE');
    });
  });
});