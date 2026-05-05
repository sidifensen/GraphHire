import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EnterpriseRecommendationsPage from '@/app/enterprise/recommendations/page';

const { getJobListMock, getRecommendedResumesMock, triggerJobMatchMock } = vi.hoisted(() => ({
  getJobListMock: vi.fn(),
  getRecommendedResumesMock: vi.fn(),
  triggerJobMatchMock: vi.fn(),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobList: getJobListMock,
    getRecommendedResumes: getRecommendedResumesMock,
    triggerJobMatch: triggerJobMatchMock,
  },
}));

describe('enterprise recommendations layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getJobListMock.mockResolvedValue([
      {
        id: 101,
        title: '前端工程师',
        city: '上海',
        status: 'PUBLISHED',
        matchCount: 2,
        viewCount: 0,
        applyCount: 0,
      },
    ]);
    getRecommendedResumesMock.mockResolvedValue([
      {
        resumeId: 501,
        jobId: 101,
        score: {
          total: 88,
          skillScore: 86,
          requirementScore: 84,
        },
        resume: {
          id: 501,
          userName: '候选人A',
          fileName: '候选人A-简历.pdf',
          skills: ['React', 'TypeScript'],
          education: '本科',
          experience: '3年',
        },
      },
    ]);
    triggerJobMatchMock.mockResolvedValue(undefined);
  });

  it('keeps desktop shell fixed and delegates vertical scroll to inner columns', async () => {
    render(<EnterpriseRecommendationsPage />);

    await waitFor(() => expect(getJobListMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getRecommendedResumesMock).toHaveBeenCalledWith({ jobId: 101 }));

    const root = screen.getByTestId('enterprise-recommendations-root');
    const main = screen.getByTestId('enterprise-recommendations-main');
    const jobScroll = screen.getByTestId('enterprise-recommendations-job-scroll');
    const candidateScroll = screen.getByTestId('enterprise-recommendations-candidate-scroll');

    expect(root.className).toContain('h-full');
    expect(root.className).not.toContain('h-screen');
    expect(main.className).toContain('overflow-hidden');
    expect(jobScroll.className).toContain('overflow-y-auto');
    expect(candidateScroll.className).toContain('overflow-y-auto');
  });
});
