/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminHeader from '@/components/admin/AdminHeader';

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  adminAuthStore: (selector: (state: { user: { username: string; type: string } }) => unknown) =>
    selector({ user: { username: 'admin', type: 'ADMIN' } }),
}));

vi.mock('@/lib/logout', () => ({
  logoutWithServerInvalidation: vi.fn(async () => {}),
}));

describe('AdminHeader', () => {
  it('渲染管理员标题和头部结构', () => {
    const { container } = render(<AdminHeader />);
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('点击头像可打开下拉菜单', () => {
    render(<AdminHeader />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });
});
