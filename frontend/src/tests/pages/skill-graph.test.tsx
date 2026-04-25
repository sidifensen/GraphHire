import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { forwardRef, useImperativeHandle } from 'react';
import SkillGraphPage, { buildSkillGraphData } from '@/app/(user)/skill-graph/page';

const getGraph = vi.fn();
const getAbilityAssessment = vi.fn();
const authStoreMock = vi.fn();
const zoomToFitMock = vi.fn();

vi.mock('next/dynamic', () => ({
  default: () =>
    forwardRef((props: any, ref) => {
      useImperativeHandle(ref, () => ({
        zoomToFit: zoomToFitMock,
      }));

      return (
        <div data-testid="force-graph">
          <button type="button" onClick={() => props.onNodeHover?.({ id: 'skill-0', name: 'Java' })}>
            trigger-hover
          </button>
        </div>
      );
    }),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getGraph: (...args: unknown[]) => getGraph(...args),
    getAbilityAssessment: (...args: unknown[]) => getAbilityAssessment(...args),
  },
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

describe('SkillGraphPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'alice', type: 'PERSON' } }));
    getAbilityAssessment.mockResolvedValue({
      totalScore: 88,
      level: 'HIGH',
      skillCount: 2,
      dimensions: { breadth: 90, depth: 80, structure: 70, freshness: 60, rarity: 50 },
      evaluatedAt: '2026-04-25T00:00:00Z',
    });
  });

  it('shows loading state while api is pending', () => {
    getGraph.mockReturnValue(new Promise(() => {}));
    render(<SkillGraphPage />);
    expect(screen.getByText('图谱数据加载中...')).toBeDefined();
  });

  it('renders error state and can retry', async () => {
    getGraph.mockRejectedValueOnce(new Error('加载失败')).mockResolvedValueOnce({ skills: ['Java'] });
    render(<SkillGraphPage />);

    await screen.findByText('加载失败');
    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => expect(getGraph).toHaveBeenCalledTimes(2));
  });

  it('renders empty state when no skills', async () => {
    getGraph.mockResolvedValue({ skills: [] });
    render(<SkillGraphPage />);
    await screen.findByText('暂无技能图谱数据，请先上传并解析简历。');
  });

  it('renders graph state card and reset action with non-empty skills', async () => {
    getGraph.mockResolvedValue({ skills: ['Java', 'Spring'] });
    render(<SkillGraphPage />);

    await screen.findByRole('button', { name: '重置视图' });
    expect(screen.getByTestId('force-graph')).toBeDefined();
    expect(screen.getByText(/节点数：/)).toBeDefined();
    expect(screen.getByText(/连线数：/)).toBeDefined();
    expect(screen.getByText('88')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: '重置视图' }));
    expect(zoomToFitMock).toHaveBeenCalled();
  });

  it('updates focused node label on hover callback', async () => {
    getGraph.mockResolvedValue({ skills: ['Java'] });
    render(<SkillGraphPage />);

    await screen.findByRole('button', { name: '重置视图' });
    fireEvent.click(screen.getByRole('button', { name: 'trigger-hover' }));

    expect(screen.getByText(/当前聚焦节点：/)).toBeDefined();
    expect(screen.getByText('Java')).toBeDefined();
  });

  it('creates a wide first-screen layout instead of clustering at center', () => {
    const skills = Array.from({ length: 24 }, (_, index) => `Skill-${index + 1}`);
    const graphData = buildSkillGraphData(skills, 'alice', { width: 920, height: 620 });
    const skillNodes = graphData.nodes.filter((node) => node.kind === 'skill');
    const distances = skillNodes.map((node) => Math.hypot(node.x ?? 0, node.y ?? 0));

    expect(Math.min(...distances)).toBeGreaterThan(120);
    expect(Math.max(...distances)).toBeGreaterThan(250);
  });
});
