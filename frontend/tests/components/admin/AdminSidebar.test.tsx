/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const usePathname = vi.fn(() => '/admin/dashboard');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

describe('AdminSidebar', () => {
  it('渲染品牌和主导航项', () => {
    render(<AdminSidebar isCollapsed={false} />);
    expect(screen.getByText('GraphHire')).toBeInTheDocument();
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('企业审核')).toBeInTheDocument();
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('任务监控')).toBeInTheDocument();
  });

  it('渲染正确的路由链接', () => {
    render(<AdminSidebar isCollapsed={false} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/admin/dashboard');
    expect(hrefs).toContain('/admin/enterprise-review');
    expect(hrefs).toContain('/admin/users');
    expect(hrefs).toContain('/admin/skill-tags');
    expect(hrefs).toContain('/admin/task-monitor');
  });

  it('折叠时不展示文字标签', () => {
    render(<AdminSidebar isCollapsed={true} />);
    expect(screen.queryByText('仪表盘')).not.toBeInTheDocument();
  });
});
