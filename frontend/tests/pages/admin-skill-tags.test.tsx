import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminSkillTagsPage from '@/app/admin/skill-tags/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: ({ title }: { title?: string }) => <div data-testid="admin-header">{title ?? 'header'}</div>,
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: unknown }) => <div>{children as any}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getSkillList: vi.fn(),
    createSkillTag: vi.fn(),
    updateSkillTag: vi.fn(),
    addSkillTagSynonym: vi.fn(),
    deleteSkillTag: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminSkillTagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'prompt').mockReturnValue('Go');
    mockedAdminApi.getSkillList.mockResolvedValue({
      list: [{
        id: 1,
        name: 'Java',
        category: '技术技能',
        synonyms: ['JavaSE'],
        jobCount: 12,
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    mockedAdminApi.createSkillTag.mockResolvedValue({ id: 2, name: 'Go', category: null, synonyms: [], jobCount: 0 });
    mockedAdminApi.updateSkillTag.mockResolvedValue({ id: 1, name: 'Java', category: null, synonyms: [], jobCount: 12 });
    mockedAdminApi.addSkillTagSynonym.mockResolvedValue({ id: 1, name: 'Java', category: null, synonyms: ['JavaSE', 'jdk'], jobCount: 12 });
    mockedAdminApi.deleteSkillTag.mockResolvedValue();
  });

  it('展示重构后的标签管理页文案和列表', async () => {
    render(<AdminSkillTagsPage />);

    expect(await screen.findByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('维护技能、工具等实体图谱节点，确保解析准确率。')).toBeInTheDocument();
    await waitFor(() => {
      expect(adminApi.getSkillList).toHaveBeenCalledTimes(1);
    });
  });

  it('点击新建标签会调用管理端创建接口', async () => {
    render(<AdminSkillTagsPage />);

    fireEvent.click(await screen.findByRole('button', { name: /新建标签/ }));

    await waitFor(() => {
      expect(adminApi.createSkillTag).toHaveBeenCalledTimes(1);
    });
  });
});
