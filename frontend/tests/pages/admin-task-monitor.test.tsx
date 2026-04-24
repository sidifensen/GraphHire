import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminTaskMonitorPage from '@/app/admin/task-monitor/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: unknown }) => <div>{children as any}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getTaskList: vi.fn(),
    retryTask: vi.fn(),
    batchRetryTasks: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminTaskMonitorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAdminApi.getTaskList.mockImplementation((params?: { page?: number }) =>
      Promise.resolve({
        summary: { pending: 1, processing: 2, completed: 3, failed: 1 },
        list: [
          {
            id: params?.page === 2 ? 11 : 10,
            type: 'RESUME_PARSE',
            status: 'FAILED',
            progress: 0,
            total: 100,
            successCount: 0,
            failCount: 1,
            createdAt: '2026-04-21',
            errorMessage: 'timeout',
          },
        ],
        total: 20,
        page: params?.page ?? 1,
        pageSize: 10,
      })
    );
  });

  it('展示重构后的任务监控标题与说明', async () => {
    render(<AdminTaskMonitorPage />);

    expect(await screen.findByText('任务监控')).toBeInTheDocument();
    expect(screen.getByText('实时追踪系统级数据处理任务的执行状态')).toBeInTheDocument();
    expect(screen.getAllByText('失败').length).toBeGreaterThan(0);
  });

  it('点击失败任务重试会调用重试接口', async () => {
    render(<AdminTaskMonitorPage />);

    const retryButton = await screen.findByRole('button', { name: '重试' });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(adminApi.retryTask).toHaveBeenCalledWith(10);
    });
  });

  it('点击刷新会重新拉取任务列表', async () => {
    render(<AdminTaskMonitorPage />);

    await screen.findByText('任务监控');
    const refreshButton = screen.getByRole('button', { name: /刷新/ });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(adminApi.getTaskList).toHaveBeenCalledTimes(2);
    });
  });

  it('点击分页会请求对应页码', async () => {
    render(<AdminTaskMonitorPage />);
    await screen.findByText('任务监控');

    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));

    await waitFor(() => {
      expect(adminApi.getTaskList).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    });
  });
});
