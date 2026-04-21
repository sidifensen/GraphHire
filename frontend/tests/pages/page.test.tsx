import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
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

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<HomePage />);
    expect(screen.getByText(/AI 驱动/)).toBeDefined();
  });

  it('renders navigation header', () => {
    render(<HomePage />);
    expect(screen.getByText('图谱智聘')).toBeDefined();
  });

  it('renders recommended jobs section', () => {
    render(<HomePage />);
    expect(screen.getByText('为您精选职位')).toBeDefined();
  });

  it('renders sidebar', () => {
    render(<HomePage />);
    expect(screen.getByText('认知导视体系')).toBeDefined();
    expect(screen.getByText('热门企业')).toBeDefined();
  });

  it('renders footer', () => {
    render(<HomePage />);
    expect(screen.getByText(/© 2026 GraphHire/)).toBeDefined();
  });
});
