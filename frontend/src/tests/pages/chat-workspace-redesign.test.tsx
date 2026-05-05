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
        recruiterName: '陈HR',
        lastMessagePreview: '你好，方便沟通吗',
        lastMessageTime: '2026-05-04T09:12:00',
        unreadCount: 2,
      },
    ])
    .mockResolvedValue([
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
        unreadCount: 0,
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
    expect(imageThumb.className).toContain('max-w-full');
    expect(imageThumb.className).toContain('max-h-60');
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
    expect(screen.getAllByTestId('chat-message-avatar').length).toBeGreaterThan(1);
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
    const scrollRegion = within(panel).getByTestId('chat-emoji-scroll-region');
    expect(scrollRegion.className).toContain('h-64');
    expect(scrollRegion.className).toContain('overflow-y-auto');

    fireEvent.click(within(panel).getByRole('button', { name: '笑脸' }));
    expect(within(panel).getByText('笑脸 · 第1/2页')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '下一页表情' }));
    expect(within(panel).getByText('笑脸 · 第2/2页')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '上一页表情' })).toBeInTheDocument();
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
        candidateName: 'test_person@example.com',
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
    expect(screen.getAllByText(/候选人：test_person/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/候选人：test_person@example.com/)).not.toBeInTheDocument();
    expect(screen.getByText('候选人')).toBeInTheDocument();
    expect(screen.getByText('test_person')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看职位' })).toHaveAttribute('href', '/enterprise/jobs/101');
    expect(screen.queryByRole('button', { name: '发送简历' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByPlaceholderText(/面试时间/)).toBeInTheDocument();
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
    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(2));

    expect(screen.queryByText('2')).not.toBeInTheDocument();
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
    expect(screen.getByTitle('简历预览')).toHaveAttribute('src', 'blob:test-url');

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

    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByRole('button', { name: '确认发送面试通知' })).toBeInTheDocument();

    expect(screen.getByLabelText('相册')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('chat-emoji-button'));
    const panel = await screen.findByTestId('chat-emoji-panel');
    expect(within(panel).getByRole('button', { name: '🥳' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '🤝' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '常用' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '笑脸' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '下一页表情' })).toBeInTheDocument();

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});

