import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminDashboardPage', () => {
  it('渲染仪表盘页面容器和侧边栏', () => {
    const { container } = render(<AdminDashboardPage />);
    expect(screen.getByTestId('admin-sidebar')).toBeDefined();
    expect(screen.getByTestId('admin-header')).toBeDefined();
    const shell = container.firstElementChild;
    expect(shell?.className).toContain('h-screen');
    expect(shell?.className).toContain('overflow-hidden');
  });

  it('渲染数据总览标题和描述', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('数据总览')).toBeDefined();
    expect(screen.getByText('系统运行状态与核心业务指标监控。')).toBeDefined();
  });

  it('渲染用户总数统计卡片', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('用户总数')).toBeDefined();
    expect(screen.getByText('12,480')).toBeDefined();
  });

  it('渲染企业总数统计卡片', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('企业总数')).toBeDefined();
    expect(screen.getByText('856')).toBeDefined();
  });

  it('渲染简历总数统计卡片', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('简历总数')).toBeDefined();
    expect(screen.getByText('45,210')).toBeDefined();
  });

  it('渲染在招职位统计卡片', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('在招职位')).toBeDefined();
    expect(screen.getByText('3,200')).toBeDefined();
  });

  it('渲染近30天趋势图', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('近 30 天趋势图')).toBeDefined();
    expect(screen.getByText('日活用户与新增数据对比分析')).toBeDefined();
  });

  it('渲染趋势图图例', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('日活用户')).toBeDefined();
    expect(screen.getByText('新增数据')).toBeDefined();
  });

  it('渲染快捷入口区域', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('快捷入口')).toBeDefined();
  });

  it('渲染企业审核快捷入口按钮', () => {
    render(<AdminDashboardPage />);
    const buttons = screen.getAllByRole('button');
    const enterpriseButton = buttons.find(btn => btn.textContent?.includes('企业审核'));
    expect(enterpriseButton).toBeDefined();
  });

  it('渲染失败任务重试快捷入口按钮', () => {
    render(<AdminDashboardPage />);
    const buttons = screen.getAllByRole('button');
    const retryButton = buttons.find(btn => btn.textContent?.includes('失败任务重试'));
    expect(retryButton).toBeDefined();
  });

  it('渲染标签治理快捷入口按钮', () => {
    render(<AdminDashboardPage />);
    const buttons = screen.getAllByRole('button');
    const tagButton = buttons.find(btn => btn.textContent?.includes('标签治理'));
    expect(tagButton).toBeDefined();
  });

  it('渲染AI匹配总数卡片', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('AI 匹配总数')).toBeDefined();
    expect(screen.getByText('128,400')).toBeDefined();
  });

  it('渲染运营指标区域', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('运营指标')).toBeDefined();
  });

  it('渲染任务成功率指标', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('任务成功率')).toBeDefined();
    expect(screen.getByText('98.5%')).toBeDefined();
  });

  it('渲染企业周新增数指标', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('企业周新增数')).toBeDefined();
  });

  it('渲染待办事项区域', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('待办事项')).toBeDefined();
  });

  it('渲染待审核企业待办项', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('待审核企业')).toBeDefined();
  });

  it('渲染失败解析任务待办项', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('失败解析任务')).toBeDefined();
  });

  it('渲染待处理标签建议待办项', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('待处理标签建议')).toBeDefined();
  });

  it('渲染待办项数量徽章', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('24')).toBeDefined();
  });
});
