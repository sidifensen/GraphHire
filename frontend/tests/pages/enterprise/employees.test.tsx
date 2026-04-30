import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmployeesPage from '@/app/enterprise/employees/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/enterprise/employees',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

describe('EmployeesPage', () => {
  it('renders migrated mock team page', () => {
    render(<EmployeesPage />);
    expect(screen.getAllByText('团队管理').length).toBeGreaterThan(0);
    expect(screen.getByText('员工列表')).toBeInTheDocument();
  });
});
