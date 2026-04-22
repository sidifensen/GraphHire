import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';
import AdminRootPage from '@/app/admin/page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('AdminRootPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('访问 /admin 时应重定向到 /admin/dashboard', () => {
    AdminRootPage();

    expect(redirect).toHaveBeenCalledWith('/admin/dashboard');
  });
});
