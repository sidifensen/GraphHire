import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

let pathname = '/personal-info';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

describe('UserWorkbenchSidebar', () => {
  it('renders all menu entries and marks active item', () => {
    render(<UserWorkbenchSidebar />);

    expect(screen.getByRole('link', { name: '个人主页' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('href', '/personal-info');
    expect(screen.getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(screen.getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
    expect(screen.queryByRole('link', { name: '沟通消息' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '账号设置' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('aria-current', 'page');
  });

  it('marks 个人主页 active on /profile', () => {
    pathname = '/profile';
    render(<UserWorkbenchSidebar />);

    expect(screen.getByRole('link', { name: '个人主页' })).toHaveAttribute('aria-current', 'page');
  });

  it('uses transparent variant styles on skill graph route', () => {
    pathname = '/skill-graph';
    render(<UserWorkbenchSidebar />);

    const nav = screen.getByRole('navigation', { name: '我的页面菜单' });
    expect(nav.className).toContain('bg-transparent');
    expect(nav.className).toContain('backdrop-blur-[1px]');
  });
});
