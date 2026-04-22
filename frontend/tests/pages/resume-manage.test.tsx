import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ManagePage from '@/app/(user)/resume/manage/page';

const getMyResumes = vi.fn();
const deleteResume = vi.fn();
const setDefault = vi.fn();

vi.mock('@/components/UserLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="user-layout">{children}</div>,
}));

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: (...args: unknown[]) => getMyResumes(...args),
    delete: (...args: unknown[]) => deleteResume(...args),
    setDefault: (...args: unknown[]) => setDefault(...args),
  },
}));

describe('ManagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyResumes.mockResolvedValue([
      {
        id: 1,
        fileName: '真实产品经理简历.pdf',
        fileUrl: '/resume/1.pdf',
        status: 'COMPLETED',
        isDefault: true,
        createdAt: '2026-04-21T10:00:00',
        updatedAt: '2026-04-21T10:00:00',
      },
      {
        id: 2,
        fileName: '真实运营总监简历.docx',
        fileUrl: '/resume/2.docx',
        status: 'PROCESSING',
        isDefault: false,
        createdAt: '',
        updatedAt: '2026-04-20T09:00:00',
      },
    ]);
    deleteResume.mockResolvedValue(undefined);
    setDefault.mockResolvedValue(undefined);
  });

  it('loads and renders resumes from api', async () => {
    render(<ManagePage />);
    expect(screen.getByText('简历数据加载中...')).toBeDefined();
    await screen.findByText('真实产品经理简历.pdf');
    expect(screen.getByText('真实运营总监简历.docx')).toBeDefined();
    expect(screen.getByText('解析成功')).toBeDefined();
    expect(screen.getByText('解析中')).toBeDefined();
    expect(screen.getByText('-')).toBeDefined();
  });

  it('supports deleting a resume', async () => {
    render(<ManagePage />);
    await screen.findByText('真实产品经理简历.pdf');
    screen.getAllByText('delete')[0].click();
    await waitFor(() => expect(deleteResume).toHaveBeenCalledWith(1));
    expect(getMyResumes).toHaveBeenCalledTimes(2);
  });

  it('supports setting default resume', async () => {
    render(<ManagePage />);
    await screen.findByText('真实运营总监简历.docx');
    screen.getByText('设为默认').click();
    await waitFor(() => expect(setDefault).toHaveBeenCalledWith(2));
    expect(getMyResumes).toHaveBeenCalledTimes(2);
  });

  it('renders error and retry states', async () => {
    getMyResumes.mockRejectedValueOnce(new Error('resume failed'));
    render(<ManagePage />);
    await screen.findByText('resume failed');
    screen.getByText('重试').click();
    await waitFor(() => expect(getMyResumes).toHaveBeenCalledTimes(2));
  });
});
