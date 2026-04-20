import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobsPage from '@/app/jobs/page';

describe('JobsPage', () => {
  it('renders page title', () => {
    render(<JobsPage />);
    expect(screen.getByText('探索智能匹配职位')).toBeDefined();
  });

  it('renders search input', () => {
    render(<JobsPage />);
    expect(screen.getByPlaceholderText(/输入职位/)).toBeDefined();
  });

  it('renders filter buttons', () => {
    render(<JobsPage />);
    expect(screen.getByText('推荐城市')).toBeDefined();
    expect(screen.getByText('薪资范畴')).toBeDefined();
    expect(screen.getByText('经验要求')).toBeDefined();
  });

  it('renders job listings', () => {
    render(<JobsPage />);
    expect(screen.getByText(/资深前端架构师/)).toBeDefined();
    expect(screen.getByText(/AI 交互设计师/)).toBeDefined();
  });

  it('renders pagination', () => {
    render(<JobsPage />);
    expect(screen.getByText('1')).toBeDefined();
  });
});
