import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserChatListPage from '@/app/(user)/chat/page';
import UserChatDetailPage from '@/app/(user)/chat/[conversationId]/page';
import EnterpriseChatListPage from '@/app/enterprise/chat/page';
import EnterpriseChatDetailPage from '@/app/enterprise/chat/[conversationId]/page';
import { vi } from 'vitest';

const pushMock = vi.fn();
const { useParamsMock } = vi.hoisted(() => ({
  useParamsMock: vi.fn(() => ({})),
}));

const {
  listConversationsMock,
  listMessagesMock,
  sendTextMock,
  sendResumeMock,
  sendImageMock,
  sendInterviewInviteMock,
  downloadResumeMock,
  previewImageMock,
  markReadMock,
  getMyResumesMock,
  getPublicJobByIdMock,
  getPublicCompanyByIdMock,
  getEnterpriseJobDetailMock,
} = vi.hoisted(() => ({
  listConversationsMock: vi.fn(),
  listMessagesMock: vi.fn(),
  sendTextMock: vi.fn(),
  sendResumeMock: vi.fn(),
  sendImageMock: vi.fn(),
  sendInterviewInviteMock: vi.fn(),
  downloadResumeMock: vi.fn(),
  previewImageMock: vi.fn(),
  markReadMock: vi.fn(),
  getMyResumesMock: vi.fn(),
  getPublicJobByIdMock: vi.fn(),
  getPublicCompanyByIdMock: vi.fn(),
  getEnterpriseJobDetailMock: vi.fn(),
}));

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    useParams: useParamsMock,
    useRouter: () => ({
      push: pushMock,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

vi.mock('@/lib/api/chat', () => ({
  chatApi: {
    listConversations: listConversationsMock,
    listMessages: listMessagesMock,
    sendText: sendTextMock,
    sendResume: sendResumeMock,
    sendImage: sendImageMock,
    sendInterviewInvite: sendInterviewInviteMock,
    downloadResume: downloadResumeMock,
    previewImage: previewImageMock,
    getResumeDownloadUrl: vi.fn((conversationId: number, resumeId: number) => `/chat/conversations/${conversationId}/resume/${resumeId}/download`),
    markRead: markReadMock,
  },
}));

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: getMyResumesMock,
  },
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      getById: getPublicJobByIdMock,
    },
    companies: {
      getById: getPublicCompanyByIdMock,
    },
  },
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getJobDetail: getEnterpriseJobDetailMock,
  },
}));

vi.mock('@/lib/stores/auth-store', () => {
  const createStore = (user: { id: number; username: string; displayName?: string; avatarUrl?: string | null }) => {
    let state = {
      accessToken: 'token',
      refreshToken: 'refresh',
      user,
      isAuthenticated: true,
    };
    const store = ((selector?: (nextState: typeof state) => unknown) => {
      if (!selector) {
        return state;
      }
      return selector(state);
    }) as ((selector?: (nextState: typeof state) => unknown) => unknown) & {
      getState: () => typeof state;
      setState: (partial: Partial<typeof state>) => void;
      subscribe: (listener: (nextState: typeof state) => void) => () => void;
    };
    const listeners = new Set<(nextState: typeof state) => void>();
    store.getState = () => state;
    store.setState = (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener(state));
    };
    store.subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    return store;
  };

  const userStore = createStore({ id: 10, username: 'candidate', displayName: '候选人A', avatarUrl: null });
  const enterpriseStore = createStore({ id: 20, username: 'recruiter', displayName: '招聘方A', avatarUrl: null });
  const adminStore = createStore({ id: 1, username: 'admin', displayName: '管理员', avatarUrl: null });

  return {
    authStore: userStore,
    userAuthStore: userStore,
    enterpriseAuthStore: enterpriseStore,
    adminAuthStore: adminStore,
  };
});

function mockConversationList() {
  listConversationsMock.mockResolvedValue([
    {
      conversationId: 1,
      jobId: 101,
      jobTitle: '前端工程师',
      companyId: 9,
      companyName: '图谱科技',
      recruiterUserId: 20,
      candidateUserId: 10,
      candidateName: '小王',
      candidateEmail: 'candidate@example.com',
      candidateAge: 26,
      candidateGender: 1,
      candidateEducation: '本科',
      recruiterName: '陈HR',
      lastMessagePreview: '你好，方便沟通吗',
      lastMessageTime: '2026-05-04T09:12:00',
      unreadCount: 2,
    },
  ]);
}

function mockConversationListReadAfterOpen() {
  listConversationsMock
    .mockResolvedValueOnce([
      {
        conversationId: 1,
        jobId: 101,
        jobTitle: '前端工程师',
        companyId: 9,
        companyName: '图谱科技',
        recruiterUserId: 20,
        candidateUserId: 10,
        candidateName: '小王',
        candidateEmail: 'candidate@example.com',
        candidateAge: 26,
        candidateGender: 1,
        candidateEducation: '本科',
        recruiterName: '陈HR',
        lastMessagePreview: '你好，方便沟通吗',
        lastMessageTime: '2026-05-04T09:12:00',
        unreadCount: 2,
      },
    ]);
}

function mockMessageList() {
  listMessagesMock.mockResolvedValue([
    {
      id: 3,
      conversationId: 1,
      senderUserId: 20,
      receiverUserId: 10,
      messageType: 1,
      content: '今天方便沟通吗？',
      ext: null,
      recalled: 0,
      createTime: '2026-05-04T09:12:00',
    },
    {
      id: 2,
      conversationId: 1,
      senderUserId: 10,
      receiverUserId: 20,
      messageType: 1,
      content: '可以的',
      ext: null,
      recalled: 0,
      createTime: '2026-05-04T09:10:00',
    },
    {
      id: 1,
      conversationId: 1,
      senderUserId: 20,
      receiverUserId: 10,
      messageType: 1,
      content: '你好，我是招聘负责人',
      ext: null,
      recalled: 0,
      createTime: '2026-05-03T20:08:00',
    },
  ]);
}

describe('chat workspace redesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({});
    mockConversationList();
    mockMessageList();
    sendTextMock.mockResolvedValue({ messageId: 88 });
    sendResumeMock.mockResolvedValue({ messageId: 89 });
    sendImageMock.mockResolvedValue({ messageId: 90 });
    sendInterviewInviteMock.mockResolvedValue({ messageId: 91 });
    downloadResumeMock.mockResolvedValue({
      blob: new Blob(['resume'], { type: 'application/pdf' }),
      fileName: '25年简历测试.pdf',
    });
    previewImageMock.mockResolvedValue({
      blob: new Blob(['image-bytes'], { type: 'image/jpeg' }),
      contentType: 'image/jpeg',
    });
    markReadMock.mockResolvedValue(undefined);
    getMyResumesMock.mockResolvedValue([
      {
        id: 501,
        fileName: '默认简历.pdf',
        fileUrl: '/files/default-resume.pdf',
        status: 'COMPLETED',
        skillTags: [],
        isDefault: true,
        createdAt: '2026-05-01T10:00:00',
        updatedAt: '2026-05-01T10:00:00',
      },
    ]);
    getPublicJobByIdMock.mockResolvedValue({
      id: 101,
      companyId: 9,
      companyName: '图谱科技',
      title: '前端工程师',
      city: '上海',
      district: '浦东新区',
      salaryMin: 25000,
      salaryMax: 40000,
      companyAvatarUrl: 'https://cdn.example.com/company-avatar.png',
    });
    getPublicCompanyByIdMock.mockResolvedValue({
      id: 9,
      name: '图谱科技',
      avatarUrl: 'https://cdn.example.com/company-avatar-fallback.png',
    });
    getEnterpriseJobDetailMock.mockResolvedValue({
      id: 101,
      companyId: 9,
      title: '前端工程师',
      location: { city: '上海', district: '浦东新区' },
      salaryRange: { min: 25000, max: 40000, unit: '元/月' },
      status: 'PUBLISHED',
    });
  });

  it('uses split mobile layout on user side: list page hides detail panel and detail page provides back button', async () => {
    render(<UserChatListPage />);
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    const listPanel = await screen.findByTestId('chat-conversation-list-panel');
    const listPageDetailPanel = screen.getByTestId('chat-conversation-detail-panel');
    expect(listPanel.className).not.toContain('hidden md:block');
    expect(listPageDetailPanel.className).toContain('hidden md:flex');
    expect(screen.getByTestId('chat-workspace').className).toContain('px-0');
    expect(listPanel.className).toContain('rounded-none');
    expect(listPageDetailPanel.className).toContain('rounded-none');

    useParamsMock.mockReturnValue({ conversationId: '1' });
    render(<UserChatDetailPage />);
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(2));

    const detailPageListPanel = (await screen.findAllByTestId('chat-conversation-list-panel'))[1];
    const detailPageDetailPanel = screen.getAllByTestId('chat-conversation-detail-panel')[1];
    expect(detailPageListPanel.className).toContain('hidden md:block');
    expect(detailPageDetailPanel.className).not.toContain('hidden md:flex');
    expect(screen.getByTestId('chat-mobile-back-button')).toHaveAttribute('href', '/chat');
  });

  it('uses split mobile layout on enterprise side detail page and provides back button', async () => {
    useParamsMock.mockReturnValue({ conversationId: '1' });
    render(<EnterpriseChatDetailPage />);
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    expect(screen.getByTestId('chat-mobile-back-button')).toHaveAttribute('href', '/enterprise/chat');
    expect(screen.getByTestId('chat-conversation-list-panel').className).toContain('hidden md:block');
    expect(screen.getByTestId('chat-conversation-detail-panel').className).not.toContain('hidden md:flex');
    expect(screen.getByTestId('chat-workspace').className).toContain('px-0');
    expect(screen.getByTestId('chat-conversation-detail-panel').className).toContain('rounded-none');
  });

  it('keeps image message inside bubble bounds and uses compact mobile spacing classes', async () => {
    listMessagesMock.mockResolvedValue([
      {
        id: 12,
        conversationId: 1,
        senderUserId: 10,
        receiverUserId: 20,
        messageType: 2,
        content: '发送了一张图片',
        ext: JSON.stringify({ fileName: 'avatar.jpg', filePath: 's3://resumes/chat/image/avatar.jpg' }),
        recalled: 0,
        createTime: '2026-05-04T10:10:00',
      },
    ]);

    render(<UserChatListPage />);
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(previewImageMock).toHaveBeenCalledWith(1, 12));

    const workspace = screen.getByTestId('chat-workspace');
    expect(workspace.className).toContain('px-0');
    expect(workspace.className).toContain('py-0');
    expect(workspace.className).toContain('md:px-6');

    const imageThumb = await screen.findByRole('img', { name: 'avatar.jpg' });
    expect(imageThumb.className).toContain('w-full');
    expect(imageThumb.className).toContain('max-h-60');
    expect(imageThumb.className).toContain('object-cover');
  });

  it('keeps mobile detail header and composer fixed while only message list scrolls', async () => {
    useParamsMock.mockReturnValue({ conversationId: '1' });
    render(<UserChatDetailPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    const detailPanel = screen.getByTestId('chat-conversation-detail-panel');
    const messageList = screen.getByTestId('chat-message-scroll-container');
    const header = screen.getByTestId('chat-detail-header');
    const composer = screen.getByTestId('chat-detail-composer');

    expect(detailPanel.className).toContain('h-[100dvh]');
    expect(detailPanel.className).toContain('overflow-hidden');
    expect(messageList.className).toContain('overflow-y-auto');
    expect(messageList.className).toContain('flex-1');
    expect(header.className).toContain('shrink-0');
    expect(composer.className).toContain('shrink-0');
  });

  it('renders redesigned user workspace with job header, day separators and resume action', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('chat-desktop-layout')).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-conversation-owner-avatar').length).toBeGreaterThan(0);
    expect(screen.getByTestId('chat-header-owner-avatar')).toBeInTheDocument();
    expect(await screen.findByText('岗位负责人')).toBeInTheDocument();
    expect(screen.getAllByText('图谱科技').length).toBeGreaterThan(0);
    expect(screen.getAllByText('前端工程师').length).toBeGreaterThan(0);
    expect(screen.getByText('25k-40k')).toBeInTheDocument();
    expect(screen.getByText(/上海/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看职位' })).toHaveAttribute('href', '/jobs/101');

    const separators = await screen.findAllByTestId('chat-date-separator');
    expect(separators).toHaveLength(2);

    expect(screen.getByRole('button', { name: '发送简历' })).toBeInTheDocument();
    expect(screen.getByTestId('chat-workspace').className).toContain('chat-frosted-shell');
    expect(screen.getByTestId('chat-desktop-layout').className).toContain('chat-frosted-layout');
    expect(screen.getByTestId('chat-conversation-list-panel').className).toContain('chat-frosted-list-panel');
    expect(screen.getByTestId('chat-conversation-detail-panel').className).toContain('chat-frosted-detail-panel');
    expect(screen.getByTestId('chat-detail-composer').className).toContain('chat-frosted-composer');
    expect(screen.getAllByTestId('chat-message-avatar').length).toBeGreaterThan(1);
  });

  it('keeps sent bubble text readable and exposes theme token classes on chat surfaces', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    const sentBubble = await screen.findByTestId('chat-message-bubble-self');

    expect(sentBubble.className).toContain('bg-primary');
    expect(sentBubble.className).toContain('text-on-primary');
    expect(sentBubble.className).not.toContain('text-white');

    expect(screen.getByTestId('chat-workspace').className).not.toContain('md:bg-gradient-to-br');
    expect(screen.getByTestId('chat-workspace').className).not.toContain('md:ring-1');
    expect(screen.getByTestId('chat-conversation-list-panel').className).toContain('bg-surface-container-low/80');
    expect(screen.getByTestId('chat-conversation-list-panel').className).not.toContain('bg-white');
    expect(screen.getByTestId('chat-conversation-detail-panel').className).toContain('dark:bg-surface-container-low/80');
    expect(screen.getByTestId('chat-conversation-detail-panel').className).toContain('ring-outline-variant/55');
    expect(screen.getByTestId('chat-detail-header').className).toContain('bg-surface-container-low/80');
    expect(screen.getByTestId('chat-detail-header').className).toContain('dark:bg-surface-container-low/75');
    expect(screen.getByTestId('chat-detail-composer').className).toContain('bg-surface-container-low/70');
    expect(screen.getByTestId('chat-detail-composer').className).not.toContain('bg-white');
  });

  it('opens emoji panel and inserts selected emoji into input', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByTestId('chat-emoji-button'));
    const panel = await screen.findByTestId('chat-emoji-panel');
    fireEvent.click(within(panel).getByRole('button', { name: '😀' }));

    expect(screen.getByPlaceholderText('输入消息...')).toHaveValue('😀');
  });

  it('supports emoji category switch and pagination with fixed scroll region', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByTestId('chat-emoji-button'));

    const panel = await screen.findByTestId('chat-emoji-panel');
    const categoryTabs = within(panel).getByTestId('chat-emoji-category-tabs');
    const scrollRegion = within(panel).getByTestId('chat-emoji-scroll-region');
    expect(panel.className).toContain('bg-surface-container-lowest');
    expect(panel.className).toContain('border-surface-container-highest');
    expect(panel.className).toContain('dark:border-outline-variant');
    expect(panel.className).not.toContain('border-outline-variant/60');
    expect(panel.className).not.toContain('bg-surface-container-lowest/95');
    expect(panel.className).not.toContain('backdrop-blur');
    expect(categoryTabs.className).toContain('chat-scrollbar');
    expect(categoryTabs.className).toContain('overflow-x-auto');
    expect(scrollRegion.className).toContain('h-64');
    expect(scrollRegion.className).toContain('overflow-y-auto');
    expect(scrollRegion.className).toContain('chat-scrollbar');
    expect(scrollRegion.className).toContain('ring-surface-container-highest');
    expect(scrollRegion.className).toContain('dark:ring-outline-variant');

    fireEvent.click(within(panel).getByRole('button', { name: '笑脸' }));
    expect(within(panel).getByText('笑脸 · 第1/2页')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '下一页表情' }));
    expect(within(panel).getByText('笑脸 · 第2/2页')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '上一页表情' })).toBeInTheDocument();
  });

  it('uses theme tokens for dark-mode critical chat elements without hardcoded white backgrounds', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    const searchInput = screen.getByPlaceholderText('搜索会话...');
    const emojiButton = screen.getByTestId('chat-emoji-button');
    const albumButton = screen.getByLabelText('相册');
    const textInput = screen.getByPlaceholderText('输入消息...');
    const messageList = screen.getByTestId('chat-message-scroll-container');
    const peerBubbles = await screen.findAllByTestId('chat-message-bubble-peer');

    expect(searchInput.className).toContain('bg-surface-container');
    expect(searchInput.className).not.toContain('bg-white');

    expect(emojiButton.className).toContain('bg-surface-container');
    expect(emojiButton.className).not.toContain('bg-white');

    expect(albumButton.className).toContain('bg-surface-container');
    expect(albumButton.className).not.toContain('bg-white');

    expect(textInput.className).toContain('bg-surface-container');
    expect(textInput.className).not.toContain('bg-white');

    expect(messageList.className).toContain('chat-scrollbar');
    expect(peerBubbles.length).toBeGreaterThan(0);
    peerBubbles.forEach((peerBubble) => {
      expect(peerBubble.className).toContain('bg-surface-container');
      expect(peerBubble.className).not.toContain('bg-white');
    });
  });

  it('renders enterprise workspace without resume button and keeps interview action', async () => {
    listConversationsMock.mockResolvedValue([
      {
        conversationId: 1,
        jobId: 101,
        jobTitle: '前端工程师',
        companyId: 9,
        companyName: '图谱科技',
        recruiterUserId: 20,
        candidateUserId: 10,
        candidateName: '测试候选人',
        candidateEmail: 'test_person@example.com',
        candidateAge: 25,
        candidateGender: 2,
        candidateEducation: '硕士',
        recruiterName: '陈HR',
        lastMessagePreview: '你好，方便沟通吗',
        lastMessageTime: '2026-05-04T09:12:00',
        unreadCount: 2,
      },
    ]);
    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-conversation-owner-avatar').length).toBeGreaterThan(0);
    expect(screen.getByTestId('chat-header-owner-avatar')).toBeInTheDocument();
    expect(screen.getAllByText('测试候选人').length).toBeGreaterThan(0);
    expect(screen.getByText('test_person@example.com')).toBeInTheDocument();
    expect(screen.getByText('年龄：25 · 性别：女 · 学历：硕士')).toBeInTheDocument();
    expect(screen.queryByText(/^候选人$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^ID：/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看职位' })).toHaveAttribute('href', '/enterprise/jobs/101');
    expect(screen.queryByRole('button', { name: '发送简历' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByRole('dialog', { name: '发送面试通知' })).toBeInTheDocument();
  });

  it('does not trigger maximum update depth errors on enterprise chat page', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();

    const maxDepthCalls = consoleErrorSpy.mock.calls.filter((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes('Maximum update depth exceeded')),
    );
    expect(maxDepthCalls).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });

  it('filters conversations by sidebar search keyword', async () => {
    listConversationsMock.mockResolvedValue([
      {
        conversationId: 1,
        jobId: 101,
        jobTitle: '前端工程师',
        companyId: 9,
        companyName: '图谱科技',
        recruiterUserId: 20,
        candidateUserId: 10,
        candidateName: '小王',
        recruiterName: '陈HR',
        lastMessagePreview: '你好，方便沟通吗',
        lastMessageTime: '2026-05-04T09:12:00',
        unreadCount: 2,
      },
      {
        conversationId: 2,
        jobId: 102,
        jobTitle: '数据分析师',
        companyId: 10,
        companyName: '智域信息',
        recruiterUserId: 21,
        candidateUserId: 10,
        candidateName: '小李',
        recruiterName: '赵HR',
        lastMessagePreview: '请完善简历',
        lastMessageTime: '2026-05-04T10:12:00',
        unreadCount: 0,
      },
    ]);

    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    const searchInput = screen.getByPlaceholderText('搜索会话...');
    const sidebar = searchInput.closest('aside') as HTMLElement;
    expect(sidebar).toBeTruthy();
    expect(within(sidebar).getByText('前端工程师')).toBeInTheDocument();
    expect(within(sidebar).getByText('数据分析师')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '分析' } });

    expect(within(sidebar).queryByText('前端工程师')).not.toBeInTheDocument();
    expect(within(sidebar).getByText('数据分析师')).toBeInTheDocument();
  });

  it('clears unread badge in sidebar after markRead succeeds', async () => {
    mockConversationListReadAfterOpen();
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('2')).toBeInTheDocument();

    await waitFor(() => expect(markReadMock).toHaveBeenCalled());
    expect(markReadMock).toHaveBeenCalledWith({ conversationId: 1, readUpToMessageId: 3 });
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });


  it('submits interview invite from dialog with formatted datetime payload', async () => {
    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    const composer = screen.getByTestId('chat-detail-composer');
    expect(within(composer).queryByRole('button', { name: '确认发送面试通知' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));

    const dialog = screen.getByRole('dialog', { name: '发送面试通知' });
    fireEvent.change(within(dialog).getByPlaceholderText('面试地点'), { target: { value: '上海市浦东新区张江路 100 号' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '面试时间（必填）' }));
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-05-10' } });
    fireEvent.change(screen.getByLabelText('时间'), { target: { value: '15:30' } });

    fireEvent.click(within(dialog).getByRole('button', { name: '确认发送面试通知' }));

    await waitFor(() => {
      expect(sendInterviewInviteMock).toHaveBeenCalledWith({
        conversationId: 1,
        interviewTime: '2026-05-10T15:30:00',
        location: '上海市浦东新区张江路 100 号',
        remark: '',
      });
    });
  });
  it('renders resume card and supports in-page preview + authenticated download', async () => {
    listMessagesMock.mockResolvedValue([
      {
        id: 11,
        conversationId: 1,
        senderUserId: 10,
        receiverUserId: 20,
        messageType: 3,
        content: '发送了一份简历',
        ext: JSON.stringify({ resumeId: 501, fileName: '25年简历测试.pdf' }),
        recalled: 0,
        createTime: '2026-05-04T10:00:00',
      },
      {
        id: 12,
        conversationId: 1,
        senderUserId: 10,
        receiverUserId: 20,
        messageType: 2,
        content: '发送了一张图片',
        ext: JSON.stringify({ fileName: 'avatar.jpg', filePath: 's3://resumes/chat/image/avatar.jpg' }),
        recalled: 0,
        createTime: '2026-05-04T10:10:00',
      },
    ]);

    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('25年简历测试.pdf')).toBeInTheDocument();
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'a') {
        (element as HTMLAnchorElement).click = clickMock;
      }
      return element;
    }) as typeof document.createElement);

    fireEvent.click(screen.getByRole('button', { name: '预览PDF' }));

    await waitFor(() => expect(downloadResumeMock).toHaveBeenCalledWith(1, 501));
    expect(screen.getByTestId('chat-resume-preview-modal')).toBeInTheDocument();
    const pdfFrame = screen.getByTestId('chat-pdf-preview-frame');
    expect(pdfFrame).toHaveAttribute('src', 'blob:test-url');
    expect(pdfFrame).not.toHaveAttribute('sandbox');
    expect(screen.getByTestId('chat-pdf-download-link')).toHaveAttribute('href', 'blob:test-url');

    fireEvent.click(screen.getByRole('button', { name: '关闭预览' }));
    expect(screen.queryByTestId('chat-resume-preview-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '下载PDF' }));

    await waitFor(() => expect(downloadResumeMock).toHaveBeenCalledTimes(2));
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');

    await waitFor(() => expect(previewImageMock).toHaveBeenCalledWith(1, 12));
    const imageThumb = await screen.findByRole('img', { name: 'avatar.jpg' });
    const imageSrc = imageThumb.getAttribute('src') || '';
    expect(imageSrc.startsWith('blob:')).toBe(true);
    expect(screen.queryByText('图片消息')).not.toBeInTheDocument();
    expect(screen.queryByText('avatar.jpg')).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByRole('dialog', { name: '发送面试通知' })).toBeInTheDocument();

    expect(screen.getByLabelText('相册')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('chat-emoji-button'));
    const panel = await screen.findByTestId('chat-emoji-panel');
    expect(within(panel).getByLabelText('😀')).toBeInTheDocument();
    expect(within(panel).getByLabelText('😂')).toBeInTheDocument();
    expect(within(panel).getByText('常用')).toBeInTheDocument();
    expect(within(panel).getByText('笑脸')).toBeInTheDocument();
    expect(within(panel).getByText('下一页')).toBeInTheDocument();

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('uses candidate real name from person info and keeps full email in enterprise header', async () => {
    listConversationsMock.mockResolvedValue([
      {
        conversationId: 1,
        jobId: 101,
        jobTitle: '前端工程师',
        companyId: 9,
        companyName: '图谱科技',
        recruiterUserId: 20,
        candidateUserId: 10,
        candidateName: '王小明',
        candidateEmail: '13800138001@phone.com',
        candidateAge: 24,
        candidateGender: 1,
        candidateEducation: '本科',
        recruiterName: '陈HR',
        lastMessagePreview: '你好',
        lastMessageTime: '2026-05-04T09:12:00',
        unreadCount: 0,
      },
    ]);
    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText('王小明')).length).toBeGreaterThan(0);
    expect(screen.getByText('13800138001@phone.com')).toBeInTheDocument();
  });
});



