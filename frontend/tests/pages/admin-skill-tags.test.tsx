import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSkillTagsPage from '@/app/admin/skill-tags/page';
import { adminApi } from '@/lib/api/admin';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
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

  it('加载成功时展示真实技能标签列表', async () => {
    render(<AdminSkillTagsPage />);

    expect(await screen.findByText('Java')).toBeInTheDocument();
    expect(screen.getByText('技术技能')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('右侧统计无真实来源时显示降级文案', async () => {
    render(<AdminSkillTagsPage />);

    expect(await screen.findByText('暂无数据')).toBeInTheDocument();
    expect(screen.queryByText('14,289')).not.toBeInTheDocument();
  });
});
