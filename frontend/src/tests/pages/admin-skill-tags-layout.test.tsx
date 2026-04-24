import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/stores/auth-store', () => ({
  adminAuthStore: (selector: (state: { user: { username: string; type: string }; isAuthenticated: boolean }) => unknown) =>
    selector({
      user: { username: 'admin', type: 'ADMIN' },
      isAuthenticated: true,
    }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getSkillList: vi.fn().mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    }),
  },
}));

import AdminSkillTagsPage from '@/app/admin/skill-tags/page';

describe('AdminSkillTagsPage layout', () => {
  it('uses full width container without max width constraint', async () => {
    render(<AdminSkillTagsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '标签管理' })).toBeInTheDocument();
    });

    const heading = screen.getByRole('heading', { name: '标签管理' });
    const wrapper = heading.closest('div[class*="space-y-6"]');
    expect(wrapper?.className).toContain('w-full');
    expect(wrapper?.className).not.toContain('max-w-7xl');
  });
});
