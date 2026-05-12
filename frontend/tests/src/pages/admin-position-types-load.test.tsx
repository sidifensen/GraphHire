import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const loadMock = vi.fn().mockResolvedValue([]);

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getPositionTypeTree: (...args: unknown[]) => loadMock(...args),
    createPositionType: vi.fn().mockResolvedValue(undefined),
    updatePositionType: vi.fn().mockResolvedValue(undefined),
    updatePositionTypeStatus: vi.fn().mockResolvedValue(undefined),
    movePositionType: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/layout/RouteTransition', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AdminPositionTypesPage from '@/app/admin/position-types/page';

describe('AdminPositionTypesPage load behavior', () => {
  beforeEach(() => {
    loadMock.mockClear();
    loadMock.mockResolvedValue([]);
  });

  it('requests tree only once on initial render', async () => {
    render(<AdminPositionTypesPage />);

    await waitFor(() => {
      expect(loadMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('职位类型管理')).toBeInTheDocument();
  });
});
