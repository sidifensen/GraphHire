import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobsPage from '@/app/enterprise/jobs/page';
import { companyApi } from '@/lib/api/company';

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobList: vi.fn(),
    publishJob: vi.fn(),
    closeJob: vi.fn(),
  },
}));

describe('JobsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(companyApi.getJobList).mockResolvedValue([
      {
        id: 1,
        title: '高级算法工程师',
        department: 'AI 研发中心',
        city: '上海',
        salaryMin: 40000,
        salaryMax: 60000,
        status: 'PUBLISHED',
        viewCount: 12,
        applyCount: 4,
        matchCount: 3,
      },
    ]);
    vi.mocked(companyApi.publishJob).mockResolvedValue();
    vi.mocked(companyApi.closeJob).mockResolvedValue();
  });

  test('渲染真实职位列表', async () => {
    render(<JobsPage />);

    expect(await screen.findByText('高级算法工程师')).toBeInTheDocument();
    expect(screen.getByText('AI 研发中心')).toBeInTheDocument();
    expect(screen.getByText('40k-60k')).toBeInTheDocument();
    expect(screen.getAllByText('已发布').length).toBeGreaterThan(0);
    const createLink = screen.getByRole('link', { name: '发布新职位' });
    expect(createLink).toHaveAttribute('href', '/enterprise/jobs/new');
    const detailLink = screen.getByRole('link', { name: '详情' });
    expect(detailLink).toHaveAttribute('href', '/enterprise/jobs/1');
  });

  test('支持搜索操作', async () => {
    const user = userEvent.setup();
    render(<JobsPage />);

    await screen.findByText('高级算法工程师');
    await user.type(screen.getByPlaceholderText('搜索职位名称...'), '算法');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    await waitFor(() => {
      expect(companyApi.getJobList).toHaveBeenLastCalledWith({ status: undefined, keyword: '算法' });
    });

  });

  test('支持关闭职位', async () => {
    const user = userEvent.setup();
    render(<JobsPage />);

    await screen.findByText('高级算法工程师');
    await user.click(screen.getByTitle('暂停'));

    await waitFor(() => {
      expect(companyApi.closeJob).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText('职位状态已更新')).toBeInTheDocument();
  });

  test('加载失败后可以重试', async () => {
    vi.mocked(companyApi.getJobList)
      .mockRejectedValueOnce(new Error('jobs failed'))
      .mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<JobsPage />);

    expect(await screen.findByText('jobs failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重试' }));
    expect(await screen.findByText('暂无职位数据')).toBeInTheDocument();
  });
});
