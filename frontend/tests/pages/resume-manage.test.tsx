import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ManagePage from '@/app/resume/manage/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/resume/manage',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('ManagePage', () => {
  it('renders page title', () => {
    render(<ManagePage />);
    const titles = screen.getAllByText(/简历管理/);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders sidebar navigation', () => {
    render(<ManagePage />);
    expect(screen.getAllByText(/个人资料/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/简历管理/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/投递记录/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/我的图谱/).length).toBeGreaterThan(0);
  });

  it('renders resume list', () => {
    render(<ManagePage />);
    expect(screen.getByText(/Senior_Product_Manager.*Profile.*2024.pdf/)).toBeDefined();
    expect(screen.getByText(/Operations_Director.*Resume.*docx/)).toBeDefined();
  });

  it('renders resume status', () => {
    render(<ManagePage />);
    expect(screen.getByText(/AI 解析完成/)).toBeDefined();
    expect(screen.getByText(/图谱节点构建中/)).toBeDefined();
  });

  it('renders action buttons', () => {
    render(<ManagePage />);
    expect(screen.getByText('上传新简历')).toBeDefined();
    expect(screen.getByText('预览')).toBeDefined();
  });
});
