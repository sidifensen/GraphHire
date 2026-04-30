import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnterpriseDashboardPage from '@/app/enterprise/dashboard/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/enterprise/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

describe('EnterpriseDashboardPage', () => {
  it('renders migrated mock dashboard copy', () => {
    render(<EnterpriseDashboardPage />);
    expect(screen.getByText('欢迎回来，HR')).toBeInTheDocument();
    expect(screen.getByText('这是您今天的招聘数据概览。')).toBeInTheDocument();
  });
});
