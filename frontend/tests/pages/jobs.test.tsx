import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import JobsPage from '@/app/(user)/jobs/page';

const fetchPublicJobs = vi.fn();
const useRouterMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/jobs',
  useSearchParams: () => new URLSearchParams('keyword=java'),
  useRouter: () => useRouterMock(),
}));

vi.mock('@/lib/api/homeApi', () => ({
  fetchPublicJobs: (...args: unknown[]) => fetchPublicJobs(...args),
}));

describe('JobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouterMock.mockReturnValue({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
    fetchPublicJobs.mockResolvedValue({
      items: [
        { id: 1, title: '真实 Java 工程师', companyName: '真实科技', city: '北京', salaryText: '25k-38k', requiredSkills: [] },
      ],
      total: 1,
      page: 1,
      size: 12,
      totalPages: 1,
    });
  });

  it('loads and renders jobs from api', async () => {
    render(<JobsPage />);
    await screen.findByText('真实 Java 工程师');
    expect(fetchPublicJobs).toHaveBeenCalled();
    expect(screen.getByText('真实科技')).toBeDefined();
  });

  it('renders loading and error states', async () => {
    fetchPublicJobs.mockRejectedValueOnce(new Error('load failed'));
    render(<JobsPage />);
    expect(screen.getByText('职位数据加载中...')).toBeDefined();
    await screen.findByText('load failed');
  });

  it('supports manual search reload', async () => {
    render(<JobsPage />);
    await waitFor(() => expect(fetchPublicJobs).toHaveBeenCalledTimes(1));
    screen.getByText('搜索职位').click();
    await waitFor(() => expect(fetchPublicJobs).toHaveBeenCalledTimes(2));
  });

  it('navigates to match detail when clicking a job card', async () => {
    const push = vi.fn();
    useRouterMock.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
    render(<JobsPage />);
    const title = await screen.findByText('真实 Java 工程师');
    title.closest('article')?.click();
    expect(push).toHaveBeenCalledWith('/jobs/1');
  });
});
