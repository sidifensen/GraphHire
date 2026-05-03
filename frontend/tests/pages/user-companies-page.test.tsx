import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import CompanyListPage from '@/app/(user)/companies/page';

const hoisted = vi.hoisted(() => ({
  companiesSearchMock: vi.fn(),
  getIndustryTreeMock: vi.fn(),
  getProvinceCitiesMock: vi.fn(),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    companies: {
      search: hoisted.companiesSearchMock,
    },
    jobs: {
      getIndustryTree: hoisted.getIndustryTreeMock,
      getProvinceCities: hoisted.getProvinceCitiesMock,
    },
  },
}));

describe('user companies page real api filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    hoisted.getIndustryTreeMock.mockResolvedValue([
      {
        id: 2000,
        name: '互联网',
        parentId: null,
        level: 1,
        children: [
          {
            id: 2100,
            name: '平台',
            parentId: 2000,
            level: 2,
            children: [
              { id: 2111, name: '电子商务', parentId: 2100, level: 3, children: [] },
              { id: 2112, name: '游戏', parentId: 2100, level: 3, children: [] },
            ],
          },
        ],
      },
    ]);

    hoisted.getProvinceCitiesMock.mockResolvedValue([
      { province: '北京市', cities: ['北京市'] },
      { province: '上海市', cities: ['上海市'] },
      { province: '浙江省', cities: ['杭州', '宁波'] },
    ]);

    hoisted.companiesSearchMock.mockResolvedValue({
      records: [
        {
          id: 101,
          name: '星河科技',
          city: '杭州',
          jobCount: 12,
          summary: '已认证企业，当前开放 12 个职位',
          authStatus: 'VERIFIED',
          avatarUrl: null,
          industryId: 2111,
          industryName: '电子商务',
          scale: '5',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it('loads companies via public api and displays real fields', async () => {
    render(<CompanyListPage />);

    await waitFor(() => {
      expect(hoisted.companiesSearchMock).toHaveBeenCalled();
    });

    expect(await screen.findByText('星河科技')).toBeInTheDocument();
    expect(screen.getAllByText('电子商务').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1000-9999人').length).toBeGreaterThan(0);
    expect(screen.getAllByText('杭州').length).toBeGreaterThan(0);
    expect(screen.getByText('在招 12')).toBeInTheDocument();
  });

  it('maps industry/city/scale filters to company api params', async () => {
    render(<CompanyListPage />);

    await waitFor(() => {
      expect(hoisted.companiesSearchMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /更多行业/i }));
    const industryModal = await screen.findByTestId('industry-modal');
    fireEvent.click(within(industryModal).getByRole('button', { name: '互联网' }));
    fireEvent.click(within(industryModal).getByRole('button', { name: '平台' }));
    fireEvent.click(within(industryModal).getByRole('button', { name: '电子商务' }));
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByRole('button', { name: /更多地点/i }));
    const locationModal = await screen.findByTestId('location-modal');
    const provinceList = within(locationModal).getByTestId('location-province-list');
    const cityList = within(locationModal).getByTestId('location-city-list');
    fireEvent.click(within(provinceList).getByRole('button', { name: '浙江省' }));
    fireEvent.click(within(cityList).getByRole('button', { name: '杭州' }));
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByRole('button', { name: '1000-9999人' }));

    await waitFor(() => {
      expect(hoisted.companiesSearchMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          industryLeafIds: [2111],
          cityList: ['杭州'],
          companyScaleCode: '5',
        }),
      );
    });
  });

  it('restores persisted filters from localStorage', async () => {
    localStorage.setItem(
      'graphhire.user.companies.filters.v1',
      JSON.stringify({
        keyword: '星河',
        cityNames: ['杭州'],
        industryNames: ['电子商务'],
        companyScaleCode: '5',
      }),
    );

    render(<CompanyListPage />);

    await waitFor(() => {
      expect(hoisted.companiesSearchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: '星河',
          cityList: ['杭州'],
          industryLeafIds: [2111],
          companyScaleCode: '5',
        }),
      );
    });
  });

  it('opens embedded location panel inside mobile dropdown when clicking 工作地点', async () => {
    render(<CompanyListPage />);
    await waitFor(() => expect(hoisted.companiesSearchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^工作地点$/ }));

    const embeddedPanel = await screen.findByTestId('mobile-company-location-dropdown');
    expect(within(embeddedPanel).getByText('选择公司地点')).toBeInTheDocument();
    const provinceList = within(embeddedPanel).getByTestId('mobile-company-location-province-list');
    expect(within(provinceList).getByRole('button', { name: '北京市' })).toBeInTheDocument();
  });

  it('opens embedded industry panel inside mobile dropdown when clicking 行业类型', async () => {
    render(<CompanyListPage />);
    await waitFor(() => expect(hoisted.companiesSearchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^行业类型$/ }));

    const embeddedPanel = await screen.findByTestId('mobile-company-industry-dropdown');
    expect(within(embeddedPanel).getByText('选择公司行业')).toBeInTheDocument();
    expect(within(embeddedPanel).getByRole('button', { name: '互联网' })).toBeInTheDocument();
  });
});
