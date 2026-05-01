import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getCompanyAuthList, updateCompanyAuth } = vi.hoisted(() => ({
  getCompanyAuthList: vi.fn().mockResolvedValue({
    list: [
      {
        id: 1,
        companyId: 10,
        companyName: '测试科技有限公司',
        avatarUrl: 'https://cdn.example.com/company-avatar.png',
        unifiedSocialCreditCode: '91330100TEST0001',
        industry: '互联网',
        scale: '中型',
        address: '杭州市西湖区文三路 1 号',
        legalPerson: '张三',
        phone: '13800000000',
        contact: '张三',
        ownerName: 'owner@graphhire.com',
        submittedAt: '2026-04-24 12:00:00',
        status: 'PENDING',
        reviewedAt: null,
        reviewerId: null,
        rejectReason: null,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  updateCompanyAuth: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getCompanyAuthList,
    updateCompanyAuth,
  },
}));

import AdminEnterpriseReviewPage from '@/app/admin/enterprise-review/page';

describe('AdminEnterpriseReviewPage', () => {
  it('loads company list from backend and supports detail/approve/reject actions', async () => {
    render(<AdminEnterpriseReviewPage />);

    await waitFor(() => {
      expect(getCompanyAuthList).toHaveBeenCalled();
    });

    expect(screen.getByText('测试科技有限公司')).toBeInTheDocument();
    expect(screen.getByText('互联网')).toBeInTheDocument();
    expect(screen.getByText('中型')).toBeInTheDocument();
    expect(screen.getByAltText('测试科技有限公司 头像')).toHaveAttribute('src', 'https://cdn.example.com/company-avatar.png');
    expect(screen.getByText(/联系人：张三/)).toBeInTheDocument();
    expect(screen.getByText(/企业主：owner@graphhire.com/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('详情'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByText('杭州市西湖区文三路 1 号').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText('通过'));

    await waitFor(() => {
      expect(updateCompanyAuth).toHaveBeenCalledWith(1, { status: 'APPROVED' });
    });

    fireEvent.click(screen.getByText('拒绝'));

    await waitFor(() => {
      expect(updateCompanyAuth).toHaveBeenCalledWith(1, { status: 'REJECTED', rejectReason: '管理员审核拒绝' });
    });
  });
});
