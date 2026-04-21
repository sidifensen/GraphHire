import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminEnterpriseReviewPage from '@/app/admin/enterprise-review/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getCompanyAuthList: vi.fn(),
    updateCompanyAuth: vi.fn(),
    batchApproveCompanies: vi.fn(),
    batchRejectCompanies: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminEnterpriseReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAdminApi.getCompanyAuthList.mockResolvedValue({
      list: [{
        id: 1,
        companyId: 11,
        companyName: '星河科技',
        unifiedSocialCreditCode: '911100001111',
        legalPerson: '张三',
        phone: '13800000000',
        submittedAt: '2026-04-20',
        status: 'PENDING',
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('加载成功时展示真实企业审核列表', async () => {
    render(<AdminEnterpriseReviewPage />);

    expect(await screen.findByText('星河科技')).toBeInTheDocument();
    expect(screen.getByText('911100001111')).toBeInTheDocument();
  });

  it('点击通过会调用审核接口', async () => {
    render(<AdminEnterpriseReviewPage />);

    const approveBtn = await screen.findByRole('button', { name: '通过' });
    fireEvent.click(approveBtn);

    expect(mockedAdminApi.updateCompanyAuth).toHaveBeenCalledWith(1, { status: 'APPROVED' });
  });

  it('点击拒绝会提交拒绝原因', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('材料不完整');

    render(<AdminEnterpriseReviewPage />);

    const rejectBtn = await screen.findByRole('button', { name: '拒绝' });
    fireEvent.click(rejectBtn);

    expect(mockedAdminApi.updateCompanyAuth).toHaveBeenCalledWith(1, {
      status: 'REJECTED',
      rejectReason: '材料不完整',
    });
  });

  it('勾选后可批量通过', async () => {
    render(<AdminEnterpriseReviewPage />);

    const checkbox = await screen.findByRole('checkbox', { name: 'select-1' });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: '批量通过' }));

    expect(mockedAdminApi.batchApproveCompanies).toHaveBeenCalledWith({ ids: [1] });
  });
});
