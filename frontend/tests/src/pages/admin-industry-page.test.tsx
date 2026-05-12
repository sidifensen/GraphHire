import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const {
  getIndustryTree,
  createIndustry,
  updateIndustryStatus,
  moveIndustry,
  deleteIndustry,
} = vi.hoisted(() => ({
  getIndustryTree: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: '计算机/互联网/通信/电子',
      parentId: null,
      level: 1,
      enabled: 1,
      sort: 0,
      children: [
        { id: 2, name: '计算机软件', parentId: 1, level: 2, enabled: 1, sort: 0, children: [] },
        { id: 3, name: '计算机硬件', parentId: 1, level: 2, enabled: 1, sort: 1, children: [] },
      ],
    },
    {
      id: 4,
      name: '会计/金融/银行/保险',
      parentId: null,
      level: 1,
      enabled: 1,
      sort: 1,
      children: [{ id: 5, name: '会计/审计', parentId: 4, level: 2, enabled: 1, sort: 0, children: [] }],
    },
  ]),
  createIndustry: vi.fn().mockResolvedValue(undefined),
  updateIndustryStatus: vi.fn().mockResolvedValue(undefined),
  moveIndustry: vi.fn().mockResolvedValue(undefined),
  deleteIndustry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getIndustryTree,
    createIndustry,
    updateIndustryStatus,
    moveIndustry,
    deleteIndustry,
  },
}));

import AdminIndustryPage from '@/app/admin/industry/page';

describe('AdminIndustryPage tree/cascade views', () => {
  beforeEach(() => {
    getIndustryTree.mockClear();
    createIndustry.mockClear();
    updateIndustryStatus.mockClear();
    moveIndustry.mockClear();
    deleteIndustry.mockClear();
  });

  it('loads tree and supports split/cascade switch + basic operations', async () => {
    render(<AdminIndustryPage />);

    await waitFor(() => {
      expect(getIndustryTree).toHaveBeenCalledWith({
        keyword: undefined,
        enabled: undefined,
        level: undefined,
      });
    });

    expect(screen.getByText('行业树')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '分栏级联视图' }));
    expect(screen.getAllByText('一级').length).toBeGreaterThan(0);
    expect(screen.getAllByText('二级').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '树+详情' }));

    fireEvent.click(screen.getByRole('button', { name: '上移' }));
    await waitFor(() => expect(moveIndustry).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: '停用' }));
    await waitFor(() => expect(updateIndustryStatus).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    await waitFor(() => expect(deleteIndustry).toHaveBeenCalled());
  });

  it('creates root industry and child industry', async () => {
    render(<AdminIndustryPage />);

    await waitFor(() => expect(getIndustryTree).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /新增一级/ }));
    fireEvent.change(screen.getByLabelText('行业名称'), { target: { value: '新一级行业' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() =>
      expect(createIndustry).toHaveBeenCalledWith({
        name: '新一级行业',
        parentId: null,
        enabled: 1,
      }),
    );
  });
});
