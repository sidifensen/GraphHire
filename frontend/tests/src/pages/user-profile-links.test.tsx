import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import ProfilePage from '@/app/(user)/profile/page';
import { ThemeProvider } from '@/app/(user)/_mock/context/ThemeContext';

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: vi.fn().mockResolvedValue(null),
    getApplications: vi.fn().mockResolvedValue([]),
    getFavorites: vi.fn().mockResolvedValue([]),
  },
}));

describe('User Profile links', () => {
  it('uses corrected links for resume and graph', async () => {
    render(
      <ThemeProvider>
        <ProfilePage />
      </ThemeProvider>,
    );

    const desktopMenu = screen.getByRole('navigation', { name: '我的页面菜单' });
    const mobileMenu = screen.getByRole('navigation', { name: '我的页面移动菜单' });

    expect(desktopMenu).toBeInTheDocument();
    expect(mobileMenu).toBeInTheDocument();
    expect(within(desktopMenu).getByRole('link', { name: '个人主页' })).toHaveAttribute('href', '/profile');
    expect(within(desktopMenu).getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(within(desktopMenu).getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
    expect(within(desktopMenu).queryByRole('link', { name: '账号设置' })).not.toBeInTheDocument();
    expect(screen.queryByText('求职意向')).not.toBeInTheDocument();
    expect(screen.queryByText('界面偏好')).not.toBeInTheDocument();
    expect(screen.queryByText('账户操作')).not.toBeInTheDocument();
    expect(screen.queryByText('职业咨询')).not.toBeInTheDocument();
    expect(screen.queryByText('内推机会')).not.toBeInTheDocument();
  });
});
