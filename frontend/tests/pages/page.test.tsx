import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

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
    expect(screen.getByText(/© 2024 GraphHire/)).toBeDefined();
  });
});
