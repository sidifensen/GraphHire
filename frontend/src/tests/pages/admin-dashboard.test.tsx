import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getDashboardStats: vi.fn(),
  },
}));

import AdminDashboardPage from '@/app/admin/dashboard/page';

describe('AdminDashboardPage', () => {
  it('renders dashboard static sections', async () => {
    vi.mocked(adminApi.getDashboardStats).mockResolvedValue({
      totalUsers: 11,
      totalCompanies: 6,
      totalResumes: 9,
      totalJobs: 7,
      todayNewUsers: 2,
      todayNewJobs: 1,
      pendingCompanyAudit: 3,
      pendingTaskCount: 2,
      failedTaskCount: 1,
      matchCount: 5,
      taskSuccessRate: 88.8,
      weeklyNewCompanies: 2,
      pendingSkillSuggestions: 0,
      trend: [],
      userGrowthRate: 10,
      companyGrowthRate: 12,
      resumeGrowthRate: 15,
      jobGrowthRate: 5,
      matchGrowthRate: 9,
      matchConversionRate: 55.6,
      dailyActiveUsers: 8,
      updatedAt: '2026-04-26 12:00:00',
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByText('概览数据')).toBeInTheDocument();
    expect(screen.getByText('待办与预警')).toBeInTheDocument();
    expect(screen.getByText('最近系统动态')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(adminApi.getDashboardStats).toHaveBeenCalledTimes(1);
  });
});
