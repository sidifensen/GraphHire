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

vi.mock('react-force-graph-2d', () => ({
  default: () => <div data-testid="force-graph-stage">Force Graph</div>,
}));

describe('User Skill Graph page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads graph and assessment from backend', async () => {
    getGraphMock.mockResolvedValue({
      personId: 99,
      realName: '斯蒂芬森',
      avatarUrl: '/person/avatar/public/99',
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
    expect(screen.getAllByTestId('force-graph-stage').length).toBeGreaterThan(0);
    expect(screen.getByText('86')).toBeInTheDocument();
    expect(screen.getByText('综合分')).toBeInTheDocument();
    expect(screen.getByText('3 知识节点')).toBeInTheDocument();
    expect(screen.queryByText('斯蒂芬森')).not.toBeInTheDocument();
    expect(screen.queryByText('Top 5% 职场精英')).not.toBeInTheDocument();
    expect(screen.queryByText(/Java · Spring Boot · React/)).not.toBeInTheDocument();
  });

  it('renders empty state when no graph skills', async () => {
    getGraphMock.mockResolvedValue({
      personId: 99,
      realName: null,
      avatarUrl: null,
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

    expect(screen.getByText('0 知识节点')).toBeInTheDocument();
    expect(screen.queryByText('求职者')).not.toBeInTheDocument();
    expect(screen.queryByText('暂无技能标签')).not.toBeInTheDocument();
  });
});
