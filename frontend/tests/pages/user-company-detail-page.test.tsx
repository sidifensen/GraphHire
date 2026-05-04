import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      unifiedSocialCreditCode: '91330100123456789A',
      contactName: '李四',
      contactPhone: '13900001111',
      website: 'example.com',
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

    expect(await screen.findByRole('heading', { name: '星河科技', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText('杭州市滨江区江南大道3888号')).not.toHaveLength(0);
    expect(screen.queryByText('已认证企业，当前开放 2 个职位')).not.toBeInTheDocument();
  });

  it('shows business registration info under company intro with real api fields', async () => {
    render(<CompanyDetailPage />);

    await screen.findByRole('heading', { name: '星河科技', level: 1 });

    expect(screen.getByText('工商信息')).toBeInTheDocument();
    expect(screen.getByText('统一社会信用代码')).toBeInTheDocument();
    expect(screen.getByText('91330100123456789A')).toBeInTheDocument();
    expect(screen.getByText('联系人')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('联系电话')).toBeInTheDocument();
    expect(screen.getByText('13900001111')).toBeInTheDocument();
    expect(screen.getByText('公司官网')).toBeInTheDocument();
    const siteLink = screen.getByRole('link', { name: 'example.com' });
    expect(siteLink).toHaveAttribute('href', 'https://example.com');
  });

  it('shows intro tab by default and switches to jobs tab after clicking', async () => {
    const user = userEvent.setup();

    render(<CompanyDetailPage />);

    await screen.findByRole('heading', { name: '星河科技', level: 1 });

    const introTab = screen.getByRole('tab', { name: '公司介绍' });
    const jobsTab = screen.getByRole('tab', { name: '在招职位' });

    expect(introTab).toHaveAttribute('aria-selected', 'true');
    expect(jobsTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('星河科技是一家专注企业数字化的技术公司。')).toBeInTheDocument();
    expect(screen.queryByText('后端开发工程师')).not.toBeInTheDocument();

    await user.click(jobsTab);

    expect(jobsTab).toHaveAttribute('aria-selected', 'true');
    expect(introTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('后端开发工程师')).toBeInTheDocument();
    expect(screen.getByText('25k-38k')).toBeInTheDocument();
  });

  it('uses linear layout and row-based job list instead of stacked cards', async () => {
    const user = userEvent.setup();
    const { container } = render(<CompanyDetailPage />);

    await screen.findByRole('heading', { name: '星河科技', level: 1 });

    expect(container.querySelectorAll('.rounded-3xl')).toHaveLength(0);

    const jobsTab = screen.getByRole('tab', { name: '在招职位' });
    await user.click(jobsTab);

    const jobLink = screen.getByRole('link', { name: /后端开发工程师/ });
    expect(jobLink).toHaveClass('border-b');
    expect(jobLink).not.toHaveClass('rounded-2xl');
    expect(jobLink).not.toHaveClass('shadow-sm');
  });

  it('does not force viewport-height overflow on detail root container', async () => {
    const { container } = render(<CompanyDetailPage />);

    await screen.findByRole('heading', { name: '星河科技', level: 1 });

    expect(container.firstElementChild).not.toHaveClass('min-h-screen');
  });
});
