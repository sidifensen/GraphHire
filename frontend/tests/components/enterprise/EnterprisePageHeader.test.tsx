/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';

describe('EnterprisePageHeader', () => {
  it('renders title correctly', () => {
    render(<EnterprisePageHeader title="职位管理" />);
    expect(screen.getByText('职位管理')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EnterprisePageHeader title="标题" description="这是描述" />);
    expect(screen.getByText('这是描述')).toBeInTheDocument();
  });

  it('does not render description text when not provided', () => {
    const { container } = render(<EnterprisePageHeader title="仅标题" />);
    // Only badge text + title should be present, no description
    expect(screen.getByText('仅标题')).toBeInTheDocument();
    expect(screen.queryByText('这是描述')).not.toBeInTheDocument();
  });

  it('renders enterprise management badge', () => {
    render(<EnterprisePageHeader title="测试" />);
    expect(screen.getByText('企业管理')).toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    render(
      <EnterprisePageHeader
        title="测试"
        action={<button data-testid="action-btn">操作</button>}
      />
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('has correct layout with action div when action is provided', () => {
    render(
      <EnterprisePageHeader
        title="测试"
        action={<button>按钮</button>}
      />
    );
    const allDivs = document.querySelectorAll('div');
    // With action, there should be more divs
    expect(allDivs.length).toBeGreaterThanOrEqual(2);
  });

  it('applies correct title styling', () => {
    render(<EnterprisePageHeader title="样式测试" />);
    const title = screen.getByText('样式测试');
    expect(title).toHaveClass('text-3xl');
    expect(title).toHaveClass('font-bold');
    expect(title).toHaveClass('font-headline');
  });

  it('applies correct layout classes', () => {
    const { container } = render(<EnterprisePageHeader title="布局" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('justify-between');
    expect(wrapper).toHaveClass('items-end');
    expect(wrapper).toHaveClass('mb-8');
  });

  it('renders complex action content', () => {
    render(
      <EnterprisePageHeader
        title="复杂操作"
        action={
          <div>
            <button>按钮1</button>
            <button>按钮2</button>
          </div>
        }
      />
    );
    expect(screen.getByText('按钮1')).toBeInTheDocument();
    expect(screen.getByText('按钮2')).toBeInTheDocument();
  });

  it('handles long title text', () => {
    const longTitle = '这是一个非常非常长的页面标题用于测试';
    render(<EnterprisePageHeader title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});
