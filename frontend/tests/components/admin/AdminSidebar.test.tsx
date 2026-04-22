/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/admin/AdminSidebar';

describe('AdminSidebar', () => {
  describe('default state', () => {
    it('renders GraphHire brand', () => {
      render(<AdminSidebar />);
      expect(screen.getByText('GraphHire')).toBeInTheDocument();
    });

    it('renders admin portal label', () => {
      render(<AdminSidebar />);
      expect(screen.getByText('图谱智聘管理端')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<AdminSidebar />);
      expect(screen.getByText('工作台')).toBeInTheDocument();
      expect(screen.getByText('企业审核')).toBeInTheDocument();
      expect(screen.getByText('用户管理')).toBeInTheDocument();
      expect(screen.getByText('标签治理')).toBeInTheDocument();
      expect(screen.getByText('任务监控')).toBeInTheDocument();
      expect(screen.getByText('系统设置')).toBeInTheDocument();
    });

    it('renders dashboard as active by default', () => {
      render(<AdminSidebar activeItem="dashboard" />);
      const dashboardLink = screen.getByRole('link', { name: /工作台/ });
      expect(dashboardLink).toHaveClass('bg-blue-50');
    });

    it('renders active admin sidebar motion indicator', () => {
      render(<AdminSidebar activeItem="dashboard" />);
      expect(screen.getByTestId('admin-sidebar-indicator')).toBeInTheDocument();
    });

    it('has correct href for dashboard', () => {
      render(<AdminSidebar />);
      const dashboardLink = screen.getByRole('link', { name: /工作台/ });
      expect(dashboardLink.getAttribute('href')).toBe('/admin/dashboard');
    });
  });

  describe('active states', () => {
    it('renders enterprise-review as active when specified', () => {
      render(<AdminSidebar activeItem="enterprise-review" />);
      const reviewLink = screen.getByRole('link', { name: /企业审核/ });
      expect(reviewLink).toHaveClass('bg-blue-50');
      expect(reviewLink).toHaveClass('text-blue-600');
    });

    it('renders users as active when specified', () => {
      render(<AdminSidebar activeItem="users" />);
      const usersLink = screen.getByRole('link', { name: /用户管理/ });
      expect(usersLink).toHaveClass('bg-blue-50');
    });

    it('renders skill-tags as active when specified', () => {
      render(<AdminSidebar activeItem="skill-tags" />);
      const skillTagsLink = screen.getByRole('link', { name: /标签治理/ });
      expect(skillTagsLink).toHaveClass('bg-blue-50');
    });

    it('renders task-monitor as active when specified', () => {
      render(<AdminSidebar activeItem="task-monitor" />);
      const taskMonitorLink = screen.getByRole('link', { name: /任务监控/ });
      expect(taskMonitorLink).toHaveClass('bg-blue-50');
    });

    it('renders settings as active when specified', () => {
      render(<AdminSidebar activeItem="settings" />);
      const settingsLink = screen.getByRole('link', { name: /系统设置/ });
      expect(settingsLink).toHaveClass('bg-blue-50');
    });

    it('renders correct hrefs for each menu item', () => {
      render(<AdminSidebar />);
      const links = screen.getAllByRole('link');
      const hrefs = links.map(link => link.getAttribute('href'));
      expect(hrefs).toContain('/admin/dashboard');
      expect(hrefs).toContain('/admin/enterprise-review');
      expect(hrefs).toContain('/admin/users');
      expect(hrefs).toContain('/admin/skill-tags');
      expect(hrefs).toContain('/admin/task-monitor');
      expect(hrefs).toContain('/admin/settings');
    });
  });

  describe('rendering', () => {
    it('renders aside element', () => {
      const { container } = render(<AdminSidebar />);
      expect(container.querySelector('aside')).toBeDefined();
    });

    it('renders all navigation items as links', () => {
      render(<AdminSidebar />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(6);
    });

    it('renders hub icon in header', () => {
      render(<AdminSidebar />);
      const iconElements = document.querySelectorAll('.material-symbols-outlined');
      const hasHubIcon = Array.from(iconElements).some(
        icon => icon.textContent?.includes('hub')
      );
      expect(hasHubIcon).toBe(true);
    });

    it('renders icon-fill class on active item', () => {
      render(<AdminSidebar activeItem="dashboard" />);
      const activeLink = screen.getByRole('link', { name: /工作台/ });
      const iconInActiveLink = activeLink.querySelector('.material-symbols-outlined');
      expect(iconInActiveLink).toHaveClass('icon-fill');
    });
  });
});
