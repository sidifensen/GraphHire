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
    getSettings: vi.fn().mockResolvedValue({
      allowRegister: true,
      maintenanceMode: false,
      maxUploadSizeMb: 10,
    }),
    updateSettings: vi.fn(),
  },
}));

import AdminSettingsPage from '@/app/admin/settings/page';

describe('AdminSettingsPage layout', () => {
  it('uses the unified admin shell main container style', async () => {
    render(<AdminSettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '系统设置' })).toBeInTheDocument();
    });
    const heading = screen.getByRole('heading', { name: '系统设置' });
    const main = heading.closest('main');
    expect(main?.className).toContain('bg-slate-50');
  });
});
