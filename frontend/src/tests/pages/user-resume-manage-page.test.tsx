import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ResumeManagePage from '@/app/(user)/resume/manage/page';

const {
  getMyResumesMock,
  setDefaultMock,
  parseMock,
  uploadWithProgressMock,
  deleteMock,
  previewMock,
} = vi.hoisted(() => {
  return {
    getMyResumesMock: vi.fn(),
    setDefaultMock: vi.fn(),
    parseMock: vi.fn(),
    uploadWithProgressMock: vi.fn(),
    deleteMock: vi.fn(),
    previewMock: vi.fn(),
  };
});

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: getMyResumesMock,
    setDefault: setDefaultMock,
    parse: parseMock,
    uploadWithProgress: uploadWithProgressMock,
    delete: deleteMock,
    preview: previewMock,
  },
}));

describe('User Resume Manage page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyResumesMock.mockResolvedValue([
      {
        id: 1,
        fileName: '默认简历.pdf',
        fileUrl: '/resume/1',
        status: 'COMPLETED',
        isDefault: true,
        createdAt: '2026-04-30T10:00:00.000Z',
        updatedAt: '2026-04-30T10:00:00.000Z',
      },
      {
        id: 2,
        fileName: '待设默认简历.pdf',
        fileUrl: '/resume/2',
        status: 'COMPLETED',
        isDefault: false,
        createdAt: '2026-04-29T10:00:00.000Z',
        updatedAt: '2026-04-29T10:00:00.000Z',
      },
      {
        id: 3,
        fileName: '解析中简历.pdf',
        fileUrl: '/resume/3',
        status: 'PROCESSING',
        isDefault: false,
        createdAt: '2026-04-28T10:00:00.000Z',
        updatedAt: '2026-04-28T10:00:00.000Z',
      },
    ]);
    setDefaultMock.mockResolvedValue(undefined);
    parseMock.mockResolvedValue({ status: 'ok' });
    uploadWithProgressMock.mockResolvedValue({
      id: 9,
      fileName: 'new-resume.pdf',
      fileUrl: '/resume/9',
      status: 'PENDING',
      isDefault: false,
      createdAt: '2026-04-30T11:00:00.000Z',
      updatedAt: '2026-04-30T11:00:00.000Z',
    });
    deleteMock.mockResolvedValue(undefined);
    previewMock.mockResolvedValue({
      blob: new Blob(['resume'], { type: 'application/pdf' }),
      contentType: 'application/pdf',
    });
  });

  it('loads resume list from backend', async () => {
    render(<ResumeManagePage />);

    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));

    expect(screen.getByText('默认简历.pdf')).toBeInTheDocument();
    expect(screen.getByText('待设默认简历.pdf')).toBeInTheDocument();
    expect(screen.getByText('解析中简历.pdf')).toBeInTheDocument();
  });

  it('calls setDefault when clicking set-default', async () => {
    const user = userEvent.setup();
    render(<ResumeManagePage />);

    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));

    const setDefaultButton = screen.getByRole('button', { name: '设为默认-2' });
    await user.click(setDefaultButton);

    await waitFor(() => expect(setDefaultMock).toHaveBeenCalledWith(2));
  });

  it('calls parse when clicking reparse', async () => {
    const user = userEvent.setup();
    render(<ResumeManagePage />);

    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));

    const parseButton = screen.getByRole('button', { name: '重新解析-1' });
    await user.click(parseButton);

    await waitFor(() => expect(parseMock).toHaveBeenCalledWith(1));
  });

  it('uploads file through uploadWithProgress', async () => {
    const user = userEvent.setup();
    render(<ResumeManagePage />);

    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));

    const file = new File(['resume-content'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('resume-upload-input');
    await user.upload(input, file);

    await waitFor(() => expect(uploadWithProgressMock).toHaveBeenCalledTimes(1));

    const [formDataArg, onProgressArg] = uploadWithProgressMock.mock.calls[0];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(onProgressArg).toEqual(expect.any(Function));
    expect((formDataArg as FormData).get('file')).toBe(file);
  });
});
