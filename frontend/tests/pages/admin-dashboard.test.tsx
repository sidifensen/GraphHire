import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    getDashboardTrend: vi.fn(),
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
      activeOverview: {
        activeUserCount: 7,
        taskSuccessRate: 88.8,
        matchCount: 4,
      },
      todos: [
        {
          type: 'FAILED_TASK',
          title: '图谱构建任务失败预警',
          description: '失败任务 7 个，请优先排查失败日志。',
          actionText: '查看日志',
          actionPath: '/admin/task-monitor?status=FAILED',
          level: 'HIGH',
          count: 7,
          updatedAt: '2026-04-26 12:00:00',
        },
      ],
      hotSkills: [
        { name: 'Go', heat: 91 },
      ],
      systemActivities: [
        {
          type: 'TASK',
          actor: 'System',
          action: '解析任务失败',
          target: '#1001',
          detail: 'timeout',
          createdAt: '2026-04-26 11:30:00',
          level: 'HIGH',
        },
      ],
    });
    vi.mocked(adminApi.getDashboardTrend).mockResolvedValue([
      { date: '2026-04-26', activeUsers: 12, newData: 3 },
    ]);
  });

  it('展示重构后的仪表盘核心区块并渲染后端明细数据', async () => {
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
    expect(screen.getByText('失败任务 7 个，请优先排查失败日志。')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('#1001')).toBeInTheDocument();
    expect(screen.getByText('平台活跃趋势')).toBeInTheDocument();
    expect(adminApi.getDashboardStats).toHaveBeenCalledTimes(1);
    expect(adminApi.getDashboardTrend).toHaveBeenCalledWith('DAY');
  });

  it('点击周/月按钮会按参数切换趋势接口', async () => {
    vi.mocked(adminApi.getDashboardTrend).mockResolvedValue([
      { date: '2026-04-21 ~ 2026-04-27', activeUsers: 20, newData: 5 },
    ]);
    render(<AdminDashboardPage />);
    await screen.findByText('平台活跃趋势');
    fireEvent.click(screen.getByRole('button', { name: '周' }));
    expect(adminApi.getDashboardTrend).toHaveBeenCalledWith('WEEK');
    fireEvent.click(screen.getByRole('button', { name: '月' }));
    expect(adminApi.getDashboardTrend).toHaveBeenCalledWith('MONTH');
  });
});
