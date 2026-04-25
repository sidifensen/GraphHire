import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserSidebar from '@/components/user/UserSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
}));

describe('UserSidebar', () => {
  it('uses /applications for 投递记录 link', () => {
    render(<UserSidebar />);
    const link = screen.getByText('投递记录').closest('a');
    expect(link).toHaveAttribute('href', '/applications');
  });
});
