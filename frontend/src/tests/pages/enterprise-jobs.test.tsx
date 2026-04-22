import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobsPage from '@/app/enterprise/jobs/page';
import { companyApi } from '@/lib/api/company';

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobList: vi.fn(),
    publishJob: vi.fn(),
    closeJob: vi.fn(),
    parseJob: vi.fn(),
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
    vi.mocked(companyApi.parseJob).mockResolvedValue();
  });

  test('渲染真实职位列表', async () => {
    render(<JobsPage />);

    expect(await screen.findByText('高级算法工程师')).toBeInTheDocument();
    expect(screen.getByText('AI 研发中心')).toBeInTheDocument();
    expect(screen.getByText('40k-60k')).toBeInTheDocument();
    expect(screen.getAllByText('已发布').length).toBeGreaterThan(0);
  });

  test('支持搜索与重新解析操作', async () => {
    const user = userEvent.setup();
    render(<JobsPage />);

    await screen.findByText('高级算法工程师');
    await user.type(screen.getByPlaceholderText('搜索职位名称...'), '算法');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    await waitFor(() => {
      expect(companyApi.getJobList).toHaveBeenLastCalledWith({ status: undefined, keyword: '算法' });
    });

    await user.click(screen.getByRole('button', { name: '重新解析' }));

    await waitFor(() => {
      expect(companyApi.parseJob).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText('职位解析任务已触发')).toBeInTheDocument();
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
