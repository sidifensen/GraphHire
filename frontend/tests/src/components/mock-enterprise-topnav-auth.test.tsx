import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

type EnterpriseState = {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    displayName?: string;
    type: 'PERSON' | 'COMPANY' | 'ADMIN';
    avatarUrl?: string | null;
  } | null;
  updateUser: (partial: Partial<NonNullable<EnterpriseState['user']>>) => void;
};

const { enterpriseAuthStore } = vi.hoisted(() => {
  const state: EnterpriseState = {
    isAuthenticated: false,
    user: null,
    updateUser: (partial) => {
      if (state.user) {
        state.user = { ...state.user, ...partial };
      }
    },
  };
  const listeners = new Set<(nextState: EnterpriseState) => void>();
  return {
    enterpriseAuthStore: {
      getState: () => state,
      setState: (partial: Partial<EnterpriseState>) => {
        Object.assign(state, partial);
        listeners.forEach((listener) => listener(state));
      },
      subscribe: (listener: (nextState: EnterpriseState) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  };
});

vi.mock('@/lib/stores/auth-store', () => ({
  enterpriseAuthStore,
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getInfo: vi.fn().mockResolvedValue(null),
  },
}));

const { logoutWithServerInvalidation } = vi.hoisted(() => ({
  logoutWithServerInvalidation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/logout', () => ({
  logoutWithServerInvalidation,
}));

import { TopNav } from '@/app/enterprise/_mock/components/TopNav';

describe('Enterprise TopNav auth display', () => {
  test('初始化时遵循已保存的 dark 主题，不应回退为 light', async () => {
    enterpriseAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 201,
        username: 'hr@graphhire.com',
        displayName: '测试企业',
        type: 'COMPANY',
      },
    });
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('dark');

    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  test('登录后显示企业名称与头像', () => {
    enterpriseAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 201,
        username: 'hr@graphhire.com',
        displayName: '测试企业',
        type: 'COMPANY',
        avatarUrl: 'https://picsum.photos/90',
      },
    });
    expect(enterpriseAuthStore.getState().isAuthenticated).toBe(true);

    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    expect(screen.getByText('测试企业')).toBeInTheDocument();
    expect(screen.getAllByAltText('企业用户头像').length).toBeGreaterThan(0);
  });

  test('点击企业头像展示退出登录菜单', () => {
    enterpriseAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 201,
        username: 'hr@graphhire.com',
        displayName: '测试企业',
        type: 'COMPANY',
      },
    });

    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    fireEvent.click(screen.getAllByRole('button', { name: '企业账户菜单' })[0]);

    expect(screen.getByRole('button', { name: '退出登录' })).toBeInTheDocument();
  });

  test('点击企业退出登录调用统一登出逻辑', async () => {
    enterpriseAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 201,
        username: 'hr@graphhire.com',
        displayName: '测试企业',
        type: 'COMPANY',
      },
    });

    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    fireEvent.click(screen.getAllByRole('button', { name: '企业账户菜单' })[0]);
    fireEvent.click(screen.getByRole('button', { name: '退出登录' }));

    await waitFor(() => {
      expect(logoutWithServerInvalidation).toHaveBeenCalledWith(expect.any(Function), '/login', 'enterprise');
    });
  });

  test('夜间模式按钮在移动端保持可见（不使用 hidden）', () => {
    enterpriseAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 201,
        username: 'hr@graphhire.com',
        displayName: '测试企业',
        type: 'COMPANY',
      },
    });

    render(<TopNav title="GraphHire 图谱智聘" userAvatar />);

    const darkModeButton = screen.getByTitle('切换夜间模式');
    expect(darkModeButton.className).not.toContain('hidden');
  });
});
