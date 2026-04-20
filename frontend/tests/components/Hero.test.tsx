import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

describe('Hero', () => {
  it('renders main headline', () => {
    render(<Hero />);
    expect(screen.getByText(/AI 驱动/)).toBeDefined();
    expect(screen.getByText(/图谱智联/)).toBeDefined();
  });

  it('renders subtitle text', () => {
    render(<Hero />);
    expect(screen.getByText(/构建属于你的认知导视体验/)).toBeDefined();
  });

  it('renders search input', () => {
    render(<Hero />);
    expect(screen.getByPlaceholderText(/搜索职位/)).toBeDefined();
  });

  it('renders city input', () => {
    render(<Hero />);
    expect(screen.getByPlaceholderText('城市')).toBeDefined();
  });

  it('renders salary select', () => {
    render(<Hero />);
    expect(screen.getByText('薪资要求')).toBeDefined();
  });

  it('renders search button', () => {
    render(<Hero />);
    expect(screen.getByText('智能搜索')).toBeDefined();
  });

  it('renders popular tags', () => {
    render(<Hero />);
    expect(screen.getByText('Java')).toBeDefined();
    expect(screen.getByText('AI算法')).toBeDefined();
    expect(screen.getByText('产品经理')).toBeDefined();
  });
});
