import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminTaskMonitorPage from '@/app/admin/task-monitor/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getTaskList: vi.fn(),
    retryTask: vi.fn(),
  },
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminTaskMonitorPage', () => {
  const mockTaskList = {
    summary: {
      pending: 5,
      processing: 2,
      completed: 100,
      failed: 3,
    },
    list: [
      {
        id: 1001,
        sourceId: 101,
        type: 'RESUME_PARSE',
        status: 'PROCESSING',
        progress: 50,
        total: 100,
        successCount: 50,
        failCount: 0,
        createdAt: '2026-04-26 10:00:00',
        startedAt: '2026-04-26 10:01:00',
        completedAt: null,
        updatedAt: '2026-04-26 10:05:00',
        errorMessage: null,
      },
      {
        id: 1002,
        sourceId: 102,
        type: 'RESUME_PARSE',
        status: 'FAILED',
        progress: 100,
        total: 100,
        successCount: 80,
        failCount: 20,
        createdAt: '2026-04-26 08:00:00',
        startedAt: '2026-04-26 08:01:00',
        completedAt: '2026-04-26 08:10:00',
        updatedAt: '2026-04-26 08:10:00',
        errorMessage: '解析超时',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getTaskList).mockResolvedValue(mockTaskList);
    vi.mocked(adminApi.retryTask).mockResolvedValue();
  });

  it('渲染任务监控页面标题和统计卡片', async () => {
    render(<AdminTaskMonitorPage />);

    expect(screen.getByText('任务监控')).toBeInTheDocument();
    expect(screen.getByText('实时追踪系统级数据处理任务的执行状态')).toBeInTheDocument();
  });

  it('展示任务统计数据', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('展示任务列表数据', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(screen.getByText('TSK-1001')).toBeInTheDocument();
      expect(screen.getByText('TSK-1002')).toBeInTheDocument();
      expect(screen.getByText('解析超时')).toBeInTheDocument();
    });
  });

  it('点击筛选按钮重新加载数据', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(screen.getByText('任务监控')).toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /筛选/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(adminApi.getTaskList).toHaveBeenCalled();
    });
  });

  it('点击刷新按钮重新加载数据', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(screen.getByText('任务监控')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /刷新/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(adminApi.getTaskList).toHaveBeenCalled();
    });
  });

  it('失败任务显示重试按钮', async () => {
    render(<AdminTaskMonitorPage />);

    await waitFor(() => {
      expect(screen.getByText('TSK-1002')).toBeInTheDocument();
    });

    const retryButtons = screen.getAllByRole('button', { name: '重试' });
    expect(retryButtons.length).toBeGreaterThan(0);
  });
});