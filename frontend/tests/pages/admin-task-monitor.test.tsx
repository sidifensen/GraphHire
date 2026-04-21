import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminTaskMonitorPage from '@/app/admin/task-monitor/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminTaskMonitorPage', () => {
  it('渲染任务监控页面容器和侧边栏', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('渲染页面标题和描述', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('任务监控')).toBeInTheDocument();
    expect(screen.getByText('AI 处理引擎实时监控中')).toBeInTheDocument();
  });

  it('渲染刷新数据按钮', () => {
    render(<AdminTaskMonitorPage />);
    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(btn => btn.textContent?.includes('刷新数据'));
    expect(refreshButton).toBeInTheDocument();
  });

  it('渲染批量重试按钮', () => {
    render(<AdminTaskMonitorPage />);
    const buttons = screen.getAllByRole('button');
    const retryButton = buttons.find(btn => btn.textContent?.includes('批量重试'));
    expect(retryButton).toBeInTheDocument();
  });

  it('渲染待处理状态统计卡片', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('待处理')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('渲染处理中状态统计卡片', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('处理中')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('渲染成功状态统计卡片', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('1,240')).toBeInTheDocument();
  });

  it('渲染失败状态统计卡片', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('渲染最近运行任务标题', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('最近运行任务')).toBeInTheDocument();
  });

  it('渲染失败任务项', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('TSK-8921A')).toBeInTheDocument();
  });

  it('渲染处理中任务项', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('TSK-8922B')).toBeInTheDocument();
  });

  it('渲染成功任务项', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('TSK-8919C')).toBeInTheDocument();
  });

  it('渲染简历AI解析任务类型', () => {
    render(<AdminTaskMonitorPage />);
    const resumeTags = screen.getAllByText('简历 AI 解析');
    expect(resumeTags.length).toBeGreaterThan(0);
  });

  it('渲染职位语义分析任务类型', () => {
    render(<AdminTaskMonitorPage />);
    const jobTags = screen.getAllByText('职位语义分析');
    expect(jobTags.length).toBeGreaterThan(0);
  });

  it('渲染关联对象信息', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText('候选人_张三_前端.pdf')).toBeInTheDocument();
    expect(screen.getByText('资深Java架构师JD')).toBeInTheDocument();
  });

  it('渲染耗时和重试次数', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText(/12.5s/)).toBeInTheDocument();
    expect(screen.getByText(/3次/)).toBeInTheDocument();
  });

  it('渲染立即重试按钮', () => {
    render(<AdminTaskMonitorPage />);
    const buttons = screen.getAllByRole('button');
    const retryButton = buttons.find(btn => btn.textContent === '立即重试');
    expect(retryButton).toBeInTheDocument();
  });

  it('渲染查看详情按钮', () => {
    render(<AdminTaskMonitorPage />);
    const buttons = screen.getAllByRole('button');
    const detailButtons = buttons.filter(btn => btn.textContent === '查看详情');
    expect(detailButtons.length).toBeGreaterThan(0);
  });

  it('渲染失败任务错误信息', () => {
    render(<AdminTaskMonitorPage />);
    expect(screen.getByText(/TimeoutError/)).toBeInTheDocument();
    expect(screen.getByText(/LLM API response timeout/)).toBeInTheDocument();
  });

  it('渲染任务状态标签', () => {
    render(<AdminTaskMonitorPage />);
    const statusLabels = screen.getAllByText('任务 ID');
    expect(statusLabels.length).toBeGreaterThan(0);
  });

  it('渲染任务类型标签标题', () => {
    render(<AdminTaskMonitorPage />);
    const typeLabels = screen.getAllByText('任务类型');
    expect(typeLabels.length).toBeGreaterThan(0);
  });
});
