import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 GraphHire 图谱智聘/i)).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('关于我们')).toBeDefined();
    expect(screen.getByText('联系方式')).toBeDefined();
    expect(screen.getByText('服务条款')).toBeDefined();
    expect(screen.getByText('隐私政策')).toBeDefined();
  });
});
