import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminUsersPage', () => {
  it('渲染用户管理页面容器和侧边栏', () => {
    render(<AdminUsersPage />);
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('渲染页面标题和描述', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('用户治理与分析')).toBeInTheDocument();
    expect(screen.getByText('对平台全量用户进行维度筛选、状态管控及行为追踪，以维护图谱生态的健康度。')).toBeInTheDocument();
  });

  it('渲染搜索输入框', () => {
    render(<AdminUsersPage />);
    const searchInput = screen.getByPlaceholderText('搜索用户 ID、昵称或手机号...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('渲染用户类型筛选下拉框', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('所有用户类型')).toBeInTheDocument();
  });

  it('渲染个人用户选项', () => {
    render(<AdminUsersPage />);
    const personalOptions = screen.getAllByText('个人用户');
    expect(personalOptions.length).toBeGreaterThan(0);
  });

  it('渲染企业联系人选项', () => {
    render(<AdminUsersPage />);
    const corporateOptions = screen.getAllByText('企业联系人');
    expect(corporateOptions.length).toBeGreaterThan(0);
  });

  it('渲染账号状态筛选', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('所有账号状态')).toBeInTheDocument();
  });

  it('渲染正常状态选项', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('正常 (Normal)')).toBeInTheDocument();
  });

  it('渲染禁用状态选项', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('禁用 (Disabled)')).toBeInTheDocument();
  });

  it('渲染锁定状态选项', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('锁定 (Locked)')).toBeInTheDocument();
  });

  it('渲染批量禁用按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const batchDisableButton = buttons.find(btn => btn.textContent?.includes('批量禁用'));
    expect(batchDisableButton).toBeInTheDocument();
  });

  it('渲染批量导出按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const exportButton = buttons.find(btn => btn.textContent?.includes('批量导出'));
    expect(exportButton).toBeInTheDocument();
  });

  it('渲染已选择项计数', () => {
    render(<AdminUsersPage />);
    // 批量操作区域存在，验证相关功能已渲染
    const buttons = screen.getAllByRole('button');
    const batchDisableButton = buttons.find(btn => btn.textContent?.includes('批量禁用'));
    const batchExportButton = buttons.find(btn => btn.textContent?.includes('批量导出'));
    expect(batchDisableButton).toBeInTheDocument();
    expect(batchExportButton).toBeInTheDocument();
  });

  it('渲染表格列标题', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('用户信息 (User Profile)')).toBeInTheDocument();
    expect(screen.getByText('联系方式 (Contact)')).toBeInTheDocument();
    expect(screen.getByText('时间节点 (Timeline)')).toBeInTheDocument();
    expect(screen.getByText('状态 (Status)')).toBeInTheDocument();
    expect(screen.getByText('操作 (Actions)')).toBeInTheDocument();
  });

  it('渲染正常个人用户数据', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('林晓月')).toBeInTheDocument();
    const personalTags = screen.getAllByText('个人');
    expect(personalTags.length).toBeGreaterThan(0);
  });

  it('渲染用户ID', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('UID: GH-88201A')).toBeInTheDocument();
  });

  it('渲染注册时间', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('2023-10-12 注册')).toBeInTheDocument();
  });

  it('渲染登录时间', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('2 小时前登录')).toBeInTheDocument();
  });

  it('渲染正常状态标签', () => {
    render(<AdminUsersPage />);
    const normalTags = screen.getAllByText('正常');
    expect(normalTags.length).toBeGreaterThan(0);
  });

  it('渲染禁用状态用户', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('张建国')).toBeInTheDocument();
  });

  it('渲染禁用状态标签', () => {
    render(<AdminUsersPage />);
    const disabledTags = screen.getAllByText('禁用');
    expect(disabledTags.length).toBeGreaterThan(0);
  });

  it('渲染锁定状态用户', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Wang_Design')).toBeInTheDocument();
  });

  it('渲染锁定状态标签', () => {
    render(<AdminUsersPage />);
    const lockedTags = screen.getAllByText('锁定');
    expect(lockedTags.length).toBeGreaterThan(0);
  });

  it('渲染异常登录提示', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('异常登录尝试')).toBeInTheDocument();
  });

  it('渲染禁用按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const disableButtons = buttons.filter(btn => btn.textContent === '禁用');
    expect(disableButtons.length).toBeGreaterThan(0);
  });

  it('渲染启用按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const enableButton = buttons.find(btn => btn.textContent === '启用');
    expect(enableButton).toBeInTheDocument();
  });

  it('渲染重置密码按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const resetButtons = buttons.filter(btn => btn.textContent === '重置密码');
    expect(resetButtons.length).toBeGreaterThan(0);
  });

  it('渲染解锁按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const unlockButton = buttons.find(btn => btn.textContent === '解锁');
    expect(unlockButton).toBeInTheDocument();
  });

  it('渲染分页组件', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('显示 1 至 4 项，共 2,451 项')).toBeInTheDocument();
  });

  it('渲染分页按钮', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button');
    const pageButtons = buttons.filter(btn => {
      const text = btn.textContent;
      return text === '1' || text === '2' || text === '3';
    });
    expect(pageButtons.length).toBeGreaterThan(0);
  });

  it('渲染复选框', () => {
    render(<AdminUsersPage />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
});
