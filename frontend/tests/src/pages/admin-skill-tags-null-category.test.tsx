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
      list: [
        {
          id: 1,
          name: 'Java',
          category: null,
          synonyms: null,
          jobCount: 12,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    createSkillTag: vi.fn().mockResolvedValue(undefined),
    updateSkillTag: vi.fn().mockResolvedValue(undefined),
    deleteSkillTag: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: unknown }) => <div>{children as any}</div>,
}));

import AdminSkillTagsPage from '@/app/admin/skill-tags/page';

describe('AdminSkillTagsPage null-safe rendering', () => {
  it('renders when synonyms is null and shows fallback label', async () => {
    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(screen.getByText('Java')).toBeInTheDocument();
    });

    expect(screen.getByText('无')).toBeInTheDocument();
  });
});
