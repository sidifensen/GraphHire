import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

const fetchHomeOverview = vi.fn();
const clientSpy = vi.fn();

vi.mock('@/lib/api/homeApi', () => ({
  fetchHomeOverview: (...args: unknown[]) => fetchHomeOverview(...args),
}));

vi.mock('@/app/HomePageClient', () => ({
  default: (props: unknown) => {
    clientSpy(props);
    return <div data-testid="home-page-client">home client</div>;
  },
}));

describe('HomePage SSR entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches overview on server and passes initialOverview to client component', async () => {
    const overview = {
      featuredJobs: [{ id: 1, title: '职位A', companyName: '企业A', city: '杭州', salaryText: '20k-30k', requiredSkills: [] }],
      popularCompanies: [{ id: 1, name: '企业A', city: '杭州', jobCount: 1, summary: '简介' }],
      hotCities: ['杭州'],
    };
    fetchHomeOverview.mockResolvedValue(overview);

    const jsx = await HomePage();
    render(jsx);

    expect(await screen.findByTestId('home-page-client')).toBeDefined();
    expect(fetchHomeOverview).toHaveBeenCalledTimes(1);
    expect(clientSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        initialOverview: overview,
        initialError: '',
      })
    );
  });
});

