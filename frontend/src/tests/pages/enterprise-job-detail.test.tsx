import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobDetailPage from '@/app/enterprise/jobs/[id]/page';
import { companyApi } from '@/lib/api/company';

const useParamsMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => useParamsMock(),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobDetail: vi.fn(),
  },
}));

describe('Enterprise Job Detail Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useParamsMock.mockReturnValue({ id: '1' });
    vi.mocked(companyApi.getJobDetail).mockResolvedValue({
      id: 1,
      title: '高级算法工程师',
      status: 'PUBLISHED',
      department: 'AI 研发中心',
      headcount: 3,
      description: '负责算法平台设计与落地',
      location: { city: '上海' },
      salaryRange: { min: 40000, max: 60000, unit: 'MONTH' },
      skills: ['Java', 'Spring Boot'],
    });
  });

  test('成功渲染职位详情', async () => {
    render(<JobDetailPage />);

    const titles = await screen.findAllByText('高级算法工程师');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText('AI 研发中心')).toBeInTheDocument();
    expect(screen.getByText('40k-60k')).toBeInTheDocument();
    expect(screen.getByText('负责算法平台设计与落地')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    const recommendationLink = screen.getByRole('link', { name: '查看匹配候选人' });
    expect(recommendationLink).toHaveAttribute('href', '/enterprise/recommendations?jobId=1');
  });

  test('非法职位参数提示错误', async () => {
    useParamsMock.mockReturnValue({ id: 'invalid' });
    render(<JobDetailPage />);

    expect(await screen.findByText('无效的职位参数')).toBeInTheDocument();
    expect(companyApi.getJobDetail).not.toHaveBeenCalled();
  });

  test('接口失败后可重试', async () => {
    vi.mocked(companyApi.getJobDetail)
      .mockRejectedValueOnce(new Error('detail failed'))
      .mockResolvedValueOnce({
        id: 1,
        title: '高级算法工程师',
        status: 'PUBLISHED',
        department: 'AI 研发中心',
        description: '负责算法平台设计与落地',
        location: { city: '上海' },
        salaryRange: { min: 40000, max: 60000, unit: 'MONTH' },
        skills: [],
      });

    const user = userEvent.setup();
    render(<JobDetailPage />);

    expect(await screen.findByText('detail failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => {
      expect(screen.getAllByText('高级算法工程师').length).toBeGreaterThan(0);
    });
  });
});
