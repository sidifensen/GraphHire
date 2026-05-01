import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

describe('HomePage', () => {
  it('renders migrated mock home hero', () => {
    render(<HomePage />);
    expect(screen.getByText('图谱智聘领航未来')).toBeInTheDocument();
    expect(screen.getAllByText('立即开启智能招聘').length).toBeGreaterThan(0);
    expect(screen.getByText('AI匹配指数')).toBeInTheDocument();
    expect(screen.getByText('企业活跃席位')).toBeInTheDocument();
    expect(screen.getByText('候选人响应率')).toBeInTheDocument();
  });

  it('renders galaxy style right hero card metrics', () => {
    render(<HomePage />);
    expect(screen.getByText('7日成功匹配')).toBeInTheDocument();
    expect(screen.getByText('3,286')).toBeInTheDocument();
    expect(screen.getByTestId('hero-visual-card')).toBeInTheDocument();
    expect(screen.getByTestId('hero-metrics-strip')).toBeInTheDocument();
  });
});
