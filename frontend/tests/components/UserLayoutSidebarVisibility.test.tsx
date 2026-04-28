import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserLayout from '@/components/layout/UserLayout';

const mockPush = vi.fn();
let mockPathname = '/jobs';

const mockState = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as { id: number; username: string; type: string } | null,
  isAuthenticated: false,
  setAuth: vi.fn(),
  logout: vi.fn(),
};

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => {
  const store = (selector?: (state: typeof mockState) => unknown) => {
    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  };
  return {
    authStore: store,
    userAuthStore: store,
    enterpriseAuthStore: store,
    adminAuthStore: store,
    getAuthStoreByDomain: () => ({ getState: () => mockState }),
    getAuthDomainByPath: () => 'user',
    getStorageKeyByDomain: () => 'auth-storage-user',
  };
});

describe('UserLayout sidebar visibility', () => {
  beforeEach(() => {
    mockPathname = '/jobs';
  });

  it.each([
    ['/jobs', '职位页面主体'],
    ['/companies', '公司页面主体'],
    ['/skill-graph', '图谱页面主体'],
  ])('hides personal sidebar on public browsing page %s', (pathname, content) => {
    mockPathname = pathname;

    render(
      <UserLayout>
        <div>{content}</div>
      </UserLayout>,
    );

    expect(screen.queryByText('个人资料')).not.toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it.each([
    ['/profile', '个人中心主体'],
    ['/resume/manage', '简历管理主体'],
    ['/resume/upload', '上传简历主体'],
  ])('shows personal sidebar on account page %s', (pathname, content) => {
    mockPathname = pathname;

    render(
      <UserLayout>
        <div>{content}</div>
      </UserLayout>,
    );

    expect(screen.getByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });
});
