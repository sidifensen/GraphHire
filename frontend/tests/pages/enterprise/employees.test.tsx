/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EmployeesPage from '@/app/enterprise/employees/page';
import { companyApi } from '@/lib/api/company';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  enterpriseAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      user: { id: 1, username: 'test@graphhire.com', type: 'company' },
    })),
  },
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getStaffStats: vi.fn(),
    getStaffList: vi.fn(),
    getPendingStaffList: vi.fn(),
    createStaff: vi.fn(),
    resetStaffPassword: vi.fn(),
    updateStaffStatus: vi.fn(),
    approveJoinRequest: vi.fn(),
    rejectJoinRequest: vi.fn(),
  },
}));

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('展示加载状态', () => {
    vi.mocked(companyApi.getStaffStats).mockImplementation(
      () => new Promise(() => {}),
    );
    vi.mocked(companyApi.getStaffList).mockImplementation(
      () => new Promise(() => {}),
    );
    vi.mocked(companyApi.getPendingStaffList).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<EmployeesPage />);

    expect(screen.getByText('员工数据加载中...')).toBeInTheDocument();
  });

  it('展示员工统计数据', async () => {
    const mockStats = { totalCount: 10, ownerCount: 1, hrCount: 3 };
    const mockStaffList: any[] = [];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('企业总人数')).toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('企业主数量')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('管理员数量')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('展示员工列表', async () => {
    const mockStats = { totalCount: 2, ownerCount: 1, hrCount: 1 };
    const mockStaffList = [
      { id: 1, username: 'staff1', post: 'HR', status: 'ACTIVE', lastLoginTime: '2024-01-01' },
      { id: 2, username: 'owner1', post: 'OWNER', status: 'ACTIVE', lastLoginTime: '2024-01-02' },
    ];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('staff1')[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText('owner1')[0]).toBeInTheDocument();
    expect(screen.getByText('人员列表')).toBeInTheDocument();
  });

  it('展示待加入员工列表', async () => {
    const mockStats = { totalCount: 2, ownerCount: 1, hrCount: 1 };
    const mockStaffList: any[] = [];
    const mockPendingList = [
      { id: 1, userId: 100, username: 'pending_user1', post: 'HR' },
      { id: 2, userId: 101, username: 'pending_user2', post: 'HR' },
    ];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    expect(screen.getAllByText('pending_user1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('pending_user2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('通过').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('拒绝').length).toBeGreaterThanOrEqual(2);
  });

  it('暂无待审批申请时展示提示', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    expect(screen.getByText('暂无待审批申请')).toBeInTheDocument();
  });

  it('点击添加员工按钮显示表单', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('添加员工'));

    expect(screen.getByPlaceholderText('员工登录用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('初始密码')).toBeInTheDocument();
    expect(screen.getByText('创建员工账号')).toBeInTheDocument();
  });

  it('再次点击添加员工按钮收起表单', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('添加员工'));
    expect(screen.getByPlaceholderText('员工登录用户名')).toBeInTheDocument();

    fireEvent.click(screen.getByText('收起表单'));
    expect(screen.queryByPlaceholderText('员工登录用户名')).toBeNull();
  });

  it('创建员工成功后显示消息并重置表单', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.createStaff).mockResolvedValue();

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('添加员工'));

    fireEvent.change(screen.getByPlaceholderText('员工登录用户名'), { target: { value: 'newstaff' } });
    fireEvent.change(screen.getByPlaceholderText('初始密码'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('创建员工账号'));

    await waitFor(() => {
      expect(screen.getByText('员工账号创建成功')).toBeInTheDocument();
    });

    expect(screen.queryByPlaceholderText('员工登录用户名')).toBeNull();
  });

  it('展示错误状态和重试按钮', async () => {
    vi.mocked(companyApi.getStaffStats).mockRejectedValue(new Error('加载失败'));
    vi.mocked(companyApi.getStaffList).mockRejectedValue(new Error('加载失败'));
    vi.mocked(companyApi.getPendingStaffList).mockRejectedValue(new Error('加载失败'));

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('无权限时展示提示信息', async () => {
    vi.mocked(companyApi.getStaffStats).mockRejectedValue(new Error('403 无权访问'));
    vi.mocked(companyApi.getStaffList).mockRejectedValue(new Error('403 无权访问'));
    vi.mocked(companyApi.getPendingStaffList).mockRejectedValue(new Error('403 无权访问'));

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('当前账号无权限访问员工管理，仅企业主可查看和管理员工列表。')).toBeInTheDocument();
    });
  });

  it('点击重置密码按钮', async () => {
    const mockStats = { totalCount: 2, ownerCount: 1, hrCount: 1 };
    const mockStaffList = [
      { id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' },
      { id: 2, username: 'staff1', post: 'HR', status: 'ACTIVE' },
    ];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.resetStaffPassword).mockResolvedValue({ newPassword: 'newpassword123' });

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('staff1')[0]).toBeInTheDocument();
    });

    const resetButton = screen.getAllByTitle('重置密码')[1];
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(companyApi.resetStaffPassword).toHaveBeenCalledWith(2);
    });
  });

  it('点击禁用账号按钮', async () => {
    const mockStats = { totalCount: 2, ownerCount: 1, hrCount: 1 };
    const mockStaffList = [
      { id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' },
      { id: 2, username: 'staff1', post: 'HR', status: 'ACTIVE' },
    ];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.updateStaffStatus).mockResolvedValue();

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('staff1')[0]).toBeInTheDocument();
    });

    const disableButton = screen.getAllByTitle('禁用账号')[1];
    fireEvent.click(disableButton);

    await waitFor(() => {
      expect(companyApi.updateStaffStatus).toHaveBeenCalledWith(2, true);
    });
  });

  it('点击启用账号按钮', async () => {
    const mockStats = { totalCount: 2, ownerCount: 1, hrCount: 1 };
    const mockStaffList = [
      { id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' },
      { id: 2, username: 'staff1', post: 'HR', status: 'DISABLED' },
    ];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.updateStaffStatus).mockResolvedValue();

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('staff1')[0]).toBeInTheDocument();
    });

    const enableButton = screen.getAllByTitle('启用账号')[0];
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(companyApi.updateStaffStatus).toHaveBeenCalledWith(2, false);
    });
  });

  it('点击通过按钮审批加入', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList: any[] = [];
    const mockPendingList = [{ id: 1, userId: 100, username: 'pending1', post: 'HR' }];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.approveJoinRequest).mockResolvedValue();

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('通过'));

    await waitFor(() => {
      expect(companyApi.approveJoinRequest).toHaveBeenCalledWith(1);
    });
  });

  it('点击拒绝按钮拒绝加入', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList: any[] = [];
    const mockPendingList = [{ id: 1, userId: 100, username: 'pending1', post: 'HR' }];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);
    vi.mocked(companyApi.rejectJoinRequest).mockResolvedValue();

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('拒绝'));

    await waitFor(() => {
      expect(companyApi.rejectJoinRequest).toHaveBeenCalledWith(1);
    });
  });

  it('展示角色权限说明', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    expect(screen.getByText('角色权限说明')).toBeInTheDocument();
    expect(screen.getAllByText('企业主')[0]).toBeInTheDocument();
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('企业主行不显示重置密码和禁用按钮', async () => {
    const mockStats = { totalCount: 1, ownerCount: 1, hrCount: 0 };
    const mockStaffList = [{ id: 1, username: 'owner1', post: 'OWNER', status: 'ACTIVE' }];
    const mockPendingList: any[] = [];

    vi.mocked(companyApi.getStaffStats).mockResolvedValue(mockStats);
    vi.mocked(companyApi.getStaffList).mockResolvedValue(mockStaffList);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue(mockPendingList);

    render(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText('待加入员工')).toBeInTheDocument();
    });

    const resetButtons = screen.getAllByTitle('重置密码');
    const disableButtons = screen.getAllByTitle('禁用账号');

    resetButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    disableButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});