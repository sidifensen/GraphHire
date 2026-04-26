import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePageClient from '@/app/HomePageClient';

const push = vi.fn();
const fetchHomeOverview = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

vi.mock('@/lib/api/homeApi', () => ({
  fetchHomeOverview: (...args: unknown[]) => fetchHomeOverview(...args),
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <div>MockFooter</div>,
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchHomeOverview.mockResolvedValue({
      featuredJobs: [
        { id: 1, title: '真实高级工程师', companyName: '真实科技', city: '杭州', salaryText: '30k-45k', requiredSkills: ['Java'] },
      ],
      popularCompanies: [
        { id: 11, name: '真实科技', city: '杭州', jobCount: 3, summary: '已认证企业，当前开放 3 个职位' },
      ],
      hotCities: ['杭州', '上海'],
    });
  });

  it('renders real overview data from api', async () => {
    render(<HomePageClient initialOverview={{
      featuredJobs: [
        { id: 1, title: '真实高级工程师', companyName: '真实科技', city: '杭州', salaryText: '30k-45k', requiredSkills: ['Java'] },
      ],
      popularCompanies: [
        { id: 11, name: '真实科技', city: '杭州', jobCount: 3, summary: '已认证企业，当前开放 3 个职位' },
      ],
      hotCities: ['杭州', '上海'],
    }} initialError="" />);
    expect(screen.getByText(/AI 驱动/)).toBeDefined();
    await screen.findByText('真实高级工程师');
    expect(screen.getAllByText('真实科技').length).toBeGreaterThan(0);
    expect(screen.getAllByText('杭州').length).toBeGreaterThan(0);
  });

  it('renders loading and retry states', async () => {
    fetchHomeOverview.mockRejectedValueOnce(new Error('boom'));
    render(<HomePageClient initialOverview={{
      featuredJobs: [],
      popularCompanies: [],
      hotCities: [],
    }} initialError="初始化失败" />);
    expect(screen.getByText('初始化失败')).toBeDefined();
    screen.getByText('重试').click();
    await screen.findByText('boom');
    expect(screen.getByText('重试')).toBeDefined();
  });

  it('navigates to jobs when search button clicked', async () => {
    render(<HomePageClient initialOverview={{
      featuredJobs: [],
      popularCompanies: [],
      hotCities: [],
    }} initialError="" />);
    await waitFor(() => expect(screen.getByText('智能搜索')).toBeDefined());
    screen.getByText('智能搜索').click();
    expect(push).toHaveBeenCalledWith('/jobs');
  });
});
