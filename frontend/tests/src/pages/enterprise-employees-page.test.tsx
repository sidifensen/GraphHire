import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EnterpriseEmployeesPage from '@/app/enterprise/employees/page';

const {
  getStaffListMock,
  getStaffStatsMock,
  getPendingStaffListMock,
  updateStaffStatusMock,
  resetStaffPasswordMock,
  approveJoinRequestMock,
  rejectJoinRequestMock,
} = vi.hoisted(() => ({
  getStaffListMock: vi.fn(),
  getStaffStatsMock: vi.fn(),
  getPendingStaffListMock: vi.fn(),
  updateStaffStatusMock: vi.fn(),
  resetStaffPasswordMock: vi.fn(),
  approveJoinRequestMock: vi.fn(),
  rejectJoinRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getStaffList: getStaffListMock,
    getStaffStats: getStaffStatsMock,
    getPendingStaffList: getPendingStaffListMock,
    updateStaffStatus: updateStaffStatusMock,
    resetStaffPassword: resetStaffPasswordMock,
    approveJoinRequest: approveJoinRequestMock,
    rejectJoinRequest: rejectJoinRequestMock,
  },
}));

describe('Enterprise Employees page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStaffListMock.mockResolvedValue([
      {
        id: 101,
        userId: 1001,
        username: 'api_member_1@graphhire.com',
        displayName: '接口员工甲',
        post: 'OWNER',
        status: 'ACTIVE',
        lastLoginTime: '2026-05-03 10:00:00',
      },
      {
        id: 102,
        userId: 1002,
        username: 'api_member_2@graphhire.com',
        displayName: '接口员工乙',
        post: 'HR',
        status: 'ACTIVE',
        lastLoginTime: '-',
      },
    ]);
    getStaffStatsMock.mockResolvedValue({
      totalCount: 12,
      ownerCount: 2,
      hrCount: 10,
    });
    getPendingStaffListMock.mockResolvedValue([
      {
        id: 201,
        userId: 2001,
        username: 'pending_staff@graphhire.com',
        displayName: '待审批成员A',
        post: 'HR',
        status: 'PENDING_JOIN',
        lastLoginTime: null,
      },
    ]);
    updateStaffStatusMock.mockResolvedValue(undefined);
    resetStaffPasswordMock.mockResolvedValue({ newPassword: 'Abc1234567' });
    approveJoinRequestMock.mockResolvedValue(undefined);
    rejectJoinRequestMock.mockResolvedValue(undefined);
  });

  it('loads staff data from backend and renders list/stats/pending blocks', async () => {
    render(<EnterpriseEmployeesPage />);

    await waitFor(() => {
      expect(getStaffListMock).toHaveBeenCalledTimes(1);
      expect(getStaffStatsMock).toHaveBeenCalledTimes(1);
      expect(getPendingStaffListMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('接口员工甲')).toBeInTheDocument();
    expect(screen.getByText('接口员工乙')).toBeInTheDocument();
    expect(screen.getByText('待审批成员A')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('supports disable and approve actions', async () => {
    const user = userEvent.setup();
    render(<EnterpriseEmployeesPage />);

    await waitFor(() => expect(getStaffListMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: '禁用-102' }));
    await waitFor(() => expect(updateStaffStatusMock).toHaveBeenCalledWith(102, true));

    await user.click(screen.getByRole('button', { name: '通过-201' }));
    await waitFor(() => expect(approveJoinRequestMock).toHaveBeenCalledWith(201));
  });
});
