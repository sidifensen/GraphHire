import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompanyDetailPage from '@/app/(user)/companies/[id]/page';

const useParamsMock = vi.fn();
const getCompanyById = vi.fn();
const searchJobs = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    companies: {
      getById: (...args: unknown[]) => getCompanyById(...args),
    },
    jobs: {
      search: (...args: unknown[]) => searchJobs(...args),
    },
  },
}));

describe('CompanyDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: '1' });
    getCompanyById.mockResolvedValue({ id: 1, name: '真实矩阵云', city: '深圳', summary: '已认证企业' });
    searchJobs.mockResolvedValue({
      records: [
        { id: 11, companyId: 1, title: '后端工程师', city: '深圳', salaryMin: 25000, salaryMax: 40000, requiredSkills: ['Java'] },
        { id: 12, companyId: 1, title: '前端工程师', city: '深圳', salaryMin: 20000, salaryMax: 35000, requiredSkills: ['React'] },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it('loads and renders jobs of current company', async () => {
    render(<CompanyDetailPage />);
    await screen.findByText('真实矩阵云');
    expect(await screen.findByText('后端工程师')).toBeInTheDocument();
    expect(await screen.findByText('前端工程师')).toBeInTheDocument();
  });
});
