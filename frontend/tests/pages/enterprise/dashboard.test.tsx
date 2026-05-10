import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EnterpriseDashboardPage from '@/app/enterprise/dashboard/page';

const hoisted = vi.hoisted(() => ({
  companyApiMock: {
    getDashboard: vi.fn(),
  },
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: hoisted.companyApiMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/enterprise/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

describe('EnterpriseDashboardPage', () => {
  // 业务意图：锁定“工作台必须走真实后端接口”的联调契约，防止回退到本地 mock。
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads dashboard metrics and recent jobs from companyApi', async () => {
    hoisted.companyApiMock.getDashboard.mockResolvedValue({
      pendingConversationCount: 24,
      newMatchCandidateCount: 156,
      activeJobCount: 12,
      recentJobs: [
        {
          id: 101,
          title: '后端开发工程师',
          department: '技术部',
          applyCount: 3,
          matchCount: 8,
          status: 'PUBLISHED',
          publishedAt: '2026-05-10T09:00:00',
        },
      ],
    });

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(hoisted.companyApiMock.getDashboard).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('24')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('后端开发工程师')).toBeInTheDocument();
    expect(screen.getByText('招聘中')).toBeInTheDocument();
    expect(screen.getByText('8 候选人')).toBeInTheDocument();
    expect(screen.getByText('3 新会话')).toBeInTheDocument();
  });

  it('shows fallback error when dashboard api fails', async () => {
    hoisted.companyApiMock.getDashboard.mockRejectedValue(new Error('服务异常'));

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(hoisted.companyApiMock.getDashboard).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('服务异常')).toBeInTheDocument();
  });
});
