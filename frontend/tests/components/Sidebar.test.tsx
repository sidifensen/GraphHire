import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

describe('Sidebar', () => {
  it('renders cognitive guide system card', () => {
    render(<Sidebar />);
    expect(screen.getByText('认知导视体系')).toBeDefined();
  });

  it('renders feature items', () => {
    render(<Sidebar />);
    expect(screen.getByText('智能解析')).toBeDefined();
    expect(screen.getByText('图谱分析')).toBeDefined();
    expect(screen.getByText('精准匹配')).toBeDefined();
  });

  it('renders popular companies section', () => {
    render(<Sidebar />);
    expect(screen.getByText('热门企业')).toBeDefined();
  });

  it('renders company names', () => {
    render(<Sidebar />);
    expect(screen.getByText('云图数据')).toBeDefined();
    expect(screen.getByText('星河智联')).toBeDefined();
    expect(screen.getByText('盾甲科技')).toBeDefined();
    expect(screen.getByText('元界互动')).toBeDefined();
  });
});
