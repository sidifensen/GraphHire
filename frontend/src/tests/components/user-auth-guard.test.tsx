import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserAuthGuard from '@/components/user/UserAuthGuard';

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => '/profile',
}));

type UserStoreState = {
  isAuthenticated: boolean;
  logout: () => void;
};

const { userAuthStore } = vi.hoisted(() => {
  const state: UserStoreState = {
    isAuthenticated: false,
    logout: vi.fn(),
  };
  const listeners = new Set<(nextState: UserStoreState) => void>();

  const store = ((selector?: (nextState: UserStoreState) => unknown) =>
    selector ? selector(state) : state) as unknown as {
    getState: () => UserStoreState;
    setState: (partial: Partial<UserStoreState>) => void;
    subscribe: (listener: (nextState: UserStoreState) => void) => () => void;
  } & ((selector?: (nextState: UserStoreState) => unknown) => unknown);

  store.getState = () => state;
  store.setState = (partial) => {
    Object.assign(state, partial);
    listeners.forEach((listener) => listener(state));
  };
  store.subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    userAuthStore: store,
  };
});

const { getContextMock } = vi.hoisted(() => ({
  getContextMock: vi.fn(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore,
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    getContext: getContextMock,
  },
}));

describe('UserAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userAuthStore.setState({
      isAuthenticated: false,
      logout: vi.fn(),
    });
  });

  it('redirects to login when not authenticated', async () => {
    render(
      <UserAuthGuard>
        <div>private-content</div>
      </UserAuthGuard>
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
    expect(getContextMock).not.toHaveBeenCalled();
    expect(screen.queryByText('private-content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and context is PERSON', async () => {
    userAuthStore.setState({
      isAuthenticated: true,
      logout: vi.fn(),
    });
    getContextMock.mockResolvedValue({ userType: 'PERSON' });

    render(
      <UserAuthGuard>
        <div>private-content</div>
      </UserAuthGuard>
    );

    expect(await screen.findByText('private-content')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
