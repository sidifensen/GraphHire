import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminEnterpriseReviewPage from '@/app/admin/enterprise-review/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getCompanyAuthList: vi.fn(),
    updateCompanyAuth: vi.fn(),
  },
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminEnterpriseReviewPage', () => {
  const mockCompanyList = {
    list: [
      {
        id: 1,
        companyId: 101,
        companyName: '测试科技有限公司',
        unifiedSocialCreditCode: '91110000123456789A',
        industry: '互联网',
        scale: '100-499人',
        address: '北京市朝阳区',
        contact: '王经理',
        phone: '13800138000',
        businessLicenseUrl: 'https://example.com/license.jpg',
        submittedAt: '2026-04-25 10:00:00',
        status: 'PENDING',
        reviewedAt: null,
        reviewerId: null,
        rejectReason: null,
      },
      {
        id: 2,
        companyId: 102,
        companyName: '已通过企业',
        unifiedSocialCreditCode: '91110000987654321B',
        industry: '金融',
        scale: '500-999人',
        address: '上海市浦东新区',
        contact: '李经理',
        phone: '13900139000',
        businessLicenseUrl: 'https://example.com/license2.jpg',
        submittedAt: '2026-04-20 09:00:00',
        status: 'APPROVED',
        reviewedAt: '2026-04-21 14:00:00',
        reviewerId: 1,
        rejectReason: null,
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getCompanyAuthList).mockResolvedValue(mockCompanyList);
    vi.mocked(adminApi.updateCompanyAuth).mockResolvedValue();
  });

  it('渲染企业审核页面标题和统计卡片', async () => {
    render(<AdminEnterpriseReviewPage />);

    expect(screen.getByText('企业审核')).toBeInTheDocument();
    expect(screen.getByText('管理和审批入驻企业资质与账号信息')).toBeInTheDocument();
  });

  it('展示企业列表数据', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
      expect(screen.getByText('已通过企业')).toBeInTheDocument();
    });
  });

  it('点击详情按钮打开企业详情弹窗', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
    });

    const detailButton = screen.getAllByRole('button', { name: '详情' })[0];
    fireEvent.click(detailButton);

    await waitFor(() => {
      expect(screen.getByText('企业详情')).toBeInTheDocument();
    });
  });

  it('点击通过按钮调用审核通过接口', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
    });

    const approveButton = screen.getAllByRole('button', { name: '通过' })[0];
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(adminApi.updateCompanyAuth).toHaveBeenCalledWith(1, { status: 'APPROVED' });
    });
  });

  it('点击拒绝按钮调用审核拒绝接口', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
    });

    const rejectButton = screen.getAllByRole('button', { name: '拒绝' })[0];
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(adminApi.updateCompanyAuth).toHaveBeenCalledWith(1, { status: 'REJECTED', rejectReason: '管理员审核拒绝' });
    });
  });

  it('切换标签页重新加载数据', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '已通过' }));

    await waitFor(() => {
      expect(adminApi.getCompanyAuthList).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED' })
      );
    });
  });
});