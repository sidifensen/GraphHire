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
      gender: 1,
      age: 27,
      phone: '13800138000',
      email: 'test-user@example.com',
      education: '本科',
      school: '北京大学',
      city: '北京',
      targetCity: '上海',
      expectedSalary: 35000,
      avatarUrl: 'https://picsum.photos/100',
    });
    getApplicationsMock.mockResolvedValue([
      { id: 1, jobId: 1, status: 'VIEWED', appliedAt: '2026-05-01T00:00:00.000Z' },
      { id: 2, jobId: 2, status: 'INTERVIEW_INVITED', appliedAt: '2026-05-01T00:00:00.000Z' },
      { id: 3, jobId: 3, status: 'VIEWED', appliedAt: '2026-05-01T00:00:00.000Z' },
    ]);
    getFavoritesMock.mockResolvedValue(
      Array.from({ length: 7 }, (_, index) => ({
        id: index + 1,
        userId: 301,
        jobId: 1000 + index,
        createdAt: '2026-05-01T00:00:00.000Z',
      })),
    );
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
    expect(screen.getByText('男')).toBeInTheDocument();
    expect(screen.getByText('27 岁')).toBeInTheDocument();
    expect(screen.getByText('13800138000')).toBeInTheDocument();
    expect(screen.getByText('本科')).toBeInTheDocument();
    expect(screen.getByText('北京大学')).toBeInTheDocument();
    expect(screen.getByText('北京')).toBeInTheDocument();
    expect(screen.getByText('上海')).toBeInTheDocument();
    expect(screen.getByText('35000 元/月')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-row-basic')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-row-education')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info-row-intention')).toBeInTheDocument();
    expect(screen.getByText('性别 / 年龄 / 电话')).toBeInTheDocument();
    expect(screen.getByText('学历 / 学校 / 所在城市')).toBeInTheDocument();
    expect(screen.getByText('目标城市 / 期望薪资')).toBeInTheDocument();
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
