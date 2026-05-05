import { render, screen, waitFor } from '@testing-library/react';
import ResumeManagePage from '@/app/(user)/resume/manage/page';
import UserChatListPage from '@/app/(user)/chat/page';
import SkillGraphPage from '@/app/(user)/skill-graph/page';
import PersonalInfoPage from '@/app/(user)/personal-info/page';
import { vi } from 'vitest';

const {
  getMyResumesMock,
  listConversationsMock,
  getProfileMock,
} = vi.hoisted(() => ({
  getMyResumesMock: vi.fn(),
  listConversationsMock: vi.fn(),
  getProfileMock: vi.fn(),
}));

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: getMyResumesMock,
    setDefault: vi.fn(),
    parse: vi.fn(),
    uploadWithProgress: vi.fn(),
    delete: vi.fn(),
    preview: vi.fn(),
  },
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: getProfileMock,
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    getFavorites: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/api/chat', () => ({
  chatApi: {
    listConversations: listConversationsMock,
  },
}));

function expectMaxWidthContainerWithoutHorizontalPadding(layoutMenu: HTMLElement) {
  const maxWidthContainer = layoutMenu.closest('.max-w-7xl') as HTMLElement | null;
  expect(maxWidthContainer).not.toBeNull();
  expect(maxWidthContainer).not.toHaveClass('p-5');
  expect(maxWidthContainer).not.toHaveClass('px-5');
  expect(maxWidthContainer).not.toHaveClass('md:px-8');
}

describe('User workbench desktop layout consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyResumesMock.mockResolvedValue([]);
    listConversationsMock.mockResolvedValue([]);
    getProfileMock.mockResolvedValue(null);
  });

  it('keeps resume manage page desktop wrapper consistent with personal info page', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    getMyResumesMock.mockClear();
    render(<ResumeManagePage />);
    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
  });

  it('chat page can render independently without workbench sidebar wrapper', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    listConversationsMock.mockClear();
    render(<UserChatListPage />);
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('heading', { name: '沟通消息' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索会话...')).toBeInTheDocument();
  });

  it('keeps skill graph page desktop wrapper consistent with personal info page', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    render(<SkillGraphPage />);
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
  });
});
