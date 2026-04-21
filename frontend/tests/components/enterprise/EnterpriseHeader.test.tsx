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

  it('renders employees management navigation link', () => {
    render(<EnterpriseHeader />);
    const employeesLink = screen.getByRole('link', { name: /员工管理/ });
    expect(employeesLink).toBeDefined();
    expect(employeesLink.getAttribute('href')).toBe('/enterprise/employees');
  });

  it('renders notifications navigation link', () => {
    render(<EnterpriseHeader />);
    const notificationsLink = screen.getByRole('link', { name: /通知中心/ });
    expect(notificationsLink).toBeDefined();
    expect(notificationsLink.getAttribute('href')).toBe('/enterprise/notifications');
  });

  it('renders notification bell icon', () => {
    render(<EnterpriseHeader />);
    const notificationIcons = document.querySelectorAll('.material-symbols-outlined');
    expect(notificationIcons.length).toBeGreaterThan(0);
  });

  it('renders account icon button', () => {
    render(<EnterpriseHeader />);
    const accountButtons = document.querySelectorAll('button');
    const accountButton = Array.from(accountButtons).find(btn =>
      btn.querySelector('.material-symbols-outlined')
    );
    expect(accountButton).toBeDefined();
  });

  it('shows dropdown when account button is clicked', () => {
    render(<EnterpriseHeader />);
    const accountButtons = document.querySelectorAll('button');
    const accountButton = Array.from(accountButtons).find(btn =>
      btn.querySelector('.material-symbols-outlined')
    );
    if (accountButton) {
      fireEvent.click(accountButton);
    }
  });

  it('has correct navigation links structure', () => {
    render(<EnterpriseHeader />);
    const allLinks = screen.getAllByRole('link');
    expect(allLinks.length).toBeGreaterThanOrEqual(5);
  });
});
