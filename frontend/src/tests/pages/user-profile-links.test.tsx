import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import ProfilePage from '@/app/(user)/profile/page';
import { ThemeProvider } from '@/app/(user)/_mock/context/ThemeContext';

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: vi.fn().mockResolvedValue(null),
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
    expect(within(desktopMenu).getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(within(desktopMenu).getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
  });
});
