import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminSettingsPage from '@/app/admin/settings/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染系统设置页面标题', () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText('系统设置（演示）')).toBeInTheDocument();
  });

  it('展示允许注册和维护模式复选框', () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText('允许注册')).toBeInTheDocument();
    expect(screen.getByText('维护模式')).toBeInTheDocument();
    expect(screen.getByText('最大上传大小(MB)')).toBeInTheDocument();
  });

  it('点击复选框可以切换状态', () => {
    render(<AdminSettingsPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);

    // 第一个是"允许注册"复选框
    const allowRegisterCheckbox = checkboxes[0];
    expect(allowRegisterCheckbox).toBeChecked();

    fireEvent.click(allowRegisterCheckbox);
    expect(allowRegisterCheckbox).not.toBeChecked();
  });

  it('点击保存按钮显示保存成功提示', () => {
    render(<AdminSettingsPage />);

    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);

    expect(screen.getByText('演示模式：设置已保存（仅本地状态）')).toBeInTheDocument();
  });

  it('可以修改最大上传大小', () => {
    render(<AdminSettingsPage />);

    const numberInput = screen.getByRole('spinbutton');
    expect(numberInput).toHaveValue(20);

    fireEvent.change(numberInput, { target: { value: '50' } });
    expect(screen.getByRole('spinbutton')).toHaveValue(50);
  });
});