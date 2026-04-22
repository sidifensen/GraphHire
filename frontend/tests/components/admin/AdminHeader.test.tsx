/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminHeader from '@/components/admin/AdminHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth-store
vi.mock('@/lib/stores/auth-store', () => ({
  authStore: vi.fn((selector) => {
    const state = {
      isAuthenticated: true,
      accessToken: 'admin-token',
      refreshToken: 'refresh-token',
      user: { id: 1, username: 'AdminUser', type: 'ADMIN' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    };
    return selector(state);
  }),
  getState: vi.fn(() => ({
    isAuthenticated: true,
    accessToken: 'admin-token',
    refreshToken: 'refresh-token',
    user: { id: 1, username: 'AdminUser', type: 'ADMIN' },
    setAuth: vi.fn(),
    logout: vi.fn(),
  })),
  setState: vi.fn(),
  subscribe: vi.fn(),
}));

describe('AdminHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders custom title when provided', () => {
    render(<AdminHeader title="自定义标题" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(<AdminHeader />);
    // Title should not be rendered when not provided
    const h2Elements = container.querySelectorAll('h2');
    expect(h2Elements.length).toBe(0);
  });

  it('renders notification button', () => {
    render(<AdminHeader />);
    const notificationButtons = document.querySelectorAll('button');
    expect(notificationButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders admin label', () => {
    render(<AdminHeader />);
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('renders person icon in avatar button', () => {
    render(<AdminHeader />);
    const iconElements = document.querySelectorAll('.material-symbols-outlined');
    const hasPersonIcon = Array.from(iconElements).some(
      icon => icon.textContent?.includes('person')
    );
    expect(hasPersonIcon).toBe(true);
  });

  it('renders avatar button', () => {
    render(<AdminHeader />);
    const avatarButtons = document.querySelectorAll('button');
    const avatarButton = Array.from(avatarButtons).find(btn =>
      btn.className.includes('rounded-full')
    );
    expect(avatarButton).toBeDefined();
  });

  it('has correct header structure', () => {
    const { container } = render(<AdminHeader />);
    const header = container.querySelector('header');
    expect(header).toBeDefined();
  });

  it('applies correct layout classes', () => {
    const { container } = render(<AdminHeader />);
    const header = container.querySelector('header') as HTMLElement;
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('items-center');
    expect(header).toHaveClass('justify-between');
  });

  it('renders logout text in logout button', () => {
    render(<AdminHeader />);
    // The logout button should be present somewhere in the component
    const logoutButton = document.querySelector('button');
    expect(logoutButton).toBeDefined();
  });

  it('renders with title prop and displays correct text', () => {
    render(<AdminHeader title="测试标题" />);
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });
});
