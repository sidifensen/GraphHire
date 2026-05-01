import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const { logoutWithServerInvalidation } = vi.hoisted(() => ({
  logoutWithServerInvalidation: vi.fn().mockResolvedValue(undefined),
}));

const { toggleThemeMock } = vi.hoisted(() => ({
  toggleThemeMock: vi.fn(),
}));

vi.mock('@/lib/logout', () => ({
  logoutWithServerInvalidation,
}));

vi.mock('@/app/(user)/_mock/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: toggleThemeMock,
  }),
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

  test('点击用户头像展示退出登录菜单', () => {
    userAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 101,
        username: 'test-user@example.com',
        displayName: '测试求职者',
        type: 'PERSON',
      },
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: '用户账户菜单' }));

    expect(screen.getByRole('button', { name: '退出登录' })).toBeInTheDocument();
  });

  test('点击用户退出登录调用统一登出逻辑', async () => {
    userAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 101,
        username: 'test-user@example.com',
        displayName: '测试求职者',
        type: 'PERSON',
      },
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: '用户账户菜单' }));
    fireEvent.click(screen.getByRole('button', { name: '退出登录' }));

    await waitFor(() => {
      expect(logoutWithServerInvalidation).toHaveBeenCalledWith(expect.any(Function), '/login', 'user');
    });
  });

  test('右上角显示夜间模式切换图标并可触发切换', () => {
    userAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });

    render(<Navbar />);

    const themeToggleButton = screen.getByRole('button', { name: '切换夜间模式' });
    fireEvent.click(themeToggleButton);

    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
