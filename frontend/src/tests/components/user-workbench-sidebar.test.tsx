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

    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('href', '/personal-info');
    expect(screen.getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(screen.getByRole('link', { name: '投递记录' })).toHaveAttribute('href', '/applications');
    expect(screen.getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
    expect(screen.getByRole('link', { name: '账号设置' })).toHaveAttribute('href', '#');

    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('aria-current', 'page');
  });
});
