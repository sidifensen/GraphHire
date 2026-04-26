/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnterpriseHeader from '@/components/enterprise/EnterpriseHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/enterprise/dashboard'),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock auth-store
vi.mock('@/lib/stores/auth-store', () => ({
  authStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: 1, username: 'TestUser', type: 'company' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  enterpriseAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: 1, username: 'test@graphhire.com', email: 'test@graphhire.com', avatarUrl: 'https://cdn.example.com/avatar.png', type: 'company' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  userAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: 1, username: 'TestUser', type: 'company' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  adminAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: 1, username: 'TestUser', type: 'company' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  getAuthStoreByDomain: vi.fn(() => ({
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: 1, username: 'TestUser', type: 'company' },
      setAuth: vi.fn(),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  getAuthDomainByPath: vi.fn(() => 'enterprise'),
  getStorageKeyByDomain: vi.fn(() => 'auth-storage-enterprise'),
}));

describe('EnterpriseHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GraphHire logo text', () => {
    render(<EnterpriseHeader />);
    expect(screen.getByText(/图谱智聘/)).toBeDefined();
  });

  it('renders enterprise management badge', () => {
    render(<EnterpriseHeader />);
    expect(screen.getByText('企业管理中心')).toBeDefined();
  });

  it('renders dashboard navigation link', () => {
    render(<EnterpriseHeader />);
    const dashboardLink = screen.getByRole('link', { name: /工作台/ });
    expect(dashboardLink).toBeDefined();
    expect(dashboardLink.getAttribute('href')).toBe('/enterprise/dashboard');
  });

  it('renders job management navigation link', () => {
    render(<EnterpriseHeader />);
    const jobsLink = screen.getByRole('link', { name: /职位管理/ });
    expect(jobsLink).toBeDefined();
    expect(jobsLink.getAttribute('href')).toBe('/enterprise/jobs');
  });

  it('renders recommendations navigation link', () => {
    render(<EnterpriseHeader />);
    const recommendationsLink = screen.getByRole('link', { name: /候选人推荐/ });
    expect(recommendationsLink).toBeDefined();
    expect(recommendationsLink.getAttribute('href')).toBe('/enterprise/recommendations');
  });

  it('renders active enterprise nav motion indicator', () => {
    render(<EnterpriseHeader />);
    expect(screen.getByTestId('enterprise-nav-indicator')).toBeDefined();
  });

  it('renders employees management navigation link', () => {
    render(<EnterpriseHeader />);
    const employeesLink = screen.getByRole('link', { name: /员工管理/ });
    expect(employeesLink).toBeDefined();
    expect(employeesLink.getAttribute('href')).toBe('/enterprise/employees');
  });

  it('does not render notifications navigation link', () => {
    render(<EnterpriseHeader />);
    expect(screen.queryByRole('link', { name: /通知中心/ })).toBeNull();
  });

  it('renders account icon button', () => {
    render(<EnterpriseHeader />);
    const accountButton = screen.getByRole('button', { name: '账户菜单' });
    expect(accountButton).toBeDefined();
  });

  it('shows account email on the right side', () => {
    render(<EnterpriseHeader />);
    expect(screen.getByText('test@graphhire.com')).toBeDefined();
  });

  it('renders real avatar image when avatarUrl exists', () => {
    render(<EnterpriseHeader />);
    const avatar = screen.getByAltText('企业用户头像');
    expect(avatar).toBeDefined();
  });

  it('shows dropdown when account button is clicked', () => {
    render(<EnterpriseHeader />);
    const accountButton = screen.getByRole('button', { name: '账户菜单' });
    fireEvent.click(accountButton);
  });

  it('does not show settings item in account dropdown', () => {
    render(<EnterpriseHeader />);
    const accountButton = screen.getByRole('button', { name: '账户菜单' });
    fireEvent.click(accountButton);
    expect(screen.queryByText('设置')).toBeNull();
  });

  it('has correct navigation links structure', () => {
    render(<EnterpriseHeader />);
    const allLinks = screen.getAllByRole('link');
    expect(allLinks.length).toBeGreaterThanOrEqual(4);
  });
});
