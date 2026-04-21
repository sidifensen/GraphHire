import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getDashboardStats: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载成功时渲染真实统计数据', async () => {
    mockedAdminApi.getDashboardStats.mockResolvedValue({
      totalUsers: 100,
      totalCompanies: 20,
      totalResumes: 30,
      totalJobs: 40,
      todayNewUsers: 5,
      todayNewJobs: 6,
      pendingCompanyAudit: 7,
      pendingTaskCount: 8,
      failedTaskCount: 2,
      matchCount: 99,
      taskSuccessRate: 98.5,
      weeklyNewCompanies: 3,
      pendingSkillSuggestions: 4,
      trend: [{ date: '2026-04-21', activeUsers: 10, newData: 9 }],
    });

    render(<AdminDashboardPage />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
    expect(await screen.findByText('用户总数')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });

  it('加载失败时显示错误态', async () => {
    mockedAdminApi.getDashboardStats.mockRejectedValue(new Error('network error'));

    render(<AdminDashboardPage />);

    expect(await screen.findByText('加载失败，请重试')).toBeInTheDocument();
  });

  it('趋势为空时显示降级文案', async () => {
    mockedAdminApi.getDashboardStats.mockResolvedValue({
      totalUsers: 1,
      totalCompanies: 1,
      totalResumes: 1,
      totalJobs: 1,
      todayNewUsers: 0,
      todayNewJobs: 0,
      pendingCompanyAudit: 0,
      pendingTaskCount: 0,
      failedTaskCount: 0,
      matchCount: 0,
      taskSuccessRate: 0,
      weeklyNewCompanies: 0,
      pendingSkillSuggestions: 0,
      trend: [],
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByText('暂无趋势数据')).toBeInTheDocument();
  });
});
