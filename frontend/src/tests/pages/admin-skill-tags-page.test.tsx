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
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
  updateSkillTag: vi.fn().mockResolvedValue(undefined),
  deleteSkillTag: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  it('keeps only search input and supports edit/delete with visible synonyms', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Java 21');
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
    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    await waitFor(() => {
      expect(updateSkillTag).toHaveBeenCalledWith(1, { name: 'Java 21' });
      expect(deleteSkillTag).toHaveBeenCalledWith(1);
    });
  });
});
