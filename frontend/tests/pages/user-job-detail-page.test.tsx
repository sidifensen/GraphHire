import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import JobDetailPage from '@/app/(user)/jobs/[id]/page';

const hoisted = vi.hoisted(() => ({
  getJobByIdMock: vi.fn(),
  getCompanyByIdMock: vi.fn(),
  params: { id: '501' } as Record<string, string>,
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
  usePathname: () => '/jobs/501',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => hoisted.params,
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      getById: hoisted.getJobByIdMock,
    },
    companies: {
      getById: hoisted.getCompanyByIdMock,
    },
  },
}));

describe('user job detail page real company card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.params = { id: '501' };

    hoisted.getJobByIdMock.mockResolvedValue({
      id: 501,
      companyId: 101,
      companyName: '职位返回企业名',
      companyIndustryName: '职位返回行业',
      companyScale: '2',
      companyAuthStatus: 'VERIFIED',
      companyAvatarUrl: null,
      title: '高级前端开发工程师',
      city: '北京',
      district: '海淀区',
      salaryMin: 30000,
      salaryMax: 60000,
      salaryUnit: 'MONTH',
      requiredSkills: ['React', 'TypeScript'],
      description: '负责前端架构设计与性能优化',
      experience: null,
      educationCode: 3,
      positionTypeId: 1111,
      jobType: 1,
      publishedAt: '2026-05-03T08:30:00',
    });

    hoisted.getCompanyByIdMock.mockResolvedValue({
      id: 101,
      name: '真实企业名称',
      city: '北京',
      jobCount: 8,
      summary: '已认证企业，当前开放 8 个职位',
      authStatus: 'VERIFIED',
      avatarUrl: null,
      industryId: 2111,
      industryName: '人工智能',
      scale: '5',
    });
  });

  it('loads job detail and uses real company detail on right card', async () => {
    render(<JobDetailPage />);

    await waitFor(() => {
      expect(hoisted.getJobByIdMock).toHaveBeenCalledWith(501);
    });

    await waitFor(() => {
      expect(hoisted.getCompanyByIdMock).toHaveBeenCalledWith(101);
    });

    expect(await screen.findByText('高级前端开发工程师')).toBeInTheDocument();
    expect(screen.getByText('所需技能')).toBeInTheDocument();
    expect(screen.getByTestId('job-required-skill-React')).toBeInTheDocument();
    expect(screen.getByTestId('job-required-skill-TypeScript')).toBeInTheDocument();
    expect(screen.getByText('全职')).toBeInTheDocument();
    expect(screen.getByText('已认证 · 1000-9999人')).toBeInTheDocument();
    expect(screen.getByText('真实企业名称')).toBeInTheDocument();
    expect(screen.getByText('人工智能')).toBeInTheDocument();
    expect(screen.getAllByText('1000-9999人').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /进入公司主页/i })).toHaveAttribute('href', '/companies/101');
  });
});
