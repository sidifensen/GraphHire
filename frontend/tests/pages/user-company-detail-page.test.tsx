import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CompanyDetailPage from '@/app/(user)/companies/[id]/page';

const hoisted = vi.hoisted(() => ({
  getByIdMock: vi.fn(),
  jobsSearchMock: vi.fn(),
  params: { id: '101' } as Record<string, string>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/companies/101',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => hoisted.params,
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    companies: {
      getById: hoisted.getByIdMock,
    },
    jobs: {
      search: hoisted.jobsSearchMock,
    },
  },
}));

describe('user company detail page real api integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.params = { id: '101' };

    hoisted.getByIdMock.mockResolvedValue({
      id: 101,
      name: '星河科技',
      city: '杭州',
      address: '杭州市滨江区江南大道3888号',
      jobCount: 2,
      summary: '已认证企业，当前开放 2 个职位',
      description: '星河科技是一家专注企业数字化的技术公司。',
      authStatus: 'VERIFIED',
      avatarUrl: '/files/company/avatar_101.png',
      industryName: '电子商务',
      scale: '5',
    });

    hoisted.jobsSearchMock.mockResolvedValue({
      records: [
        {
          id: 501,
          companyId: 101,
          companyName: '星河科技',
          title: '后端开发工程师',
          city: '杭州',
          district: '西湖区',
          salaryMin: 25000,
          salaryMax: 38000,
          requiredSkills: ['Java'],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it('loads company detail and open jobs from public api', async () => {
    render(<CompanyDetailPage />);

    await waitFor(() => {
      expect(hoisted.getByIdMock).toHaveBeenCalledWith(101);
    });
    await waitFor(() => {
      expect(hoisted.jobsSearchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 101,
          page: 1,
          size: 10,
          sortBy: 'createTime',
        }),
      );
    });

    expect(await screen.findByText('星河科技')).toBeInTheDocument();
    expect(screen.getByText('杭州市滨江区江南大道3888号')).toBeInTheDocument();
    expect(screen.queryByText('已认证企业，当前开放 2 个职位')).not.toBeInTheDocument();
    expect(screen.getByText('星河科技是一家专注企业数字化的技术公司。')).toBeInTheDocument();
    expect(screen.getByText('后端开发工程师')).toBeInTheDocument();
    expect(screen.getByText('25k-38k')).toBeInTheDocument();
  });

  it('does not force viewport-height overflow on detail root container', async () => {
    const { container } = render(<CompanyDetailPage />);

    await screen.findByText('星河科技');

    expect(container.firstElementChild).not.toHaveClass('min-h-screen');
  });
});
