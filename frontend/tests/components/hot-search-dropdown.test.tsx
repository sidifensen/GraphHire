import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HotSearchDropdown } from '@/components/ui/hot-search-dropdown';

describe('HotSearchDropdown', () => {
  it('does not render when closed', () => {
    render(
      <HotSearchDropdown
        open={false}
        items={[{ keyword: 'Java', score: 3 }]}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('hot-search-dropdown')).toBeNull();
  });

  it('renders loading text', () => {
    render(
      <HotSearchDropdown
        open
        loading
        items={[]}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('renders empty text', () => {
    render(
      <HotSearchDropdown
        open
        items={[]}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('暂无热门搜索')).toBeInTheDocument();
  });

  it('calls onSelect when clicking item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <HotSearchDropdown
        open
        items={[
          { keyword: 'Java', score: 6 },
          { keyword: 'Golang', score: 2 },
        ]}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByText('Java'));
    expect(onSelect).toHaveBeenCalledWith('Java');
  });
});

