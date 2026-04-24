import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('展示重构后的企业审核标题与说明', async () => {
    render(<AdminEnterpriseReviewPage />);

    expect(await screen.findByText('企业审核')).toBeInTheDocument();
    expect(screen.getByText('管理和审批入驻企业资质与账号信息')).toBeInTheDocument();
    expect(screen.getByText('待审核企业')).toBeInTheDocument();
  });

  it('切换状态筛选后会重新请求列表', async () => {
    render(<AdminEnterpriseReviewPage />);

    fireEvent.click(await screen.findByRole('button', { name: '已通过' }));

    await waitFor(() => {
      expect(adminApi.getCompanyAuthList).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED' })
      );
    });
  });
});
