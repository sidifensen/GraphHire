import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobDetailPage from '@/app/enterprise/jobs/[id]/page';
import { companyApi } from '@/lib/api/company';

const useParamsMock = vi.fn();
const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: backMock,
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
    triggerJobMatch: vi.fn(),
  },
}));

describe('Enterprise Job Detail Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    pushMock.mockReset();
    backMock.mockReset();
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

  test('左上返回按钮可回到上一页', async () => {
    const user = userEvent.setup();
    render(<JobDetailPage />);

    await screen.findByText('负责算法平台设计与落地');
    await user.click(screen.getByRole('button', { name: '返回' }));

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  test('右上修改按钮跳转到修改职位页', async () => {
    const user = userEvent.setup();
    render(<JobDetailPage />);

    await screen.findByText('负责算法平台设计与落地');
    await user.click(screen.getByRole('button', { name: '修改职位' }));

    expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs/1/edit');
  });

  test('点击一键匹配后禁用按钮并提示已开始匹配', async () => {
    let resolveTrigger: (() => void) | null = null;
    vi.mocked(companyApi.triggerJobMatch).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveTrigger = resolve;
        }),
    );
    const user = userEvent.setup();

    render(<JobDetailPage />);
    await screen.findByText('负责算法平台设计与落地');

    const triggerButton = screen.getByRole('button', { name: '一键匹配全部候选人' });
    await user.click(triggerButton);

    expect(companyApi.triggerJobMatch).toHaveBeenCalledWith(1);
    expect(screen.getByRole('button', { name: '匹配启动中...' })).toBeDisabled();

    resolveTrigger?.();

    expect(await screen.findByText('已开始匹配，正在刷新候选人推荐')).toBeInTheDocument();
  });
});
