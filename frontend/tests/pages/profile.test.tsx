import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/(user)/profile/page';

const getProfile = vi.fn();
const updateProfile = vi.fn();
const uploadAvatar = vi.fn();
const authStoreMock = vi.fn();
const updateUser = vi.fn();

vi.mock('@/components/UserLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="user-layout">{children}</div>,
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
  userAuthStore: {
    getState: () => ({ updateUser }),
  },
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: (...args: unknown[]) => getProfile(...args),
    updateProfile: (...args: unknown[]) => updateProfile(...args),
    uploadAvatar: (...args: unknown[]) => uploadAvatar(...args),
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
      email: 'profile@example.com',
      education: '硕士',
      school: '浙江大学',
      city: '杭州',
      targetCity: '上海',
      expectedSalary: 30000,
    });
    updateProfile.mockResolvedValue(undefined);
    uploadAvatar.mockResolvedValue('/person/avatar/public/1');
  });

  it('loads and renders profile from api', async () => {
    render(<ProfilePage />);
    expect(screen.getByText('个人资料加载中...')).toBeDefined();
    await screen.findByDisplayValue('林静宜');
    expect(screen.getByDisplayValue('13800138000')).toBeDefined();
    expect(screen.getByDisplayValue('profile@example.com')).toBeDefined();
    expect(screen.getByText('图谱认知引擎就绪')).toBeDefined();
  });

  it('saves profile changes', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');
    fireEvent.change(screen.getByDisplayValue('林静宜'), { target: { value: '林静宜P7' } });
    screen.getByText('保存全部修改').click();
    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
  });

  it('renders age field so users can edit age', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');
    expect(screen.getByDisplayValue('28')).toBeDefined();
  });

  it('sends null gender when selecting 未设置', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '0' } });
    screen.getByText('保存全部修改').click();

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ gender: null }));
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

  it('uploads avatar and updates preview', async () => {
    render(<ProfilePage />);
    await screen.findByDisplayValue('林静宜');

    const input = screen.getByLabelText('上传头像');
    const file = new File(['avatar'], 'user.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(uploadAvatar).toHaveBeenCalledWith(file));
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ avatarUrl: '/person/avatar/public/1' }));
  });
});
