import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const {
  getPositionTypeTree,
  updatePositionTypeStatus,
  movePositionType,
  createPositionType,
} = vi.hoisted(() => ({
  getPositionTypeTree: vi.fn().mockResolvedValue([
    {
      id: 1000000,
      code: 1000000,
      name: '技术',
      parentId: null,
      level: 1,
      sortNo: 0,
      status: 1,
      updatedAt: '2026-05-02 14:00:00',
      children: [
        {
          id: 1001000,
          code: 1001000,
          name: '后端开发',
          parentId: 1000000,
          level: 2,
          sortNo: 0,
          status: 1,
          updatedAt: '2026-05-02 14:01:00',
          children: [
            {
              id: 1001002,
              code: 1001002,
              name: 'Java',
              parentId: 1001000,
              level: 3,
              sortNo: 0,
              status: 1,
              updatedAt: '2026-05-02 14:02:00',
              children: [],
            },
            {
              id: 1001003,
              code: 1001003,
              name: 'Go',
              parentId: 1001000,
              level: 3,
              sortNo: 1,
              status: 1,
              updatedAt: '2026-05-02 14:03:00',
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 2000000,
      code: 2000000,
      name: '产品',
      parentId: null,
      level: 1,
      sortNo: 1,
      status: 1,
      updatedAt: '2026-05-02 14:10:00',
      children: [
        {
          id: 2001000,
          code: 2001000,
          name: '产品经理',
          parentId: 2000000,
          level: 2,
          sortNo: 0,
          status: 1,
          updatedAt: '2026-05-02 14:11:00',
          children: [],
        },
      ],
    },
  ]),
  updatePositionTypeStatus: vi.fn().mockResolvedValue(undefined),
  movePositionType: vi.fn().mockResolvedValue(undefined),
  createPositionType: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getPositionTypeTree,
    updatePositionTypeStatus,
    movePositionType,
    createPositionType,
    updatePositionType: vi.fn().mockResolvedValue(undefined),
  },
}));

import AdminPositionTypesPage from '@/app/admin/position-types/page';

describe('AdminPositionTypesPage', () => {
  beforeEach(() => {
    getPositionTypeTree.mockClear();
    updatePositionTypeStatus.mockClear();
    movePositionType.mockClear();
    createPositionType.mockClear();
  });

  it('renders split view by default and keeps two mode buttons', async () => {
    render(<AdminPositionTypesPage />);

    await waitFor(() => {
      expect(getPositionTypeTree).toHaveBeenCalledWith({
        keyword: undefined,
        status: undefined,
        level: undefined,
      });
    });

    expect(screen.getByText('树+详情')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '路径面包屑视图' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '分栏级联视图' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '树形表格' })).not.toBeInTheDocument();
    const modeButtons = screen.getAllByRole('button').filter((button) => {
      const label = button.textContent?.trim();
      return label === '树+详情' || label === '分栏级联视图';
    });
    expect(modeButtons.map((button) => button.textContent?.trim())).toEqual(['树+详情', '分栏级联视图']);
    expect(screen.getByText('节点详情')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '树+详情' }));
    expect(screen.getByText('节点详情')).toBeInTheDocument();
  });

  it('passes filter params and triggers node actions', async () => {
    render(<AdminPositionTypesPage />);

    await waitFor(() => {
      expect(getPositionTypeTree).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText('搜索职位类型'), { target: { value: 'Java' } });

    await waitFor(() => {
      expect(getPositionTypeTree).toHaveBeenLastCalledWith({
        keyword: 'Java',
        status: undefined,
        level: undefined,
      });
    });

    fireEvent.click(screen.getByText('Java'));
    fireEvent.click(screen.getByRole('button', { name: '停用' }));
    await waitFor(() => {
      expect(updatePositionTypeStatus).toHaveBeenCalledWith(1001002, 0);
    });

    fireEvent.click(screen.getByRole('button', { name: '上移' }));
    await waitFor(() => {
      expect(movePositionType).toHaveBeenCalledWith(1001002, 'UP');
    });
  });

  it('supports cascade view and column linkage', async () => {
    render(<AdminPositionTypesPage />);

    await waitFor(() => {
      expect(getPositionTypeTree).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: '分栏级联视图' }));

    expect(screen.getByRole('heading', { name: '一级' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '二级' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '三级' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '产品' }));
    expect(screen.getByRole('button', { name: '产品经理' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '后端开发' })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('产品')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '产品经理' }));
    expect(screen.getByDisplayValue('产品经理')).toBeInTheDocument();
  });
});
