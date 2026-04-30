import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

type UserState = {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    displayName?: string;
    type: 'PERSON' | 'COMPANY' | 'ADMIN';
    avatarUrl?: string | null;
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
    getProfile: vi.fn().mockResolvedValue(null),
  },
}));

import Navbar from '@/app/(user)/_mock/components/Navbar';

describe('MockUser Navbar auth display', () => {
  test('登录后显示用户名称和头像', () => {
    userAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 101,
        username: 'test-user@example.com',
        displayName: '测试求职者',
        type: 'PERSON',
        avatarUrl: 'https://picsum.photos/80',
      },
    });
    expect(userAuthStore.getState().isAuthenticated).toBe(true);

    render(<Navbar />);

    expect(screen.getByText('测试求职者')).toBeInTheDocument();
    expect(screen.getByAltText('用户头像')).toBeInTheDocument();
  });
});
