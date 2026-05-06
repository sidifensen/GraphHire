import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PersonalInfoPage from '@/app/(user)/personal-info/page';

const {
  getProfileMock,
  updateProfileMock,
  uploadAvatarMock,
  getPositionTypeTreeMock,
} = vi.hoisted(() => {
  return {
    getProfileMock: vi.fn(),
    updateProfileMock: vi.fn(),
    uploadAvatarMock: vi.fn(),
    getPositionTypeTreeMock: vi.fn(),
  };
});

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: getProfileMock,
    updateProfile: updateProfileMock,
    uploadAvatar: uploadAvatarMock,
  },
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      getPositionTypeTree: getPositionTypeTreeMock,
    },
  },
}));

describe('User PersonalInfo page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfileMock.mockResolvedValue({
      id: 1,
      userId: 11,
      realName: '张伟',
      gender: 1,
      age: 27,
      phone: '13800138000',
      email: 'zhangwei@example.com',
      education: '本科',
      school: '北京大学',
      city: '北京市',
      targetCity: '北京/上海',
      expectedSalary: 35000,
      avatarUrl: 'https://example.com/avatar-old.png',
      expectedPositionTypeIds: [100101, 100102],
      defaultPositionTypeId: 100101,
    });
    updateProfileMock.mockResolvedValue(undefined);
    uploadAvatarMock.mockResolvedValue('https://example.com/avatar-new.png');
    getPositionTypeTreeMock.mockResolvedValue([
      {
        id: 1000,
        name: '技术',
        children: [
          {
            id: 100100,
            name: '后端开发',
            children: [
              { id: 100101, name: 'Java开发工程师', children: [] },
              { id: 100102, name: 'Golang开发工程师', children: [] },
            ],
          },
        ],
      },
    ]);
  });

  it('loads profile fields from backend', async () => {
    render(<PersonalInfoPage />);

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveValue('张伟');
    expect(screen.getByLabelText('电话')).toHaveValue('13800138000');
    expect(screen.getByLabelText('邮箱')).toHaveValue('zhangwei@example.com');
    expect(screen.getByLabelText('所在城市')).toHaveValue('北京市');
    expect(screen.getByLabelText('目标城市')).toHaveValue('北京/上海');
    expect(screen.getByLabelText('期望薪资')).toHaveValue(35000);
    expect(screen.getAllByText('Java开发工程师').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Golang开发工程师').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('默认职位')).toHaveValue('100101');
  });

  it('keeps desktop sidebar alignment wrapper consistent with profile page', async () => {
    const { container } = render(<PersonalInfoPage />);

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

    const root = container.firstElementChild as HTMLElement | null;
    expect(root).not.toBeNull();
    expect(root).toHaveClass('px-5');
    expect(root).toHaveClass('md:px-8');
  });

  it('submits backend-shaped payload on save', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoPage />);

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

    await user.clear(screen.getByLabelText('姓名'));
    await user.type(screen.getByLabelText('姓名'), '李雷');
    await user.clear(screen.getByLabelText('电话'));
    await user.type(screen.getByLabelText('电话'), '13900001111');
    await user.clear(screen.getByLabelText('期望薪资'));
    await user.type(screen.getByLabelText('期望薪资'), '42000');
    await user.selectOptions(screen.getByLabelText('默认职位'), '100102');
    await user.click(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          realName: '李雷',
          gender: 1,
          age: 27,
          phone: '13900001111',
          email: 'zhangwei@example.com',
          education: '本科',
          school: '北京大学',
          city: '北京市',
          targetCity: '北京/上海',
          expectedSalary: 42000,
          expectedPositionTypeIds: [100101, 100102],
          defaultPositionTypeId: 100102,
        }),
      );
    });
  });

  it('uploads avatar and refreshes preview', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoPage />);

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByTestId('avatar-upload-input');
    await user.upload(input, file);

    await waitFor(() => expect(uploadAvatarMock).toHaveBeenCalledWith(file));
    await waitFor(() => {
      expect(screen.getByAltText('个人头像')).toHaveAttribute('src', 'https://example.com/avatar-new.png');
    });
  });

  it('rejects non-image avatar before api call', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PersonalInfoPage />);

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

    const file = new File(['avatar'], 'avatar.txt', { type: 'text/plain' });
    const input = screen.getByTestId('avatar-upload-input');
    await user.upload(input, file);

    expect(uploadAvatarMock).not.toHaveBeenCalled();
    expect(await screen.findByText('只能上传图片文件')).toBeInTheDocument();
  });
});
