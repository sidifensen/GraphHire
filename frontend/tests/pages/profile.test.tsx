import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/(user)/profile/page';

const getProfile = vi.fn();
const updateProfile = vi.fn();
const authStoreMock = vi.fn();

vi.mock('@/components/UserLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="user-layout">{children}</div>,
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: (...args: unknown[]) => getProfile(...args),
    updateProfile: (...args: unknown[]) => updateProfile(...args),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'real@example.com', type: 'PERSON' } }));
    getProfile.mockResolvedValue({
      id: 1,
      userId: 1,
      realName: '林静宜',
      gender: 2,
      age: 28,
      phone: '13800138000',
      education: '硕士',
      city: '杭州',
      targetCity: '上海',
      expectedSalary: 30000,
    });
    updateProfile.mockResolvedValue(undefined);
  });

  it('loads and renders profile from api', async () => {
    render(<ProfilePage />);
    expect(screen.getByText('个人资料加载中...')).toBeDefined();
    await screen.findByDisplayValue('林静宜');
    expect(screen.getByDisplayValue('13800138000')).toBeDefined();
    expect(screen.getByDisplayValue('real@example.com')).toBeDefined();
    expect(screen.getByText('图谱认知引擎就绪')).toBeDefined();
  });

  it('saves profile changes', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');
    screen.getByDisplayValue('林静宜').dispatchEvent(new Event('input', { bubbles: true }));
    (screen.getByDisplayValue('林静宜') as HTMLInputElement).value = '林静宜P7';
    screen.getByText('保存全部修改').click();
    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
  });

  it('renders error and retry states', async () => {
    getProfile.mockRejectedValueOnce(new Error('profile failed'));
    render(<ProfilePage />);
    await screen.findByText('profile failed');
    screen.getByText('重试').click();
    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(2));
  });

  it('shows save feedback', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');
    screen.getByText('保存全部修改').click();
    await screen.findByText('个人资料已保存');
  });
});