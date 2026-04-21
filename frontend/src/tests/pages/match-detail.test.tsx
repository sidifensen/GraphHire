import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MatchDetailPage from '@/app/(user)/match/[id]/page';

const getMatchDetail = vi.fn();
const getJobById = vi.fn();
const getGraphScore = vi.fn();
const authStoreMock = vi.fn();
const useParamsMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getMatchDetail: (...args: unknown[]) => getMatchDetail(...args),
  },
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

describe('MatchDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: '9' });
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'real@example.com', type: 'PERSON' } }));
    getMatchDetail.mockResolvedValue({
      matchId: 101,
      resumeId: 201,
      jobId: 9,
      score: { total: 92, skillScore: 95, expScore: 90, cityScore: 85, eduScore: 100, salScore: 88 },
      level: 'HIGH',
      matchReason: '基于真实简历和岗位要求，当前匹配度较高。',
      isRead: false,
      job: { id: 9, title: '高级 Java 工程师', companyName: '星海人工智能研究院' },
    });
    getJobById.mockResolvedValue({
      id: 9,
      companyId: 5,
      companyName: '星海人工智能研究院',
      title: '高级 Java 工程师',
      city: '杭州',
      salaryMin: 15000,
      salaryMax: 25000,
      requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
    });
    getGraphScore.mockResolvedValue({
      personId: 1,
      jobId: 9,
      totalScore: 92,
      matchLevel: '极力推荐',
      matchedSkills: ['Java', 'Spring Boot'],
      missingSkills: ['MySQL'],
      matchRate: 95,
      reason: '候选人的核心技能和目标岗位高度匹配。',
    });
  });

  it('loads and renders combined real api data', async () => {
    render(<MatchDetailPage />);
    expect(screen.getByText('匹配详情加载中...')).toBeDefined();
    await screen.findByText('高级 Java 工程师');
    expect(getMatchDetail).toHaveBeenCalledWith(9);
    expect(getJobById).toHaveBeenCalledWith(9);
    expect(getGraphScore).toHaveBeenCalledWith(1, 9);
    expect(screen.getByText(/星海人工智能研究院/)).toBeDefined();
    expect(screen.getByText('15k - 25k')).toBeDefined();
    expect(screen.getByText('AI 极力推荐')).toBeDefined();
    expect(screen.getByText('Java')).toBeDefined();
    expect(screen.getAllByText('MySQL').length).toBeGreaterThan(0);
  });

  it('renders error and retry states', async () => {
    getMatchDetail.mockRejectedValueOnce(new Error('match failed'));
    render(<MatchDetailPage />);
    await screen.findByText('match failed');
    screen.getByText('重试').click();
    await waitFor(() => expect(getMatchDetail).toHaveBeenCalledTimes(2));
  });

  it('renders invalid param state', async () => {
    useParamsMock.mockReturnValue({ id: 'abc' });
    render(<MatchDetailPage />);
    await screen.findByText('无效的职位参数');
    useParamsMock.mockReturnValue({ id: '9' });
  });

  it('renders apply button', async () => {
    render(<MatchDetailPage />);
    await screen.findByRole('button', { name: /立即投递/i });
  });
});