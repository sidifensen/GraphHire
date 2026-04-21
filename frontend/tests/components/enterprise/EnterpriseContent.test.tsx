/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';

describe('EnterpriseContent', () => {
  it('renders children content', () => {
    render(
      <EnterpriseContent>
        <div data-testid="test-child">Test Content</div>
      </EnterpriseContent>
    );
    expect(screen.getByTestId('test-child')).toBeDefined();
  });

  it('renders children inside the content wrapper', () => {
    render(
      <EnterpriseContent>
        <p>Paragraph content</p>
      </EnterpriseContent>
    );
    const content = screen.getByText('Paragraph content');
    expect(content).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <EnterpriseContent>
        <span>Content</span>
      </EnterpriseContent>
    );
    const contentDiv = container.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass('flex-1');
    expect(contentDiv).toHaveClass('overflow-y-auto');
    expect(contentDiv).toHaveClass('p-8');
  });

  it('applies max-width constraint', () => {
    const { container } = render(
      <EnterpriseContent>
        <div>Content</div>
      </EnterpriseContent>
    );
    const contentDiv = container.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass('max-w-[1440px]');
    expect(contentDiv).toHaveClass('mx-auto');
    expect(contentDiv).toHaveClass('w-full');
  });

  it('renders multiple children', () => {
    render(
      <EnterpriseContent>
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </EnterpriseContent>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders empty when no children provided', () => {
    const { container } = render(<EnterpriseContent>{null}</EnterpriseContent>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles string children', () => {
    render(<EnterpriseContent>Simple string content</EnterpriseContent>);
    expect(screen.getByText('Simple string content')).toBeInTheDocument();
  });

  it('renders nested components', () => {
    render(
      <EnterpriseContent>
        <article>
          <h1>Title</h1>
          <p>Description</p>
        </article>
      </EnterpriseContent>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies space-y-8 for vertical spacing', () => {
    const { container } = render(
      <EnterpriseContent>
        <div>Item 1</div>
        <div>Item 2</div>
      </EnterpriseContent>
    );
    const contentDiv = container.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass('space-y-8');
  });

  it('has bottom padding for footer clearance', () => {
    const { container } = render(
      <EnterpriseContent>
        <div>Content</div>
      </EnterpriseContent>
    );
    const contentDiv = container.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass('pb-20');
  });
});
