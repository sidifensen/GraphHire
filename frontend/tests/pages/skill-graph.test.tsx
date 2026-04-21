import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SkillGraphPage from '@/app/(user)/skill-graph/page';

const getGraph = vi.fn();
const authStoreMock = vi.fn();

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getGraph: (...args: unknown[]) => getGraph(...args),
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
  });

  it('loads and renders graph data from api', async () => {
    render(<SkillGraphPage />);
    expect(screen.getByText('图谱数据加载中...')).toBeDefined();
    await screen.findByText('Java');
    expect(screen.getByText('Spring Boot')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('AI 综合能力评估')).toBeDefined();
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