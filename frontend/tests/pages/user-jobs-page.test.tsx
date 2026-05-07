import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import JobListPage from '@/app/(user)/jobs/page';

const hoisted = vi.hoisted(() => ({
  searchMock: vi.fn(),
  getPositionTypeTreeMock: vi.fn(),
  getIndustryTreeMock: vi.fn(),
  getProvinceCitiesMock: vi.fn(),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      search: hoisted.searchMock,
      getPositionTypeTree: hoisted.getPositionTypeTreeMock,
      getIndustryTree: hoisted.getIndustryTreeMock,
      getProvinceCities: hoisted.getProvinceCitiesMock,
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
          companyIndustryName: '互联网',
          companyScale: '5',
          companyAuthStatus: 'VERIFIED',
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
    hoisted.getProvinceCitiesMock.mockResolvedValue([
      { province: '北京市', cities: ['北京市'] },
      { province: '上海市', cities: ['上海市'] },
      { province: '广东省', cities: ['广州', '深圳'] },
    ]);
  });

  it('requests jobs only once after taxonomy is ready on initial load', async () => {
    let resolvePositionTree: ((value: unknown) => void) | undefined;
    let resolveIndustryTree: ((value: unknown) => void) | undefined;

    hoisted.getPositionTypeTreeMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePositionTree = resolve;
        }),
    );
    hoisted.getIndustryTreeMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveIndustryTree = resolve;
        }),
    );

    render(<JobListPage />);

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenCalledTimes(0);
    });

    resolvePositionTree?.([
      {
        id: 1000,
        name: '技术',
        parentId: null,
        level: 1,
        children: [],
      },
    ]);
    resolveIndustryTree?.([
      {
        id: 2000,
        name: '互联网',
        parentId: null,
        level: 1,
        children: [],
      },
    ]);

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps education and company scale labels visible during initial loading', async () => {
    let resolvePositionTree: ((value: unknown) => void) | undefined;
    let resolveIndustryTree: ((value: unknown) => void) | undefined;

    hoisted.getPositionTypeTreeMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePositionTree = resolve;
        }),
    );
    hoisted.getIndustryTreeMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveIndustryTree = resolve;
        }),
    );

    render(<JobListPage />);

    const [educationCombobox, companyScaleCombobox] = screen.getAllByRole('combobox');
    expect(within(educationCombobox).getByText('学历')).toBeInTheDocument();
    expect(within(companyScaleCombobox).getByText('公司规模')).toBeInTheDocument();

    resolvePositionTree?.([
      {
        id: 1000,
        name: '技术',
        parentId: null,
        level: 1,
        children: [],
      },
    ]);
    resolveIndustryTree?.([
      {
        id: 2000,
        name: '互联网',
        parentId: null,
        level: 1,
        children: [],
      },
    ]);

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenCalledTimes(1);
    });
  });

  it('loads province-city options from public api for location modal', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /更多地点/i }));
    const locationModal = await screen.findByTestId('location-modal');
    const provinceList = within(locationModal).getByTestId('location-province-list');
    const cityList = within(locationModal).getByTestId('location-city-list');

    expect(within(provinceList).getByRole('button', { name: '北京市' })).toBeInTheDocument();
    fireEvent.click(within(provinceList).getByRole('button', { name: '广东省' }));
    expect(within(cityList).getByRole('button', { name: '广州' })).toBeInTheDocument();
    expect(within(cityList).getByRole('button', { name: '深圳' })).toBeInTheDocument();
    expect(hoisted.getProvinceCitiesMock).toHaveBeenCalledTimes(1);
  });

  it('highlights 全国 as default city filter on initial load', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    const nationwideBtn = screen.getByRole('button', { name: '全国' });
    expect(nationwideBtn.className).toContain('bg-primary/10');
    expect(nationwideBtn.className).toContain('text-primary');
  });

  it('loads jobs from public api and opens category modal', async () => {
    render(<JobListPage />);

    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalled());
    expect(await screen.findByText('Java实习生')).toBeInTheDocument();
    expect(screen.getByText('互联网')).toBeInTheDocument();
    expect(screen.getByText('1000-9999人')).toBeInTheDocument();
    expect(screen.queryByText('校招网申')).not.toBeInTheDocument();
    expect(screen.queryByText('国企')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Java' })).toBeInTheDocument();
    const companyLogo = screen.getAllByAltText('company logo')[0];
    expect(companyLogo).toHaveAttribute('src', '/default-avatar.svg');

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    expect(await screen.findByText('选择职能')).toBeInTheDocument();
    expect(screen.getByText('技术')).toBeInTheDocument();
  });

  it('opens embedded category panel inside mobile dropdown when clicking 职位类别', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^职位类别$/ }));

    const embeddedPanel = await screen.findByTestId('mobile-category-dropdown');
    expect(within(embeddedPanel).getByText('选择职位类别')).toBeInTheDocument();
    const rootList = within(embeddedPanel).getByTestId('mobile-category-root-list');
    const midList = within(embeddedPanel).getByTestId('mobile-category-mid-list');
    const leafList = within(embeddedPanel).getByTestId('mobile-category-leaf-list');
    expect(within(rootList).getByRole('button', { name: '技术' })).toBeInTheDocument();
    expect(within(midList).getByRole('button', { name: '后端开发' })).toBeInTheDocument();
    expect(within(leafList).getByRole('button', { name: 'Java' })).toBeInTheDocument();
  });

  it('opens embedded location panel inside mobile dropdown when clicking 工作地点', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /^工作地点$/ }));

    const embeddedPanel = await screen.findByTestId('mobile-location-dropdown');
    expect(within(embeddedPanel).getByText('选择工作地点')).toBeInTheDocument();
    const provinceList = within(embeddedPanel).getByTestId('mobile-location-province-list');
    expect(within(provinceList).getByRole('button', { name: '北京市' })).toBeInTheDocument();
  });

  it('uses two-column industry picker in mobile advanced filter and selects only leaf industries', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /筛选/i }));
    const advancedPanel = await screen.findByTestId('mobile-advanced-filter-panel');
    const categoryMenu = within(advancedPanel).getByTestId('mobile-advanced-category-menu');
    fireEvent.click(within(categoryMenu).getByRole('button', { name: '公司行业' }));

    const panel = await screen.findByTestId('mobile-advanced-industry-panel');
    const rootColumn = within(panel).getByTestId('mobile-advanced-industry-root-column');
    const leafColumn = within(panel).getByTestId('mobile-advanced-industry-leaf-column');

    fireEvent.click(within(rootColumn).getByRole('button', { name: '互联网' }));
    expect(within(leafColumn).getByRole('button', { name: '电商' })).toBeInTheDocument();
    expect(within(leafColumn).getByRole('button', { name: '内容社区' })).toBeInTheDocument();
    expect(within(leafColumn).queryByRole('button', { name: '平台' })).not.toBeInTheDocument();

    fireEvent.click(within(leafColumn).getByRole('button', { name: '电商' }));
    fireEvent.click(screen.getByRole('button', { name: /确定/i }));

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          industryLeafIds: [2111],
        }),
      );
    });
  });

  it('shows featured category options from hot-priority list', async () => {
    hoisted.getPositionTypeTreeMock.mockResolvedValueOnce([
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
            children: [{ id: 1111, name: 'Java', parentId: 1100, level: 3, children: [] }],
          },
        ],
      },
      {
        id: 2000,
        name: '产品',
        parentId: null,
        level: 1,
        children: [
          {
            id: 2100,
            name: '产品经理',
            parentId: 2000,
            level: 2,
            children: [{ id: 2111, name: '产品经理', parentId: 2100, level: 3, children: [] }],
          },
        ],
      },
      {
        id: 3000,
        name: '客服/运营',
        parentId: null,
        level: 1,
        children: [
          {
            id: 3100,
            name: '运营',
            parentId: 3000,
            level: 2,
            children: [{ id: 3111, name: '新媒体运营', parentId: 3100, level: 3, children: [] }],
          },
        ],
      },
    ]);

    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('button', { name: 'Java' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '产品经理' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新媒体运营' })).toBeInTheDocument();
  });

  it('supports multi-select leaf categories and industry, single-select others', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    expect(screen.queryByRole('button', { name: '九江' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    const categoryModal = await screen.findByTestId('category-modal');
    fireEvent.click(within(categoryModal).getByText('技术'));
    fireEvent.click(within(categoryModal).getByText('后端开发'));
    fireEvent.click(within(categoryModal).getByRole('button', { name: 'Java' }));
    fireEvent.click(within(categoryModal).getByRole('button', { name: 'Golang' }));

    const categorySelectedTags = screen.getByTestId('category-selected-tags');
    expect(within(categorySelectedTags).getByRole('button', { name: /Java/ })).toBeInTheDocument();
    expect(within(categorySelectedTags).getByRole('button', { name: /Golang/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    const companyScaleTrigger = screen.getAllByRole('combobox')[1];
    expect(companyScaleTrigger.className).toContain('whitespace-nowrap');

    fireEvent.click(screen.getByRole('button', { name: /公司行业/i }));
    fireEvent.click(await screen.findByText('互联网'));
    fireEvent.click(screen.getByText('平台'));
    const ecommerceButton = screen.getByRole('button', { name: '电商' });
    fireEvent.click(ecommerceButton);
    expect(ecommerceButton.className).toContain('border-primary');
    fireEvent.click(screen.getByText('内容社区'));

    const industrySelectedTags = screen.getByTestId('industry-selected-tags');
    expect(within(industrySelectedTags).getByRole('button', { name: /电商/ })).toBeInTheDocument();
    expect(within(industrySelectedTags).getByRole('button', { name: /内容社区/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByRole('button', { name: /更多地点/i }));
    const locationModal = await screen.findByTestId('location-modal');
    const provinceList = within(locationModal).getByTestId('location-province-list');
    const cityList = within(locationModal).getByTestId('location-city-list');
    fireEvent.click(within(provinceList).getByRole('button', { name: '北京市' }));
    fireEvent.click(within(cityList).getByRole('button', { name: '北京市' }));
    fireEvent.click(within(provinceList).getByRole('button', { name: '上海市' }));
    fireEvent.click(within(cityList).getByRole('button', { name: '上海市' }));

    const citySelectedTags = screen.getByTestId('city-selected-tags');
    expect(within(citySelectedTags).getByRole('button', { name: /北京/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^确定$/ }));

    fireEvent.click(screen.getByText('实习'));

    await waitFor(() => {
      expect(hoisted.searchMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          positionTypeLeafIds: [1111, 1112],
          industryLeafIds: [2111, 2112],
          cityList: ['北京', '上海'],
          jobType: 3,
        }),
      );
    });
  });

  it('allows selecting middle column industry when it is already a leaf', async () => {
    hoisted.getIndustryTreeMock.mockResolvedValueOnce([
      {
        id: 3000,
        name: '服务业',
        parentId: null,
        level: 1,
        children: [
          { id: 3100, name: '生活服务', parentId: 3000, level: 2, children: [] },
        ],
      },
    ]);

    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /公司行业/i }));
    const industryModal = await screen.findByTestId('industry-modal');
    fireEvent.click(within(industryModal).getByRole('button', { name: '服务业' }));
    fireEvent.click(within(industryModal).getByRole('button', { name: '生活服务' }));

    const selectedTags = screen.getByTestId('industry-selected-tags');
    expect(within(selectedTags).getByRole('button', { name: '生活服务' })).toBeInTheDocument();
  });

  it('allows selecting middle column category when it is already a leaf', async () => {
    hoisted.getPositionTypeTreeMock.mockResolvedValueOnce([
      {
        id: 4000,
        name: '技术',
        parentId: null,
        level: 1,
        children: [
          { id: 4100, name: '测试', parentId: 4000, level: 2, children: [] },
        ],
      },
    ]);

    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    const categoryModal = await screen.findByTestId('category-modal');
    fireEvent.click(within(categoryModal).getByRole('button', { name: '技术' }));
    fireEvent.click(within(categoryModal).getByRole('button', { name: '测试' }));

    const selectedTags = screen.getByTestId('category-selected-tags');
    expect(within(selectedTags).getByRole('button', { name: '测试' })).toBeInTheDocument();
  });

  it('shows empty state hint when no jobs are returned', async () => {
    hoisted.searchMock.mockResolvedValueOnce({
      records: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });

    render(<JobListPage />);

    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('暂无匹配职位')).toBeInTheDocument();
    expect(screen.getByText('试试调整筛选条件或搜索关键词')).toBeInTheDocument();
  });

  it('uses theme background for desktop filter modals in dark mode compatibility', async () => {
    render(<JobListPage />);
    await waitFor(() => expect(hoisted.searchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /更多职类/i }));
    const categoryModal = await screen.findByTestId('category-modal');
    expect(categoryModal.className).toContain('bg-surface-lowest');
    expect(categoryModal.className).not.toContain('bg-white');
    expect(within(categoryModal).getByText('选择职能').className).toContain('border-surface-mid');
    const categoryRootColumn = within(categoryModal).getByRole('button', { name: '技术' }).closest('div');
    expect(categoryRootColumn?.className).toContain('border-surface-mid');
    expect(categoryRootColumn?.className).toContain('filter-modal-scroll');
    fireEvent.click(within(categoryModal).getByRole('button', { name: /^取消$/ }));

    fireEvent.click(screen.getByRole('button', { name: /公司行业/i }));
    const industryModal = await screen.findByTestId('industry-modal');
    expect(industryModal.className).toContain('bg-surface-lowest');
    expect(industryModal.className).not.toContain('bg-white');
    expect(within(industryModal).getByText('选择公司行业').className).toContain('border-surface-mid');
    const industryRootColumn = within(industryModal).getByRole('button', { name: '互联网' }).closest('div');
    expect(industryRootColumn?.className).toContain('border-surface-mid');
    expect(industryRootColumn?.className).toContain('filter-modal-scroll');
    fireEvent.click(within(industryModal).getByRole('button', { name: /^取消$/ }));

    fireEvent.click(screen.getByRole('button', { name: /更多地点/i }));
    const locationModal = await screen.findByTestId('location-modal');
    expect(locationModal.className).toContain('bg-surface-lowest');
    expect(locationModal.className).not.toContain('bg-white');
    expect(within(locationModal).getByText('选择工作地点').className).toContain('border-surface-mid');
    const provinceColumn = within(locationModal).getByTestId('location-province-list');
    expect(provinceColumn?.className).toContain('border-surface-mid');
    expect(provinceColumn?.className).toContain('filter-modal-scroll');
  });
});
