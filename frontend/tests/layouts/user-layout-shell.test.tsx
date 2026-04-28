import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserLayoutClient from '@/app/(user)/UserLayoutClient';
import UserLayout from '@/components/layout/UserLayout';

vi.mock('@/components/layout/Header', () => ({
  default: () => <div data-testid="header-shell">GraphHire 图谱智聘</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <div data-testid="footer-shell">© 2026 GraphHire 图谱智聘. 认知导视 AI 招聘系统</div>,
}));

vi.mock('@/components/user/UserSidebar', () => ({
  default: () => <aside data-testid="sidebar">智聘空间</aside>,
}));

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe('user layout shell composition', () => {
  it('renders only one header and one footer when route layout wraps user layout', () => {
    // 设置 pathname 为需要显示 sidebar 的路由
    mockPathname.mockReturnValue('/profile');

    render(
      <UserLayoutClient>
        <UserLayout>
          <div>页面主体内容</div>
        </UserLayout>
      </UserLayoutClient>,
    );

    expect(screen.getAllByTestId('header-shell')).toHaveLength(1);
    expect(screen.getAllByTestId('footer-shell')).toHaveLength(1);
    expect(screen.getByText('智聘空间')).toBeInTheDocument();
    expect(screen.getByText('页面主体内容')).toBeInTheDocument();
  });
});
