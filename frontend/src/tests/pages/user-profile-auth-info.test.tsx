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

const { getProfileMock, getApplicationsMock, getFavoritesMock } = vi.hoisted(() => ({
  getProfileMock: vi.fn(),
  getApplicationsMock: vi.fn(),
  getFavoritesMock: vi.fn(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore,
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: getProfileMock,
    getApplications: getApplicationsMock,
    getFavorites: getFavoritesMock,
  },
}));

describe('User Profile auth info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfileMock.mockResolvedValue({
      realName: '测试姓名',
      email: 'test-user@example.com',
      avatarUrl: 'https://picsum.photos/100',
    });
    getApplicationsMock.mockResolvedValue([
      { id: 1, jobId: 1, status: 'VIEWED', appliedAt: '2026-05-01T00:00:00.000Z' },
      { id: 2, jobId: 2, status: 'INTERVIEW_INVITED', appliedAt: '2026-05-01T00:00:00.000Z' },
      { id: 3, jobId: 3, status: 'VIEWED', appliedAt: '2026-05-01T00:00:00.000Z' },
    ]);
    getFavoritesMock.mockResolvedValue({
      list: [],
      total: 7,
      page: 1,
      size: 10,
    });
  });

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
    expect(await screen.findByTestId('profile-stat-viewed')).toHaveTextContent('2');
    expect(screen.getByTestId('profile-stat-interview')).toHaveTextContent('1');
    expect(screen.getByTestId('profile-stat-favorite')).toHaveTextContent('7');
  });

  test('未登录时不请求统计接口并显示0', async () => {
    userAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });

    render(
      <ThemeProvider>
        <ProfilePage />
      </ThemeProvider>
    );

    expect(await screen.findByText('未登录用户')).toBeInTheDocument();
    expect(screen.getByTestId('profile-stat-viewed')).toHaveTextContent('0');
    expect(screen.getByTestId('profile-stat-interview')).toHaveTextContent('0');
    expect(screen.getByTestId('profile-stat-favorite')).toHaveTextContent('0');
    expect(getApplicationsMock).not.toHaveBeenCalled();
    expect(getFavoritesMock).not.toHaveBeenCalled();
  });
});
