import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
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

describe('ProfilePage', () => {
  it('renders page title', () => {
    render(<ProfilePage />);
    expect(screen.getAllByText(/个人资料/).length).toBeGreaterThan(0);
  });

  it('renders sidebar navigation', () => {
    render(<ProfilePage />);
    expect(screen.getAllByText(/个人资料/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/简历管理/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/投递记录/).length).toBeGreaterThan(0);
  });

  it('renders basic info section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('基础资料')).toBeDefined();
  });

  it('renders education section', () => {
    render(<ProfilePage />);
    expect(screen.getByText(/教育背景/)).toBeDefined();
  });

  it('renders job intentions section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('求职意向')).toBeDefined();
  });

  it('renders action buttons', () => {
    render(<ProfilePage />);
    expect(screen.getByText('预览图谱')).toBeDefined();
    expect(screen.getByText('保存全部修改')).toBeDefined();
  });
});
