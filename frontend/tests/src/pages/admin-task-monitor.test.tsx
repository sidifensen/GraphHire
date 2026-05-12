import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getTaskList, retryTask } = vi.hoisted(() => ({
  getTaskList: vi.fn().mockResolvedValue({
    summary: {
      pending: 2,
      processing: 1,
      completed: 9,
      failed: 1,
    },
    list: [
      {
        id: 7,
        type: 'RESUME_PARSE',
        sourceId: 123,
        status: 'FAILED',
        progress: 30,
        total: 100,
        successCount: 30,
        failCount: 1,
        createdAt: '2026-04-24 12:00:00',
        startedAt: '2026-04-24 12:01:00',
        completedAt: null,
        updatedAt: '2026-04-24 12:30:00',
        errorMessage: 'timeout',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  retryTask: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getTaskList,
    retryTask,
  },
}));

import AdminTaskMonitorPage from '@/app/admin/task-monitor/page';

describe('AdminTaskMonitorPage', () => {
  it('loads tasks from backend and retries failed task', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(getTaskList).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('简历解析')).toBeInTheDocument();
    expect(screen.getByText('来源ID')).toBeInTheDocument();
    expect(screen.getByText('错误信息')).toBeInTheDocument();
    expect(screen.getByText('创建时间')).toBeInTheDocument();
    expect(screen.getByText('结束时间')).toBeInTheDocument();
    expect(screen.getByText('更新时间')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    expect(screen.getByText('TSK-7')).toBeInTheDocument();

    fireEvent.click(screen.getByText('重试'));

    await waitFor(() => {
      expect(retryTask).toHaveBeenCalledWith(7);
    });
  });
});
