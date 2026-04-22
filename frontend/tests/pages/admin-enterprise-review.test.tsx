import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

  it('加载数据时渲染企业审核列表', async () => {
    const { container } = render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(container.querySelector('[class*="grid"]')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('页面包含企业审核标题', async () => {
    const { getByText } = render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(getByText('企业审核')).toBeTruthy();
    }, { timeout: 3000 });
  });
});
