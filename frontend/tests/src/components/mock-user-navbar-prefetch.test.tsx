import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const prefetchMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: prefetchMock,
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore: {
    getState: () => ({
      isAuthenticated: false,
      user: null,
      updateUser: vi.fn(),
    }),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/lib/logout', () => ({
  logoutWithServerInvalidation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/app/(user)/_mock/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

import Navbar from '@/app/(user)/_mock/components/Navbar';

describe('MockUser Navbar prefetch', () => {
  test('挂载后会预热用户主导航路由，减少首跳编译等待', async () => {
    render(<Navbar />);

    await waitFor(() => {
      expect(prefetchMock).toHaveBeenCalledWith('/');
      expect(prefetchMock).toHaveBeenCalledWith('/jobs');
      expect(prefetchMock).toHaveBeenCalledWith('/companies');
      expect(prefetchMock).toHaveBeenCalledWith('/chat');
      expect(prefetchMock).toHaveBeenCalledWith('/profile');
    });
  });
});
