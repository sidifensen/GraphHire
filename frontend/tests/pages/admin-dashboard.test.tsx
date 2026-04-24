import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';

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
  });

  it('展示重构后的仪表盘核心区块', async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByText('概览数据')).toBeInTheDocument();
    expect(screen.getByText('待办与预警')).toBeInTheDocument();
    expect(screen.getByText('最近系统动态')).toBeInTheDocument();
    expect(screen.getByText('热门技能榜单 (Top 5)')).toBeInTheDocument();
  });
});
