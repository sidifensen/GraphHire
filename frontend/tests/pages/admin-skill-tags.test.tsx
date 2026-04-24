import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSkillTagsPage from '@/app/admin/skill-tags/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: ({ title }: { title?: string }) => <div data-testid="admin-header">{title ?? 'header'}</div>,
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    getSkillList: vi.fn(),
  },
}));

const mockedAdminApi = vi.mocked(adminApi);

describe('AdminSkillTagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it('展示重构后的标签管理页文案和列表', async () => {
    render(<AdminSkillTagsPage />);

    expect(await screen.findByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('维护技能、工具等实体图谱节点，确保解析准确率。')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(adminApi.getSkillList).toHaveBeenCalledTimes(1);
  });
});
