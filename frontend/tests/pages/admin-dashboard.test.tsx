import { beforeEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getDashboardStats).mockResolvedValue({
      totalUsers: 10,
      totalCompanies: 5,
      totalResumes: 8,
      totalJobs: 6,
      todayNewUsers: 2,
      todayNewJobs: 1,
      pendingCompanyAudit: 3,
      pendingTaskCount: 2,
      failedTaskCount: 1,
      matchCount: 4,
      taskSuccessRate: 88.8,
      weeklyNewCompanies: 2,
      pendingSkillSuggestions: 0,
      trend: [],
      userGrowthRate: 10,
      companyGrowthRate: 12,
      resumeGrowthRate: 15,
      jobGrowthRate: 5,
      matchGrowthRate: 9,
      matchConversionRate: 50,
      dailyActiveUsers: 7,
      updatedAt: '2026-04-26 12:00:00',
    });
  });

  it('展示重构后的仪表盘核心区块', async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByText('概览数据')).toBeInTheDocument();
    expect(screen.getByText('待办与预警')).toBeInTheDocument();
    expect(screen.getByText('最近系统动态')).toBeInTheDocument();
    expect(screen.getByText('热门技能榜单 (Top 5)')).toBeInTheDocument();
    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(adminApi.getDashboardStats).toHaveBeenCalledTimes(1);
  });
});
