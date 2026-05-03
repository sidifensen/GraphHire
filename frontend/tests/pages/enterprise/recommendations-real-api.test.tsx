import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecommendationsPage from '@/app/enterprise/recommendations/page';

const hoisted = vi.hoisted(() => ({
  companyApiMock: {
    getJobList: vi.fn(),
    getRecommendedResumes: vi.fn(),
    triggerJobMatch: vi.fn(),
  },
  searchParams: new URLSearchParams('jobId=11'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/enterprise/recommendations',
  useSearchParams: () => hoisted.searchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useParams: () => ({}),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: hoisted.companyApiMock,
}));

describe('enterprise recommendations real api integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.searchParams = new URLSearchParams('jobId=11');
  });

  it('loads jobs and recommendations from companyApi and supports one-click match', async () => {
    hoisted.companyApiMock.getJobList.mockResolvedValue([
      {
        id: 11,
        title: '算法工程师',
        department: 'AI 研发',
        city: '北京',
        status: 'PUBLISHED',
        salaryMin: 30,
        salaryMax: 50,
        salaryUnit: 'k/月',
        description: '负责算法研发',
        parseStatus: null,
        viewCount: 0,
        applyCount: 0,
        matchCount: 2,
        createdAt: '2026-05-03 09:00:00',
        publishedAt: '2026-05-03 10:00:00',
      },
    ]);
    hoisted.companyApiMock.getRecommendedResumes.mockResolvedValue([
      {
        matchId: 901,
        resumeId: 101,
        jobId: 11,
        score: {
          total: 88,
          skillScore: 91,
          requirementScore: 83,
        },
        matchReason: '技能栈贴合，岗位要求满足度高',
        resume: {
          id: 101,
          fileName: 'candidate-a.pdf',
          userName: '张三',
          avatarUrl: '/person/avatar/public/101',
          skills: ['Java', 'Spring Boot'],
          education: '本科',
          experience: '3年',
        },
      },
    ]);
    hoisted.companyApiMock.triggerJobMatch.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<RecommendationsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('算法工程师').length).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(hoisted.companyApiMock.getJobList).toHaveBeenCalledWith();
    });
    await waitFor(() => {
      expect(hoisted.companyApiMock.getRecommendedResumes).toHaveBeenCalledWith({ jobId: 11 });
    });

    expect(await screen.findByRole('button', { name: /一键匹配所有候选人/ })).toBeInTheDocument();
    expect(screen.getByText('综合匹配度 88%')).toBeInTheDocument();
    expect(screen.getByText('技能匹配度 91%')).toBeInTheDocument();
    expect(screen.getByText('岗位要求匹配度 83%')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot')).toBeInTheDocument();

    // 主标题应为用户姓名
    expect(screen.getByRole('heading', { name: '张三' })).toBeInTheDocument();
    // 头像应使用真实头像 URL
    expect(screen.getByAltText('张三')).toHaveAttribute('src', '/person/avatar/public/101');

    await user.click(screen.getByRole('button', { name: /一键匹配所有候选人/ }));

    await waitFor(() => {
      expect(hoisted.companyApiMock.triggerJobMatch).toHaveBeenCalledWith(11);
    });
    await waitFor(() => {
      expect(hoisted.companyApiMock.getRecommendedResumes).toHaveBeenCalledTimes(2);
    });
  });
});
