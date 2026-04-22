import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnterpriseDashboardPage from '@/app/enterprise/dashboard/page';
import { companyApi } from '@/lib/api/company';

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getDashboard: vi.fn(),
  },
}));

describe('EnterpriseDashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('加载真实仪表盘数据并渲染', async () => {
    vi.mocked(companyApi.getDashboard).mockResolvedValue({
      pendingApplicationCount: 9,
      newMatchCandidateCount: 14,
      activeJobCount: 3,
      recentJobs: [
        { id: 1, title: '高级前端工程师', department: '技术中心', applyCount: 5, matchCount: 7, status: 'PUBLISHED' },
      ],
    });

    render(<EnterpriseDashboardPage />);

    expect(screen.getByText('企业仪表盘加载中...')).toBeInTheDocument();
    expect(await screen.findByText('高级前端工程师')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('技术中心')).toBeInTheDocument();
    expect(screen.getAllByText('已发布').length).toBeGreaterThan(0);
  });

  test('加载失败后可以重试', async () => {
    vi.mocked(companyApi.getDashboard)
      .mockRejectedValueOnce(new Error('dashboard failed'))
      .mockResolvedValueOnce({
        pendingApplicationCount: 1,
        newMatchCandidateCount: 2,
        activeJobCount: 1,
        recentJobs: [],
      });

    const user = userEvent.setup();
    render(<EnterpriseDashboardPage />);

    expect(await screen.findByText('dashboard failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试' }));

    expect(await screen.findByText('暂无近期职位')).toBeInTheDocument();
    await waitFor(() => {
      expect(companyApi.getDashboard).toHaveBeenCalledTimes(2);
    });
  });
});
