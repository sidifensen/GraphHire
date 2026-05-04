import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserSidebar from '@/components/user/UserSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
}));

describe('UserSidebar', () => {
  it('uses /chat for 沟通消息 link', () => {
    render(<UserSidebar />);
    const link = screen.getByText('沟通消息').closest('a');
    expect(link).toHaveAttribute('href', '/chat');
  });
});
