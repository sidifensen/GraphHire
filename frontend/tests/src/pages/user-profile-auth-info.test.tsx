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

const { getProfileMock, listConversationsMock } = vi.hoisted(() => ({
  getProfileMock: vi.fn(),
  listConversationsMock: vi.fn(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore,
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: getProfileMock,
  },
}));

vi.mock('@/lib/api/chat', () => ({
  chatApi: {
    listConversations: listConversationsMock,
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
    listConversationsMock.mockResolvedValue([
      { conversationId: 1, unreadCount: 2 },
      { conversationId: 2, unreadCount: 1 },
      { conversationId: 3, unreadCount: 0 },
    ]);
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
    expect(await screen.findByTestId('profile-stat-conversation')).toHaveTextContent('3');
    expect(screen.getByTestId('profile-stat-unread')).toHaveTextContent('3');
    expect(screen.queryByTestId('profile-stat-favorite')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('profile-stat-conversation')).toHaveTextContent('0');
    expect(screen.getByTestId('profile-stat-unread')).toHaveTextContent('0');
    expect(listConversationsMock).not.toHaveBeenCalled();
  });
});
