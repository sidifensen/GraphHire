import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';

describe('admin rewrite static template', () => {
  it('renders login hero section', async () => {
    const LoginPage = (await import('@/app/admin/login/page')).default;
    render(<LoginPage />);

    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('开启 AI 智能'))).toBeInTheDocument();
  }, 15000);

  it('renders dashboard overview widgets', async () => {
    const DashboardPage = (await import('@/app/admin/dashboard/page')).default;
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    );

    expect(screen.getByText('概览数据')).toBeInTheDocument();
    expect(screen.getByText('平台活跃趋势')).toBeInTheDocument();
    expect(screen.getByText('热门技能榜单 (Top 5)')).toBeInTheDocument();
  }, 15000);
});
