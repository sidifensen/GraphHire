import { render, screen } from '@testing-library/react';
import EnterpriseCompanyProfilePage from '@/app/enterprise/company/profile/page';
import { vi } from 'vitest';

const { getInfoMock, listIndustryOptionsMock } = vi.hoisted(() => ({
  getInfoMock: vi.fn(),
  listIndustryOptionsMock: vi.fn(),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getInfo: getInfoMock,
    listIndustryOptions: listIndustryOptionsMock,
    updateProfile: vi.fn(),
  },
}));

describe('Enterprise company profile page', () => {
  it('renders a back button to previous page on top left', async () => {
    getInfoMock.mockResolvedValue({
      name: '测试企业',
      contactName: '张三',
      contactPhone: '13800138000',
      description: 'desc',
      website: 'https://example.com',
      industryId: 11,
      scale: '100-499人',
      address: '北京',
    });

    listIndustryOptionsMock.mockResolvedValue([
      {
        id: 1,
        name: '互联网',
        enabled: 1,
        children: [{ id: 11, name: '招聘', enabled: 1 }],
      },
    ]);

    render(<EnterpriseCompanyProfilePage />);

    expect(await screen.findByRole('button', { name: '返回上一页' })).toBeInTheDocument();
    expect(screen.queryByText('联系邮箱')).not.toBeInTheDocument();
  });
});
