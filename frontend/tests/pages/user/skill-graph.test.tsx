import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { forwardRef } from 'react';
import SkillGraphPage from '@/app/(user)/skill-graph/page';

const getGraph = vi.fn();
const getAbilityAssessment = vi.fn();
const authStoreMock = vi.fn();

vi.mock('next/dynamic', () => ({
  default: () =>
    forwardRef(() => <div data-testid="force-graph" />),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getGraph: (...args: unknown[]) => getGraph(...args),
    getAbilityAssessment: (...args: unknown[]) => getAbilityAssessment(...args),
  },
}));

describe('SkillGraphPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'real@example.com', type: 'PERSON' } }));
    getGraph.mockResolvedValue({
      personId: 1,
      skills: ['Java', 'Spring Boot', 'React'],
      success: true,
    });
    getAbilityAssessment.mockResolvedValue({
      totalScore: 86,
      level: 'HIGH',
      skillCount: 3,
      dimensions: { breadth: 90, depth: 85, structure: 80, freshness: 75, rarity: 70 },
      evaluatedAt: '2026-04-25T00:00:00Z',
    });
  });

  it('loads and renders graph data from api', async () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('图谱数据加载中...')).toBeDefined();
    await screen.findByRole('button', { name: '重置视图' });
    expect(screen.getByTestId('force-graph')).toBeDefined();
    expect(screen.getByText('AI 综合能力评估')).toBeDefined();
    expect(screen.getByText(/节点数：/)).toBeDefined();
    expect(screen.getByTestId('skill-score-ring')).toBeDefined();
    expect(screen.getByTestId('skill-score-progress')).toBeDefined();
  });

  it('renders empty state', async () => {
    getGraph.mockResolvedValueOnce({ personId: 1, skills: [], success: true });
    render(<SkillGraphPage />);
    await screen.findByText('暂无技能图谱数据，请先上传并解析简历。');
  });

  it('renders error and retry states', async () => {
    getGraph.mockRejectedValueOnce(new Error('graph failed'));
    render(<SkillGraphPage />);
    await screen.findByText('graph failed');
    screen.getByText('重试').click();
    await waitFor(() => expect(getGraph).toHaveBeenCalledTimes(2));
  });
});