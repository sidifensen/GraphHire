import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JobListPage from '@/app/(user)/jobs/page';

const hoisted = vi.hoisted(() => ({
  searchMock: vi.fn(),
  getPositionTypeTreeMock: vi.fn(),
  getIndustryTreeMock: vi.fn(),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      search: hoisted.searchMock,
      getPositionTypeTree: hoisted.getPositionTypeTreeMock,
      getIndustryTree: hoisted.getIndustryTreeMock,
    },
  },
}));

describe('user jobs page filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.getPositionTypeTreeMock.mockResolvedValue([
      {
        id: 1000,
        name: '技术',
        parentId: null,
        level: 1,
        children: [
          {
            id: 1100,
            name: '后端开发',
            parentId: 1000,
            level: 2,
            children: [
              { id: 1111, name: 'Java', parentId: 1100, level: 3, children: [] },
              { id: 1112, name: 'Golang', parentId: 1100, level: 3, children: [] },
            ],
          },
        ],
      },
    ]);
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
              { id: 2111, name: '电商', parentId: 2100, level: 3, children: [] },
              { id: 2112, name: '内容社区', parentId: 2100, level: 3, children: [] },
            ],
          },
        ],
      },
    ]);
    hoisted.searchMock.mockResolvedValue({
      records: [
        {
          id: 1,
          companyId: 10,
          companyName: '测试科技',
          title: 'Java实习生',
          city: '北京',
          district: '海淀',
          salaryMin: 15000,
          salaryMax: 25000,
          salaryUnit: 'MONTH',
          requiredSkills: ['Java'],
          description: 'desc',
          experience: '不限',
          educationCode: 3,
          positionTypeId: 1111,
          jobType: 3,
          publishedAt: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it('loads jobs from public api and opens category modal', async () => {
    render(<JobListPage />);

    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalled());
    expect(await screen.findByText('Java实习生')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    expect(await screen.findByText('选择职能')).toBeInTheDocument();
    expect(screen.getByText('技术')).toBeInTheDocument();
  });

  it('supports multi-select leaf categories and industry, single-select others', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    fireEvent.click(await screen.findByText('技术'));
    fireEvent.click(screen.getByText('后端开发'));
    fireEvent.click(screen.getByText('Java'));
    fireEvent.click(screen.getByText('Golang'));
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByRole('button', { name: /公司行业/i }));
    fireEvent.click(await screen.findByText('互联网'));
    fireEvent.click(screen.getByText('平台'));
    fireEvent.click(screen.getByText('电商'));
    fireEvent.click(screen.getByText('内容社区'));
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByRole('button', { name: /工作地点/i }));
    const beijingButtons = await screen.findAllByText('北京');
    fireEvent.click(beijingButtons[beijingButtons.length - 1]);
    fireEvent.click(screen.getByRole('button', { name: '上海' }));
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByText('实习'));

    fireEvent.click(screen.getByText('硕士'));
    fireEvent.click(screen.getByText('本科'));

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          positionTypeLeafIds: [1111, 1112],
          industryLeafIds: [2111, 2112],
          cityList: ['北京'],
          jobType: 3,
          educationCode: 3,
        }),
      );
    });
  });
});
