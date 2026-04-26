import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

describe('AdminSidebar logo', () => {
  it('uses favicon logo with consistent size in expanded and collapsed states', () => {
    const { rerender } = render(<AdminSidebar isCollapsed={false} />);

    const expandedLogo = screen.getByTestId('admin-brand-logo') as HTMLImageElement;
    expect(expandedLogo).toBeInTheDocument();
    expect(expandedLogo.getAttribute('src')).toBe('/favicon.svg');
    expect(expandedLogo.className).toContain('w-8');
    expect(expandedLogo.className).toContain('h-8');
    expect(screen.getByText('GraphHire')).toBeInTheDocument();

    rerender(<AdminSidebar isCollapsed />);

    const collapsedLogo = screen.getByTestId('admin-brand-logo') as HTMLImageElement;
    expect(collapsedLogo).toBeInTheDocument();
    expect(collapsedLogo.getAttribute('src')).toBe('/favicon.svg');
    expect(collapsedLogo.className).toContain('w-8');
    expect(collapsedLogo.className).toContain('h-8');
    expect(screen.queryByText('GraphHire')).not.toBeInTheDocument();
  });
});
