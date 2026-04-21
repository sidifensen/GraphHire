import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

  it('加载数据时渲染任务监控页面', async () => {
    const { container } = render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(container.querySelector('[class*="grid"]')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('页面包含任务监控标题', async () => {
    const { getByText } = render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(getByText('任务监控')).toBeTruthy();
    }, { timeout: 3000 });
  });
});
