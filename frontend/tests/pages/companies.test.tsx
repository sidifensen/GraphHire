import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompaniesPage from '@/app/(user)/companies/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/companies',
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

describe('CompaniesPage', () => {
  it('renders search input', () => {
    render(<CompaniesPage />);
    expect(screen.getByPlaceholderText(/搜索公司名称/)).toBeDefined();
  });

  it('renders filter sections', () => {
    render(<CompaniesPage />);
    expect(screen.getByText('行业领域')).toBeDefined();
    expect(screen.getByText('公司规模')).toBeDefined();
    expect(screen.getByText('融资阶段')).toBeDefined();
  });

  it('renders company cards', () => {
    render(<CompaniesPage />);
    expect(screen.getByText('TechNova 智谷科技')).toBeDefined();
    expect(screen.getByText('FinEdge 锐金融')).toBeDefined();
    expect(screen.getByText('CloudMatrix 矩阵云')).toBeDefined();
  });

  it('renders AI match scores', () => {
    render(<CompaniesPage />);
    const matchScores = screen.getAllByText(/AI 匹配度/);
    expect(matchScores.length).toBeGreaterThan(0);
  });
});
