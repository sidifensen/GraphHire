import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobDetailPage from '@/app/(user)/jobs/[id]/page';

const getJobById = vi.fn();
const getGraphScore = vi.fn();
const getMatchDetail = vi.fn();
const getMyResumes = vi.fn();
const apply = vi.fn();
const authStoreMock = vi.fn();
const useParamsMock = vi.fn();
const useRouterMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
  useRouter: () => useRouterMock(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      getById: (...args: unknown[]) => getJobById(...args),
    },
  },
}));

vi.mock('@/lib/api/match', () => ({
  matchApi: {
    getGraphScore: (...args: unknown[]) => getGraphScore(...args),
  },
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getMatchDetail: (...args: unknown[]) => getMatchDetail(...args),
    apply: (...args: unknown[]) => apply(...args),
  },
}));

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: (...args: unknown[]) => getMyResumes(...args),
  },
}));

describe('User Job Detail Inline Match', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: '9' });
    useRouterMock.mockReturnValue({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'real@example.com', type: 'PERSON' } }));

    getJobById.mockResolvedValue({
      id: 9,
      companyId: 5,
      companyName: '星海人工智能研究院',
      title: '高级 Java 工程师',
      city: '杭州',
      district: '西湖区',
      salaryMin: 15000,
      salaryMax: 25000,
      salaryUnit: '月',
      requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
      description: '负责核心服务开发',
    });

    getGraphScore.mockResolvedValue({
      personId: 1,
      jobId: 9,
      totalScore: 90,
      skillScore: 95,
      requirementScore: 82,
      cityScore: 70,
      salaryScore: 85,
      educationScore: 90,
      matchLevel: '极力推荐',
      matchedSkills: ['Java', 'Spring Boot'],
      missingSkills: ['MySQL'],
      matchRate: 95,
      reason: '候选人的核心技能和目标岗位高度匹配。',
    });

    getMatchDetail.mockResolvedValue({
      matchId: 101,
      resumeId: 201,
      jobId: 9,
      score: { total: 90, skillScore: 95, requirementScore: 82 },
      level: 'HIGH',
      matchReason: '基于真实简历和岗位要求，当前匹配度较高。',
      job: { id: 9, title: '高级 Java 工程师', companyName: '星海人工智能研究院' },
    });
  });

  it('点击开始智能匹配后展示匹配结果并切换为立即投递', async () => {
    const user = userEvent.setup();
    render(<JobDetailPage />);

    const matchButton = await screen.findByRole('button', { name: '开始智能匹配' });
    await user.click(matchButton);

    await waitFor(() => expect(getGraphScore).toHaveBeenCalledWith(1, 9));
    await screen.findByTestId('match-score-ring');
    await screen.findByText('90%');
    await screen.findByText('技能匹配：95%');
    await screen.findByText('岗位要求匹配：82%');
    expect(screen.getByRole('button', { name: '立即投递' })).toBeDefined();
  });

  it('匹配成功后点击立即投递会自动使用默认简历', async () => {
    const user = userEvent.setup();
    getMyResumes.mockResolvedValue([
      { id: 200, fileName: '候选简历.pdf', isDefault: false },
      { id: 201, fileName: '默认简历.pdf', isDefault: true },
    ]);
    apply.mockResolvedValue({ applicationId: 3001 });

    render(<JobDetailPage />);

    await user.click(await screen.findByRole('button', { name: '开始智能匹配' }));
    await user.click(await screen.findByRole('button', { name: '立即投递' }));

    await waitFor(() => expect(getMyResumes).toHaveBeenCalledTimes(1));
    expect(apply).toHaveBeenCalledWith({ jobId: 9, resumeId: 201 });
    expect(screen.getByText('投递成功！')).toBeDefined();
  });

  it('无默认简历时提示并且不调用投递接口', async () => {
    const user = userEvent.setup();
    getMyResumes.mockResolvedValue([
      { id: 200, fileName: '候选简历.pdf', isDefault: false },
    ]);

    render(<JobDetailPage />);

    await user.click(await screen.findByRole('button', { name: '开始智能匹配' }));
    await user.click(await screen.findByRole('button', { name: '立即投递' }));

    await waitFor(() => expect(getMyResumes).toHaveBeenCalledTimes(1));
    expect(apply).not.toHaveBeenCalled();
    expect(screen.getByText('请先设置默认简历')).toBeDefined();
  });

  it('投递失败时展示后端返回的真实错误文案', async () => {
    const user = userEvent.setup();
    getMyResumes.mockResolvedValue([
      { id: 201, fileName: '默认简历.pdf', isDefault: true },
    ]);
    apply.mockRejectedValue(new Error('已投递过该职位'));

    render(<JobDetailPage />);

    await user.click(await screen.findByRole('button', { name: '开始智能匹配' }));
    await user.click(await screen.findByRole('button', { name: '立即投递' }));

    await waitFor(() => expect(apply).toHaveBeenCalledWith({ jobId: 9, resumeId: 201 }));
    expect(screen.getByText('已投递过该职位')).toBeDefined();
  });
});

