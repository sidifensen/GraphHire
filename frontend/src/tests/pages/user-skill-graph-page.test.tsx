import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SkillGraphPage from '@/app/(user)/skill-graph/page';

const { getGraphMock, getAbilityAssessmentMock } = vi.hoisted(() => ({
  getGraphMock: vi.fn(),
  getAbilityAssessmentMock: vi.fn(),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getGraph: getGraphMock,
    getAbilityAssessment: getAbilityAssessmentMock,
  },
}));

describe('User Skill Graph page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads graph and assessment from backend', async () => {
    getGraphMock.mockResolvedValue({
      personId: 99,
      skills: ['Java', 'Spring Boot', 'React'],
      success: true,
      mock: false,
    });
    getAbilityAssessmentMock.mockResolvedValue({
      totalScore: 86,
      level: 'HIGH',
      skillCount: 3,
      dimensions: {
        breadth: 80,
        depth: 84,
        structure: 88,
        freshness: 82,
        rarity: 79,
      },
      evaluatedAt: '2026-05-04T08:00:00.000Z',
    });

    render(<SkillGraphPage />);

    await waitFor(() => {
      expect(getGraphMock).toHaveBeenCalledTimes(1);
      expect(getAbilityAssessmentMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByText('全景图谱')).toBeInTheDocument();
    expect(screen.getByText('86')).toBeInTheDocument();
    expect(screen.getByText('综合分')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('已同步')).toBeInTheDocument();
    expect(screen.getAllByText('Java').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Spring Boot').length).toBeGreaterThan(0);
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
  });

  it('renders empty state when no graph skills', async () => {
    getGraphMock.mockResolvedValue({
      personId: 99,
      skills: [],
      success: true,
      mock: false,
    });
    getAbilityAssessmentMock.mockResolvedValue({
      totalScore: 0,
      level: 'LOW',
      skillCount: 0,
      dimensions: {
        breadth: 0,
        depth: 0,
        structure: 0,
        freshness: 0,
        rarity: 0,
      },
      evaluatedAt: '2026-05-04T08:00:00.000Z',
    });

    render(<SkillGraphPage />);

    await waitFor(() => {
      expect(getGraphMock).toHaveBeenCalledTimes(1);
      expect(getAbilityAssessmentMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('暂无技能图谱数据')).toBeInTheDocument();
    expect(screen.getByText('请先上传并解析简历，然后重试。')).toBeInTheDocument();
    expect(screen.getByText('暂无技能标签')).toBeInTheDocument();
  });
});
