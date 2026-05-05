import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserChatListPage from '@/app/(user)/chat/page';
import EnterpriseChatListPage from '@/app/enterprise/chat/page';
import { vi } from 'vitest';

const pushMock = vi.fn();

const {
  listConversationsMock,
  listMessagesMock,
  sendTextMock,
  sendResumeMock,
  sendImageMock,
  sendInterviewInviteMock,
  downloadResumeMock,
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

  it('renders redesigned user workspace with job header, day separators and resume action', async () => {
    render(<UserChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('chat-desktop-layout')).toBeInTheDocument();
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

  it('renders enterprise workspace without resume button and keeps interview action', async () => {
    render(<EnterpriseChatListPage />);

    await waitFor(() => expect(listConversationsMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看职位' })).toHaveAttribute('href', '/enterprise/jobs/101');
    expect(screen.queryByRole('button', { name: '发送简历' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByPlaceholderText(/面试时间/)).toBeInTheDocument();
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

    expect(screen.queryByRole('button', { name: '发送通知' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '面试通知' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '面试通知' }));
    expect(screen.getByRole('button', { name: '确认发送面试通知' })).toBeInTheDocument();

    expect(screen.getByLabelText('相册')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('chat-emoji-button'));
    const panel = await screen.findByTestId('chat-emoji-panel');
    expect(within(panel).getByRole('button', { name: '🥳' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '🤝' })).toBeInTheDocument();

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
