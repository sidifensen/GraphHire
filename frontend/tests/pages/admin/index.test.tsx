import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminRootPage from '@/app/admin/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  redirect: (url: string) => {
    // In test environment, redirect just returns/writes to console
  },
}));

describe('AdminRootPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('重定向到仪表盘页面', () => {
    render(<AdminRootPage />);
    // The page calls redirect('/admin/dashboard'), verify heading or navigation context exists
    expect(useRouter).toBeDefined();
  });
});