import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

const { pathnameMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(() => '/admin/dashboard'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}));

vi.mock('@/lib/stores/auth-store', () => {
  const state = {
    isAuthenticated: true,
    logout: vi.fn(),
  };
  const listeners = new Set<(nextState: typeof state) => void>();

  const store = ((selector?: (nextState: typeof state) => unknown) =>
    selector ? selector(state) : state) as unknown as {
    getState: () => typeof state;
    subscribe: (listener: (nextState: typeof state) => void) => () => void;
  } & ((selector?: (nextState: typeof state) => unknown) => unknown);

  store.getState = () => state;
  store.subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    adminAuthStore: store,
  };
});

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    getContext: vi.fn().mockResolvedValue({ userType: 'ADMIN' }),
  },
}));

describe('admin layout shell auth integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('protects dashboard route and renders shell', async () => {
    pathnameMock.mockReturnValue('/admin/dashboard');
    render(
      <AdminLayoutShell>
        <div>dashboard-page</div>
      </AdminLayoutShell>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    });
  });

  it('protects login route but does not render shell wrapper', async () => {
    pathnameMock.mockReturnValue('/admin/login');
    render(
      <AdminLayoutShell>
        <div>login-page</div>
      </AdminLayoutShell>,
    );
    await waitFor(() => {
      expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
    });
  });
});
