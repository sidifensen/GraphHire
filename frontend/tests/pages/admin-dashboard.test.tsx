import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

  it('加载数据时渲染页面结构', async () => {
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

    const { container } = render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(container.querySelector('[class*="grid"]')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('页面包含数据总览标题', async () => {
    mockedAdminApi.getDashboardStats.mockResolvedValue({
      totalUsers: 1, totalCompanies: 1, totalResumes: 1, totalJobs: 1,
      todayNewUsers: 0, todayNewJobs: 0, pendingCompanyAudit: 0,
      pendingTaskCount: 0, failedTaskCount: 0, matchCount: 0,
      taskSuccessRate: 0, weeklyNewCompanies: 0, pendingSkillSuggestions: 0, trend: [],
    });

    const { getByText } = render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(getByText('数据总览')).toBeTruthy();
    }, { timeout: 3000 });
  });
});
