/// <reference types="vitest/globals" />
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const prefetchSpy = vi.fn();
const usePathname = vi.fn(() => '/admin/dashboard');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: prefetchSpy,
  }),
  usePathname: () => usePathname(),
}));

describe('AdminSidebar route prefetch', () => {
  it('挂载后会主动预取后台导航路由，降低首次点击等待', () => {
    render(<AdminSidebar isCollapsed={false} />);

    expect(prefetchSpy).toHaveBeenCalledWith('/admin/dashboard');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/enterprise-review');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/users');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/skill-tags');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/industry');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/position-types');
    expect(prefetchSpy).toHaveBeenCalledWith('/admin/task-monitor');
  });
});
