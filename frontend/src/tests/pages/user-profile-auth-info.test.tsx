import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProfilePage from '@/app/(user)/profile/page';
import { ThemeProvider } from '@/app/(user)/_mock/context/ThemeContext';

type UserState = {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    displayName?: string;
    type: 'PERSON' | 'COMPANY' | 'ADMIN';
    avatarUrl?: string | null;
    email?: string;
  } | null;
  updateUser: (partial: Partial<NonNullable<UserState['user']>>) => void;
};

const { userAuthStore } = vi.hoisted(() => {
  const state: UserState = {
    isAuthenticated: false,
    user: null,
    updateUser: (partial) => {
      if (state.user) {
        state.user = { ...state.user, ...partial };
      }
    },
  };
  const listeners = new Set<(nextState: UserState) => void>();
  return {
    userAuthStore: {
      getState: () => state,
      setState: (partial: Partial<UserState>) => {
        Object.assign(state, partial);
        listeners.forEach((listener) => listener(state));
      },
      subscribe: (listener: (nextState: UserState) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  };
});

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore,
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: vi.fn().mockResolvedValue({
      realName: '测试姓名',
      email: 'test-user@example.com',
      avatarUrl: 'https://picsum.photos/100',
    }),
  },
}));

describe('User Profile auth info', () => {
  test('显示当前登录用户对应资料', async () => {
    userAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 301,
        username: 'test-user@example.com',
        displayName: '测试求职者',
        type: 'PERSON',
      },
    });
    expect(userAuthStore.getState().isAuthenticated).toBe(true);

    render(
      <ThemeProvider>
        <ProfilePage />
      </ThemeProvider>
    );

    expect(await screen.findByText('测试姓名')).toBeInTheDocument();
    expect(screen.getByText('test-user@example.com')).toBeInTheDocument();
  });
});
