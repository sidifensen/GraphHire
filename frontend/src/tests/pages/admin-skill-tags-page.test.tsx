import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getSkillList, updateSkillTag, deleteSkillTag } = vi.hoisted(() => ({
  getSkillList: vi.fn().mockResolvedValue({
    list: [
      {
        id: 1,
        name: 'Java',
        category: null,
        synonyms: ['JDK', 'JavaSE'],
        jobCount: 0,
        createdAt: '2026-04-24 19:20:00',
        updatedAt: '2026-04-24 19:30:00',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  updateSkillTag: vi.fn().mockResolvedValue(undefined),
  deleteSkillTag: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getSkillList,
    updateSkillTag,
    deleteSkillTag,
    createSkillTag: vi.fn().mockResolvedValue(undefined),
  },
}));

import AdminSkillTagsPage from '@/app/admin/skill-tags/page';

describe('AdminSkillTagsPage list fields', () => {
  beforeEach(() => {
    getSkillList.mockReset();
    updateSkillTag.mockReset();
    deleteSkillTag.mockReset();
  });

  it('keeps only search input and supports edit/delete with visible synonyms', async () => {
    getSkillList.mockResolvedValue({
      list: [
        {
          id: 1,
          name: 'Java',
          category: null,
          synonyms: ['JDK', 'JavaSE'],
          jobCount: 0,
          createdAt: '2026-04-24 19:20:00',
          updatedAt: '2026-04-24 19:30:00',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(getSkillList).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText('搜索标签')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '筛选' })).not.toBeInTheDocument();
    expect(screen.queryByText('分类')).not.toBeInTheDocument();
    expect(screen.queryByText('引用次数')).not.toBeInTheDocument();

    expect(screen.getByText('JDK')).toBeInTheDocument();
    expect(screen.getByText('JavaSE')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '编辑' }));
    fireEvent.change(screen.getByPlaceholderText('请输入标签名称'), { target: { value: 'Java 21' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    await waitFor(() => {
      expect(updateSkillTag).toHaveBeenCalledWith(1, { name: 'Java 21' });
      expect(deleteSkillTag).toHaveBeenCalledWith(1);
    });
  });

  it('renders synonyms and time when backend uses compatibility fields', async () => {
    getSkillList.mockResolvedValue({
      list: [
        {
          id: 2,
          name: 'Go',
          category: null,
          synonyms: 'Golang,Go Lang',
          jobCount: 0,
          createTime: '2026-04-24 20:00:00',
          update_time: '2026-04-24 20:10:00',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });

    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(getSkillList).toHaveBeenCalled();
    });

    expect(screen.getByText('Golang')).toBeInTheDocument();
    expect(screen.getByText('Go Lang')).toBeInTheDocument();
    expect(screen.getByText(/2026[/-]04[/-]24 20:00:00/)).toBeInTheDocument();
    expect(screen.getByText(/2026[/-]04[/-]24 20:10:00/)).toBeInTheDocument();
  });
});
