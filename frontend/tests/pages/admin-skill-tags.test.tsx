import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

  it('加载数据时渲染技能标签页面', async () => {
    const { container } = render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(container.querySelector('[class*="border"]')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('页面包含认知图谱标题', async () => {
    const { getByText } = render(<AdminSkillTagsPage />);

    await waitFor(() => {
      expect(getByText('认知图谱与标签治理')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('使用 AdminHeader 组件标题', async () => {
    const { getByTestId } = render(<AdminSkillTagsPage />);
    await waitFor(() => {
      expect(getByTestId('admin-header').textContent).toContain('认知图谱与标签治理');
    }, { timeout: 3000 });
  });
});
