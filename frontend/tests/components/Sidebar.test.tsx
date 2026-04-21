import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

// Mock next/navigation for Sidebar
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe('Sidebar', () => {
  it('renders sidebar title', () => {
    render(<Sidebar />);
    expect(screen.getByText('智聘空间')).toBeDefined();
  });

  it('renders sidebar subtitle', () => {
    render(<Sidebar />);
    expect(screen.getByText('AI 驱动的职业导航')).toBeDefined();
  });

  it('renders navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('个人资料')).toBeDefined();
    expect(screen.getByText('简历管理')).toBeDefined();
    expect(screen.getByText('投递记录')).toBeDefined();
    expect(screen.getByText('我的图谱')).toBeDefined();
    expect(screen.getByText('账号设置')).toBeDefined();
  });

  it('renders update resume button', () => {
    render(<Sidebar />);
    expect(screen.getByText('更新简历')).toBeDefined();
  });
});
