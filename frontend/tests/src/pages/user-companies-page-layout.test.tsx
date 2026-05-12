import { render, screen } from '@testing-library/react';
import CompanyList from '@/app/(user)/companies/page';
import { vi } from 'vitest';

const mockSearch = vi.fn();
const mockGetIndustryTree = vi.fn();
const mockGetProvinceCities = vi.fn();

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    companies: {
      search: (...args: unknown[]) => mockSearch(...args),
    },
    jobs: {
      getIndustryTree: (...args: unknown[]) => mockGetIndustryTree(...args),
      getProvinceCities: (...args: unknown[]) => mockGetProvinceCities(...args),
    },
  },
}));

describe('User companies page desktop search layout', () => {
  beforeEach(() => {
    mockSearch.mockResolvedValue({
      records: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });
    mockGetIndustryTree.mockResolvedValue([]);
    mockGetProvinceCities.mockResolvedValue([{ province: '北京市', cities: ['北京市'] }]);
  });

  test('renders full-width filter band with distinct background on desktop', async () => {
    const { container } = render(<CompanyList />);
    await screen.findByText('暂无符合条件的公司');

    const filterBand = screen.getByTestId('desktop-company-filter-band');
    expect(filterBand).toHaveClass('bg-surface-low');

    const desktopSearchRow = screen.getByTestId('desktop-company-search-row');
    expect(desktopSearchRow).toHaveClass('md:w-full');

    expect(container.querySelectorAll('main > section').length).toBeGreaterThan(0);
  });

  test('does not set min-h-screen on page root to avoid extra vertical scroll in shell layout', async () => {
    const { container } = render(<CompanyList />);
    await screen.findByText('暂无符合条件的公司');

    const root = container.firstElementChild;
    expect(root).not.toHaveClass('min-h-screen');
  });
});
