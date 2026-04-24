import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getDashboardStats: vi.fn(),
  },
}));

import AdminDashboardPage from '@/app/admin/dashboard/page';

describe('AdminDashboardPage', () => {
  it('renders dashboard static sections', async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByText('概览数据')).toBeInTheDocument();
    expect(screen.getByText('待办与预警')).toBeInTheDocument();
    expect(screen.getByText('最近系统动态')).toBeInTheDocument();
  });
});
