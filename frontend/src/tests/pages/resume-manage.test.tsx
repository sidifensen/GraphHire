import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ManagePage from '@/app/(user)/resume/manage/page';

const getMyResumes = vi.fn();
const parseResume = vi.fn();
const setDefault = vi.fn();
const deleteResume = vi.fn();
const previewResume = vi.fn();

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: (...args: unknown[]) => getMyResumes(...args),
    parse: (...args: unknown[]) => parseResume(...args),
    setDefault: (...args: unknown[]) => setDefault(...args),
    delete: (...args: unknown[]) => deleteResume(...args),
    preview: (...args: unknown[]) => previewResume(...args),
  },
}));

describe('Resume Manage Page - Reparse Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyResumes.mockResolvedValue([
      {
        id: 1,
        fileName: 'failed.pdf',
        fileUrl: '',
        status: 'FAILED',
        isDefault: false,
        createdAt: '2026-04-22T10:00:00',
        updatedAt: '2026-04-22T10:00:00',
      },
      {
        id: 2,
        fileName: 'ok.pdf',
        fileUrl: '',
        status: 'COMPLETED',
        isDefault: true,
        createdAt: '2026-04-22T10:00:00',
        updatedAt: '2026-04-22T10:00:00',
      },
      {
        id: 3,
        fileName: 'processing.pdf',
        fileUrl: '',
        status: 'PROCESSING',
        isDefault: false,
        createdAt: '2026-04-22T10:00:00',
        updatedAt: '2026-04-22T10:00:00',
      },
    ]);
    parseResume.mockResolvedValue({ status: 'ok' });
  });

  it('shows reparse button for FAILED and COMPLETED, disables for PROCESSING', async () => {
    render(<ManagePage />);

    await screen.findByText('failed.pdf');
    const reparseButtons = screen.getAllByRole('button', { name: /重新解析/i });
    expect(reparseButtons.length).toBe(3);
    expect(reparseButtons[0]).not.toHaveAttribute('disabled');
    expect(reparseButtons[1]).not.toHaveAttribute('disabled');
    expect(reparseButtons[2]).toHaveAttribute('disabled');
  });

  it('calls parse api and refreshes list when click reparse', async () => {
    render(<ManagePage />);

    await screen.findByText('failed.pdf');
    const reparseButtons = screen.getAllByRole('button', { name: /重新解析/i });
    fireEvent.click(reparseButtons[0]);

    await waitFor(() => expect(parseResume).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getMyResumes).toHaveBeenCalledTimes(2));
  });
});
