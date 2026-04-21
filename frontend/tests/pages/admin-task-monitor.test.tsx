import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminTaskMonitorPage from '@/app/admin/task-monitor/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
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
    mockedAdminApi.getTaskList.mockResolvedValue({
      summary: { pending: 1, processing: 2, completed: 3, failed: 1 },
      list: [{
        id: 10,
        type: 'RESUME_PARSE',
        status: 'FAILED',
        progress: 0,
        total: 100,
        successCount: 0,
        failCount: 1,
        createdAt: '2026-04-21',
        errorMessage: 'timeout',
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('加载成功时渲染summary与任务列表', async () => {
    render(<AdminTaskMonitorPage />);

    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('点击单项重试会调用接口', async () => {
    render(<AdminTaskMonitorPage />);

    const retryBtn = await screen.findByRole('button', { name: '重试-10' });
    fireEvent.click(retryBtn);

    expect(mockedAdminApi.retryTask).toHaveBeenCalledWith(10);
  });

  it('勾选后批量重试会调用接口', async () => {
    render(<AdminTaskMonitorPage />);

    const checkbox = await screen.findByRole('checkbox', { name: 'select-10' });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: '批量重试' }));

    expect(mockedAdminApi.batchRetryTasks).toHaveBeenCalledWith({ taskIds: [10] });
  });
});
