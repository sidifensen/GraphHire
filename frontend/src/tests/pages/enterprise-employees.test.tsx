import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeesPage from '@/app/enterprise/employees/page';
import { companyApi } from '@/lib/api/company';

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
    vi.resetAllMocks();
    vi.mocked(companyApi.getStaffStats).mockResolvedValue({
      totalCount: 2,
      ownerCount: 1,
      hrCount: 1,
    });
    vi.mocked(companyApi.getStaffList).mockResolvedValue([
      { id: 1, userId: 11, username: 'owner@graphhire.com', displayName: 'owner', post: 'OWNER', status: 'ACTIVE', lastLoginTime: '-' },
      { id: 2, userId: 12, username: 'hr@graphhire.com', displayName: 'hr', post: 'HR', status: 'ACTIVE', lastLoginTime: '-' },
    ]);
    vi.mocked(companyApi.getPendingStaffList).mockResolvedValue([
      { id: 3, userId: 13, username: 'new@graphhire.com', displayName: 'new', post: 'HR', status: 'PENDING_JOIN', lastLoginTime: '-' },
    ]);
    vi.mocked(companyApi.createStaff).mockResolvedValue();
    vi.mocked(companyApi.resetStaffPassword).mockResolvedValue({ newPassword: 'NewPass123' });
    vi.mocked(companyApi.updateStaffStatus).mockResolvedValue();
    vi.mocked(companyApi.approveJoinRequest).mockResolvedValue();
    vi.mocked(companyApi.rejectJoinRequest).mockResolvedValue();
  });

  test('渲染员工统计与列表', async () => {
    render(<EmployeesPage />);

    expect(await screen.findByText('owner')).toBeInTheDocument();
    expect(screen.getByText('企业总人数')).toBeInTheDocument();
    expect(screen.getByText('管理员数量')).toBeInTheDocument();
    expect(screen.getByText('待加入员工')).toBeInTheDocument();
  });

  test('支持创建员工账号（仅HR）', async () => {
    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText('owner');
    await user.click(screen.getByRole('button', { name: /添加员工/ }));
    await user.type(screen.getByPlaceholderText('员工登录用户名'), 'new-hr@graphhire.com');
    await user.type(screen.getByPlaceholderText('初始密码'), 'Password123');
    await user.click(screen.getByRole('button', { name: '创建员工账号' }));

    await waitFor(() => {
      expect(companyApi.createStaff).toHaveBeenCalledWith({
        username: 'new-hr@graphhire.com',
        password: 'Password123',
        post: 'HR',
      });
    });
    expect(await screen.findByText('员工账号创建成功')).toBeInTheDocument();
  });

  test('支持审批待加入员工', async () => {
    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText('new');
    await user.click(screen.getByRole('button', { name: '通过' }));

    await waitFor(() => {
      expect(companyApi.approveJoinRequest).toHaveBeenCalledWith(3);
    });
  });

  test('加载403时显示无权限提示', async () => {
    vi.mocked(companyApi.getStaffStats).mockRejectedValueOnce(new Error('403 Forbidden'));
    render(<EmployeesPage />);
    expect(await screen.findByText('当前账号无权限访问员工管理，仅企业主可查看和管理员工列表。')).toBeInTheDocument();
  });
});
