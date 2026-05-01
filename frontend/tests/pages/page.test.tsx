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
  it('renders dual-funnel hero actions', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: '免费发布职位' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: "Let's get started" })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: '立即找工作' })).toHaveLength(1);
  });

  it('renders trust metrics and dual flows', () => {
    render(<HomePage />);
    const trust = screen.getByLabelText('信任背书');
    expect(trust).toHaveTextContent('活跃企业');
    expect(trust).toHaveTextContent('活跃职位');
    expect(screen.getByLabelText('企业招聘流程')).toBeInTheDocument();
    expect(screen.getByLabelText('求职者流程')).toBeInTheDocument();
    expect(screen.getByLabelText('能力矩阵对照')).toBeInTheDocument();
  });
});
