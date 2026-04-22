import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeesPage from '@/app/enterprise/employees/page';
import { companyApi } from '@/lib/api/company';

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getStaffStats: vi.fn(),
    getStaffList: vi.fn(),
    createStaff: vi.fn(),
    resetStaffPassword: vi.fn(),
  },
}));

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(companyApi.getStaffStats).mockResolvedValue({
      totalCount: 3,
      ownerCount: 1,
      hrCount: 1,
      recruiterCount: 1,
    });
    vi.mocked(companyApi.getStaffList).mockResolvedValue([
      { id: 1, userId: 11, username: 'owner@graphhire.com', displayName: 'owner', post: 'OWNER', status: 'ACTIVE', lastLoginTime: '-' },
      { id: 2, userId: 12, username: 'hr@graphhire.com', displayName: 'hr', post: 'HR', status: 'ACTIVE', lastLoginTime: '-' },
    ]);
    vi.mocked(companyApi.createStaff).mockResolvedValue();
    vi.mocked(companyApi.resetStaffPassword).mockResolvedValue({ newPassword: 'NewPass123' });
  });

  test('渲染员工统计与列表', async () => {
    render(<EmployeesPage />);

    expect(await screen.findByText('owner')).toBeInTheDocument();
    expect(screen.getByText('企业总人数')).toBeInTheDocument();
    expect(screen.getByText('管理员数量')).toBeInTheDocument();
    expect(screen.getAllByText('企业主').length).toBeGreaterThan(0);
  });

  test('支持创建员工账号', async () => {
    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText('owner');
    await user.click(screen.getByRole('button', { name: /添加员工/ }));
    await user.type(screen.getByPlaceholderText('员工登录用户名'), 'new-hr@graphhire.com');
    await user.type(screen.getByPlaceholderText('初始密码'), 'Password123');
    await user.selectOptions(screen.getByRole('combobox'), 'RECRUITER');
    await user.click(screen.getByRole('button', { name: '创建员工账号' }));

    await waitFor(() => {
      expect(companyApi.createStaff).toHaveBeenCalledWith({
        username: 'new-hr@graphhire.com',
        password: 'Password123',
        post: 'RECRUITER',
      });
    });
    expect(await screen.findByText('员工账号创建成功')).toBeInTheDocument();
  });

  test('支持重置员工密码', async () => {
    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText('hr');
    const resetButtons = screen.getAllByTitle('重置密码');
    await user.click(resetButtons[1]);

    await waitFor(() => {
      expect(companyApi.resetStaffPassword).toHaveBeenCalledWith(2);
    });
    expect(await screen.findByText('hr 的新密码：NewPass123')).toBeInTheDocument();
  });

  test('加载失败后可以重试', async () => {
    vi.mocked(companyApi.getStaffStats)
      .mockRejectedValueOnce(new Error('staff failed'))
      .mockResolvedValueOnce({ totalCount: 0, ownerCount: 0, hrCount: 0, recruiterCount: 0 });
    vi.mocked(companyApi.getStaffList)
      .mockRejectedValueOnce(new Error('staff failed'))
      .mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<EmployeesPage />);

    expect(await screen.findByText('staff failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试' }));
    expect(await screen.findByText('暂无员工账号')).toBeInTheDocument();
  });
});
