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
  });
});
