import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminSkillTagsPage from '@/app/admin/skill-tags/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getSkillList: vi.fn(),
    createSkillTag: vi.fn(),
    updateSkillTag: vi.fn(),
    deleteSkillTag: vi.fn(),
  },
}));

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminSkillTagsPage', () => {
  const mockSkillList = {
    list: [
      {
        id: 1,
        name: 'JavaScript',
        synonyms: ['JS', 'ECMAScript'],
        category: '编程语言',
        jobCount: 10,
        createdAt: '2026-04-01 10:00:00',
        updatedAt: '2026-04-20 15:30:00',
      },
      {
        id: 2,
        name: 'React',
        synonyms: ['React.js'],
        category: '框架',
        jobCount: 8,
        createdAt: '2026-03-15 09:00:00',
        updatedAt: '2026-04-18 11:20:00',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getSkillList).mockResolvedValue(mockSkillList);
    vi.mocked(adminApi.createSkillTag).mockResolvedValue({ id: 3, name: 'Vue', synonyms: [], category: null, jobCount: 0 });
    vi.mocked(adminApi.updateSkillTag).mockResolvedValue({ id: 1, name: 'JavaScript Updated', synonyms: [], category: null, jobCount: 10 });
    vi.mocked(adminApi.deleteSkillTag).mockResolvedValue();
  });

  it('渲染标签管理页面标题和统计卡片', async () => {
    render(<AdminSkillTagsPage />);

    expect(screen.getByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('维护技能、工具等实体图谱节点，确保解析准确率。')).toBeInTheDocument();
  });

  it('展示标签列表数据', async () => {
    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('展示同义词标签', async () => {
    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JS')).toBeInTheDocument();
      expect(screen.getByText('ECMAScript')).toBeInTheDocument();
    });
  });

  it('点击编辑按钮打开编辑弹窗', async () => {
    window.confirm = vi.fn(() => true);

    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: '编辑' })[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('编辑标签')).toBeInTheDocument();
    });
  });

  it('点击删除按钮调用删除接口', async () => {
    window.confirm = vi.fn(() => true);

    render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: '删除' })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });
  });
});