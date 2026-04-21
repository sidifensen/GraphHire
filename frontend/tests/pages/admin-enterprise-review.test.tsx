import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminEnterpriseReviewPage from '@/app/admin/enterprise-review/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminEnterpriseReviewPage', () => {
  it('渲染企业审核页面容器和侧边栏', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('渲染页面标题和描述', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('企业审核')).toBeInTheDocument();
    expect(screen.getByText('对注册企业进行资质审核与认证管理。')).toBeInTheDocument();
  });

  it('渲染搜索输入框', () => {
    render(<AdminEnterpriseReviewPage />);
    const searchInput = screen.getByPlaceholderText('搜索企业名称、信用代码...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('渲染状态筛选下拉框', () => {
    render(<AdminEnterpriseReviewPage />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('渲染表格头部', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('企业信息')).toBeInTheDocument();
    expect(screen.getByText('联系人')).toBeInTheDocument();
    expect(screen.getByText('注册时间')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('渲染待审核企业数据', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('科技集团')).toBeInTheDocument();
    expect(screen.getByText('张经理 · 138-0013-8000')).toBeInTheDocument();
  });

  it('渲染已通过企业数据', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('云计算有限公司')).toBeInTheDocument();
    expect(screen.getByText('李总监 · 139-5522-1992')).toBeInTheDocument();
  });

  it('渲染已拒绝企业数据', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('数据服务有限公司')).toBeInTheDocument();
    expect(screen.getByText('王总 · 186-0099-2233')).toBeInTheDocument();
  });

  it('渲染待审核状态标签', () => {
    render(<AdminEnterpriseReviewPage />);
    const pendingTags = screen.getAllByText('待审核');
    expect(pendingTags.length).toBeGreaterThan(0);
  });

  it('渲染已通过状态标签', () => {
    render(<AdminEnterpriseReviewPage />);
    const approvedTags = screen.getAllByText('已通过');
    expect(approvedTags.length).toBeGreaterThan(0);
  });

  it('渲染已拒绝状态标签', () => {
    render(<AdminEnterpriseReviewPage />);
    const rejectedTags = screen.getAllByText('已拒绝');
    expect(rejectedTags.length).toBeGreaterThan(0);
  });

  it('渲染通过审核按钮', () => {
    render(<AdminEnterpriseReviewPage />);
    const buttons = screen.getAllByRole('button');
    const approveButton = buttons.find(btn => btn.textContent === '通过');
    expect(approveButton).toBeInTheDocument();
  });

  it('渲染拒绝审核按钮', () => {
    render(<AdminEnterpriseReviewPage />);
    const buttons = screen.getAllByRole('button');
    const rejectButton = buttons.find(btn => btn.textContent === '拒绝');
    expect(rejectButton).toBeInTheDocument();
  });

  it('渲染分页组件', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('显示 1 至 3 项，共 45 项')).toBeInTheDocument();
  });

  it('渲染分页按钮', () => {
    render(<AdminEnterpriseReviewPage />);
    const buttons = screen.getAllByRole('button');
    const pageButtons = buttons.filter(btn => {
      const text = btn.textContent;
      return text === '1' || text === '2' || text === '3';
    });
    expect(pageButtons.length).toBeGreaterThan(0);
  });

  it('渲染复选框用于批量选择', () => {
    render(<AdminEnterpriseReviewPage />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('渲染企业信用代码', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText(/91110000MA01XXXX1/)).toBeInTheDocument();
  });

  it('渲染注册时间', () => {
    render(<AdminEnterpriseReviewPage />);
    expect(screen.getByText('2024-03-15')).toBeInTheDocument();
  });

  it('渲染重新审核按钮', () => {
    render(<AdminEnterpriseReviewPage />);
    const buttons = screen.getAllByRole('button');
    const reReviewButton = buttons.find(btn => btn.textContent === '重新审核');
    expect(reReviewButton).toBeInTheDocument();
  });

  it('渲染查看按钮', () => {
    render(<AdminEnterpriseReviewPage />);
    const buttons = screen.getAllByRole('button');
    const viewButton = buttons.find(btn => btn.textContent === '查看');
    expect(viewButton).toBeInTheDocument();
  });
});
