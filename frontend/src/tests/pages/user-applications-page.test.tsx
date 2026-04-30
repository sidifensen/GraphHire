import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ApplicationsPage from '@/app/(user)/applications/page';

const { getApplicationsMock, withdrawApplicationMock } = vi.hoisted(() => ({
  getApplicationsMock: vi.fn(),
  withdrawApplicationMock: vi.fn(),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getApplications: getApplicationsMock,
    withdrawApplication: withdrawApplicationMock,
  },
}));

describe('User Applications page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getApplicationsMock.mockResolvedValue([
      {
        id: 101,
        resumeId: 1,
        jobId: 9001,
        jobTitle: '高级前端工程师',
        companyName: '字节跳动',
        status: 'PENDING',
        matchScore: 89,
        appliedAt: '2026-04-30T08:00:00.000Z',
      },
      {
        id: 102,
        resumeId: 2,
        jobId: 9002,
        jobTitle: '数据分析师',
        companyName: '阿里巴巴',
        status: 'VIEWED',
        matchScore: 92,
        appliedAt: '2026-04-29T08:00:00.000Z',
      },
      {
        id: 103,
        resumeId: 3,
        jobId: 9003,
        jobTitle: '算法工程师',
        companyName: '腾讯',
        status: 'INTERVIEW_INVITED',
        matchScore: 95,
        appliedAt: '2026-04-28T08:00:00.000Z',
      },
      {
        id: 104,
        resumeId: 4,
        jobId: 9004,
        jobTitle: '测试工程师',
        companyName: '美团',
        status: 'REJECTED',
        matchScore: 70,
        appliedAt: '2026-04-27T08:00:00.000Z',
      },
    ]);
    withdrawApplicationMock.mockResolvedValue(undefined);
  });

  it('loads applications from backend', async () => {
    render(<ApplicationsPage />);

    await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByText('高级前端工程师')).toBeInTheDocument();
    expect(screen.getByText('字节跳动')).toBeInTheDocument();
    expect(screen.getByText('数据分析师')).toBeInTheDocument();
  });

  it('renders desktop row structure markers', async () => {
    render(<ApplicationsPage />);
    await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));

    expect(screen.getAllByTestId('application-row').length).toBeGreaterThan(0);
  });

  it('filters applications by status tabs', async () => {
    const user = userEvent.setup();
    render(<ApplicationsPage />);

    await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: '面试邀请' }));
    expect(screen.getByText('算法工程师')).toBeInTheDocument();
    expect(screen.queryByText('高级前端工程师')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '已查看' }));
    expect(screen.getByText('数据分析师')).toBeInTheDocument();
    expect(screen.queryByText('算法工程师')).not.toBeInTheDocument();
  });

  it('withdraws pending application', async () => {
    const user = userEvent.setup();
    render(<ApplicationsPage />);

    await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: '撤回-101' }));

    await waitFor(() => expect(withdrawApplicationMock).toHaveBeenCalledWith(101));
  });
});
