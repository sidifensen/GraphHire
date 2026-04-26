import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompaniesPage from '@/app/(user)/companies/page';

const fetchPublicCompanies = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/companies',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

vi.mock('@/lib/api/homeApi', () => ({
  fetchPublicCompanies: (...args: unknown[]) => fetchPublicCompanies(...args),
}));

describe('CompaniesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPublicCompanies.mockResolvedValue({
      items: [
        { id: 1, name: '真实矩阵云', city: '深圳', jobCount: 2, summary: '已认证企业，当前开放 2 个职位' },
      ],
      total: 1,
      page: 1,
      size: 12,
      totalPages: 1,
    });
  });

  it('loads and renders companies from api', async () => {
    render(<CompaniesPage />);
    await screen.findByText('真实矩阵云');
    expect(screen.getByText('已认证企业，当前开放 2 个职位')).toBeDefined();
  });

  it('renders loading and error states', async () => {
    fetchPublicCompanies.mockRejectedValueOnce(new Error('company failed'));
    render(<CompaniesPage />);
    expect(screen.getByText('企业数据加载中...')).toBeDefined();
    await screen.findByText('company failed');
  });

  it('supports manual search reload', async () => {
    render(<CompaniesPage />);
    await waitFor(() => expect(fetchPublicCompanies).toHaveBeenCalledTimes(1));
    screen.getByText('搜索').click();
    await waitFor(() => expect(fetchPublicCompanies).toHaveBeenCalledTimes(2));
  });

  it('navigates to company detail when clicking a company card', async () => {
    const user = userEvent.setup();
    render(<CompaniesPage />);
    await screen.findByText('真实矩阵云');
    await user.click(screen.getByRole('article', { name: /真实矩阵云/i }));
    expect(push).toHaveBeenCalledWith('/companies/1');
  });
});