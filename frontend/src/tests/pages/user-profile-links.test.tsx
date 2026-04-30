import { render, screen } from '@testing-library/react';
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

    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(screen.getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
  });
});
