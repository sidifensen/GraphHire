import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecommendationsPage from '@/app/enterprise/recommendations/page';
import { companyApi } from '@/lib/api/company';

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobList: vi.fn(),
    getRecommendedResumes: vi.fn(),
    triggerJobMatch: vi.fn(),
  },
}));

describe('RecommendationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(companyApi.getJobList).mockResolvedValue([
      { id: 1, title: '高级前端工程师', department: '技术中心', city: '上海', status: 'PUBLISHED', viewCount: 0, applyCount: 0, matchCount: 0 },
      { id: 2, title: 'AI 算法工程师', department: '算法中心', city: '北京', status: 'PUBLISHED', viewCount: 0, applyCount: 0, matchCount: 0 },
    ]);
    vi.mocked(companyApi.getRecommendedResumes)
      .mockResolvedValueOnce([
        {
          resumeId: 100,
          jobId: 1,
          score: { total: 92, skillScore: 95, requirementScore: 88, cityScore: 70, salScore: 85 },
          matchReason: 'React 架构经验与岗位高度契合',
          resume: { id: 100, userName: '林晓静', fileName: 'lin.pdf' },
          job: { id: 1, title: '高级前端工程师' },
        },
      ])
      .mockResolvedValueOnce([
        {
          resumeId: 200,
          jobId: 2,
          score: { total: 85, skillScore: 82, requirementScore: 84, cityScore: 60, salScore: 70 },
          matchReason: 'NLP 项目经验丰富',
          resume: { id: 200, userName: '张伟', fileName: 'zhang.pdf' },
          job: { id: 2, title: 'AI 算法工程师' },
        },
      ]);
  });

  test('加载职位与推荐结果', async () => {
    render(<RecommendationsPage />);

    expect(await screen.findByText('林晓静')).toBeInTheDocument();
    expect(screen.getByText('高级前端工程师')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('综合推荐度 92%')).toBeInTheDocument();
    expect(screen.getByText('技能匹配 95%')).toBeInTheDocument();
    expect(screen.getByText('岗位要求匹配 88%')).toBeInTheDocument();
    expect(screen.queryByText(/经验匹配/)).not.toBeInTheDocument();
    expect(screen.queryByText(/学历匹配/)).not.toBeInTheDocument();
  });

  test('支持切换职位与本地搜索', async () => {
    const user = userEvent.setup();
    render(<RecommendationsPage />);

    await screen.findByText('林晓静');
    await user.click(screen.getByRole('button', { name: /AI 算法工程师/ }));

    await waitFor(() => {
      expect(companyApi.getRecommendedResumes).toHaveBeenLastCalledWith({ jobId: 2 });
    });
    expect(await screen.findByText('张伟')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('搜索候选人或匹配理由...'), 'NLP');
    expect(screen.getByText('张伟')).toBeInTheDocument();
    expect(screen.queryByText('林晓静')).not.toBeInTheDocument();
  });

  test('支持展开详情', async () => {
    const user = userEvent.setup();
    render(<RecommendationsPage />);

    await screen.findByText('林晓静');
    await user.click(screen.getByRole('button', { name: '详情' }));

    expect(await screen.findByText('城市匹配：70%')).toBeInTheDocument();
    expect(screen.getByText('附件名称：lin.pdf')).toBeInTheDocument();
  });

  test('支持一键匹配候选人并提示', async () => {
    vi.mocked(companyApi.triggerJobMatch).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RecommendationsPage />);

    await screen.findByText('林晓静');
    await user.click(screen.getByRole('button', { name: /一键匹配候选人/ }));

    expect(companyApi.triggerJobMatch).toHaveBeenCalledWith(1);
    expect(await screen.findByText('已开始匹配，正在刷新候选人推荐')).toBeInTheDocument();
  });

  test('支持刷新当前岗位推荐列表', async () => {
    const user = userEvent.setup();
    render(<RecommendationsPage />);

    await screen.findByText('林晓静');
    await user.click(screen.getByRole('button', { name: /刷新/ }));

    await waitFor(() => {
      expect(companyApi.getRecommendedResumes).toHaveBeenCalledTimes(2);
      expect(companyApi.getRecommendedResumes).toHaveBeenLastCalledWith({ jobId: 1 });
    });
  });
});
