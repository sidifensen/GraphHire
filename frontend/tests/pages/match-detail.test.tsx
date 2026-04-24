import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseParams = vi.fn();
const mockAuthStore = vi.fn();
const getMatchDetail = vi.fn();
const getJobById = vi.fn();
const getGraphScore = vi.fn();
const apply = vi.fn();
const getMyResumes = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: { user: { id: number } | null }) => unknown) => selector(mockAuthStore()),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getMatchDetail: (...args: unknown[]) => getMatchDetail(...args),
    apply: (...args: unknown[]) => apply(...args),
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

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: (...args: unknown[]) => getMyResumes(...args),
  },
}));

import MatchDetailPage from '@/app/(user)/match/[id]/page';

describe('MatchDetailPage apply feedback modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
    mockAuthStore.mockReturnValue({ user: { id: 100 } });

    getMatchDetail.mockResolvedValue({
      job: { title: '前端工程师', companyName: '图谱科技' },
      score: { total: 80, skillScore: 80, expScore: 75, eduScore: 70, salScore: 68, cityScore: 88 },
      matchReason: '匹配较高',
    });

    getJobById.mockResolvedValue({
      id: 1,
      title: '前端工程师',
      companyName: '图谱科技',
      city: '上海',
      requiredSkills: ['React'],
    });

    getGraphScore.mockResolvedValue({
      matchRate: 80,
      totalScore: 80,
      matchedSkills: ['React'],
      missingSkills: ['TypeScript'],
      matchLevel: '高匹配',
      reason: '技能契合',
    });

    getMyResumes.mockResolvedValue([
      { id: 99, fileName: '简历.pdf', isDefault: true },
    ]);

    apply.mockResolvedValue({ success: true });
  });

  it('shows custom success dialog instead of browser alert after apply', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(<MatchDetailPage />);

    await screen.findByText('立即投递');
    await user.click(screen.getByText('立即投递'));

    await screen.findByText('选择简历投递');
    await user.click(screen.getByText('确认投递'));

    await waitFor(() => {
      expect(screen.getByText('投递成功！')).toBeInTheDocument();
    });
    expect(alertSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
