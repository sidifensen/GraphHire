import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';
import { BrowserRouter } from 'react-router-dom';

const MockHeader = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe('Header', () => {
  it('renders logo text', () => {
    render(<MockHeader />);
    expect(screen.getByText(/图谱智聘/)).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<MockHeader />);
    expect(screen.getByText(/首页/)).toBeDefined();
    expect(screen.getByText(/职位/)).toBeDefined();
    expect(screen.getByText(/公司/)).toBeDefined();
    expect(screen.getByText(/能力图谱/)).toBeDefined();
  });

  it('renders notification and chat buttons', () => {
    render(<MockHeader />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
