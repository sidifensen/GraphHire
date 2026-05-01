import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getIndustryList, moveIndustry } = vi.hoisted(() => ({
  getIndustryList: vi.fn().mockResolvedValue({
    list: [
      { id: 1, name: '互联网', enabled: 1, sortOrder: 0, updatedAt: '2026-05-01 10:00:00' },
      { id: 2, name: '金融科技', enabled: 1, sortOrder: 1, updatedAt: '2026-05-01 11:00:00' },
      { id: 3, name: '电子商务', enabled: 1, sortOrder: 2, updatedAt: '2026-05-01 12:00:00' },
    ],
    total: 3,
    page: 1,
    pageSize: 10,
  }),
  moveIndustry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getIndustryList,
    createIndustry: vi.fn().mockResolvedValue(undefined),
    updateIndustryStatus: vi.fn().mockResolvedValue(undefined),
    moveIndustry,
  },
}));

import AdminIndustryPage from '@/app/admin/industry/page';

describe('AdminIndustryPage sorting and move actions', () => {
  beforeEach(() => {
    getIndustryList.mockClear();
    moveIndustry.mockClear();
  });

  it('supports sorting params and move up/down actions', async () => {
    render(<AdminIndustryPage />);

    await waitFor(() => {
      expect(getIndustryList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        sortBy: 'sortOrder',
        sortDir: 'asc',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /行业名称/ }));
    await waitFor(() => {
      expect(getIndustryList).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        sortBy: 'name',
        sortDir: 'asc',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /行业名称/ }));
    await waitFor(() => {
      expect(getIndustryList).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        sortBy: 'name',
        sortDir: 'desc',
      });
    });

    fireEvent.click(screen.getAllByRole('button', { name: '上移' })[1]);
    await waitFor(() => {
      expect(moveIndustry).toHaveBeenCalledWith(2, 'UP');
    });

    fireEvent.click(screen.getAllByRole('button', { name: '下移' })[1]);
    await waitFor(() => {
      expect(moveIndustry).toHaveBeenCalledWith(2, 'DOWN');
    });

    const table = screen.getByRole('table');
    expect(table.className).toContain('table-fixed');

    const actionButtons = screen.getAllByRole('button', { name: /上移|下移|停用|启用/ });
    expect(actionButtons.length).toBeGreaterThan(0);
    for (const button of actionButtons) {
      expect(button.className).toContain('rounded-md');
      expect(button.className).toContain('border');
      expect(button.className).not.toContain('hover:underline');
    }
  });

  it('uses max sortOrder + 1 as default value in create form', async () => {
    render(<AdminIndustryPage />);

    await waitFor(() => {
      expect(getIndustryList).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /新增行业/ }));
    const input = screen.getByLabelText('排序', { selector: 'input' }) as HTMLInputElement;
    expect(input.value).toBe('3');
  });
});
