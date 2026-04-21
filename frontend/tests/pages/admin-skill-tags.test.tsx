import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSkillTagsPage from '@/app/admin/skill-tags/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminSkillTagsPage', () => {
  it('渲染技能标签管理页面容器和侧边栏', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('渲染页面标题和描述', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('认知图谱与标签治理')).toBeInTheDocument();
    expect(screen.getByText('管理并优化全站职业与技能本体，提升 AI 匹配精度。')).toBeInTheDocument();
  });

  it('渲染导出图谱数据按钮', () => {
    render(<AdminSkillTagsPage />);
    const buttons = screen.getAllByRole('button');
    const exportButton = buttons.find(btn => btn.textContent?.includes('导出图谱数据'));
    expect(exportButton).toBeInTheDocument();
  });

  it('渲染创建新节点按钮', () => {
    render(<AdminSkillTagsPage />);
    const buttons = screen.getAllByRole('button');
    const createButton = buttons.find(btn => btn.textContent?.includes('创建新节点'));
    expect(createButton).toBeInTheDocument();
  });

  it('渲染搜索输入框', () => {
    render(<AdminSkillTagsPage />);
    const searchInput = screen.getByPlaceholderText('搜索节点名称或同义词...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('渲染分类筛选下拉框', () => {
    render(<AdminSkillTagsPage />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('渲染全部分类选项', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('全部分类')).toBeInTheDocument();
  });

  it('渲染编程语言分类选项', () => {
    render(<AdminSkillTagsPage />);
    const langOptions = screen.getAllByText('编程语言');
    expect(langOptions.length).toBeGreaterThan(0);
  });

  it('渲染表头列标题', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('节点名称')).toBeInTheDocument();
    expect(screen.getByText('图谱分类')).toBeInTheDocument();
    expect(screen.getByText('同义词群')).toBeInTheDocument();
    expect(screen.getByText('引用热度')).toBeInTheDocument();
  });

  it('渲染Java标签节点', () => {
    render(<AdminSkillTagsPage />);
    const javaElements = screen.getAllByText('Java');
    expect(javaElements.length).toBeGreaterThan(0);
  });

  it('渲染Java标签ID', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText(/N-8842/)).toBeInTheDocument();
  });

  it('渲染Java标签别名数量', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('3 个别名')).toBeInTheDocument();
  });

  it('渲染Java标签引用热度', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('142.5k')).toBeInTheDocument();
  });

  it('渲染活跃状态标签', () => {
    render(<AdminSkillTagsPage />);
    const activeTags = screen.getAllByText('活跃');
    expect(activeTags.length).toBeGreaterThan(0);
  });

  it('渲染React标签节点', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText(/N-9021/)).toBeInTheDocument();
  });

  it('渲染React标签分类', () => {
    render(<AdminSkillTagsPage />);
    const frameworkTags = screen.getAllByText('前端框架');
    expect(frameworkTags.length).toBeGreaterThan(0);
  });

  it('渲染React标签别名数量', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('4 个别名')).toBeInTheDocument();
  });

  it('渲染React标签引用热度', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('98.2k')).toBeInTheDocument();
  });

  it('渲染K8s待确认节点', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('K8s')).toBeInTheDocument();
    expect(screen.getByText('待确认')).toBeInTheDocument();
  });

  it('渲染K8s冲突提示', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('发现潜在冲突')).toBeInTheDocument();
  });

  it('渲染一键合并按钮', () => {
    render(<AdminSkillTagsPage />);
    const buttons = screen.getAllByRole('button');
    const mergeButton = buttons.find(btn => btn.textContent === '一键合并');
    expect(mergeButton).toBeInTheDocument();
  });

  it('渲染加载更多按钮', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('加载更多图谱节点')).toBeInTheDocument();
  });

  it('渲染图谱健康度卡片', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('图谱健康度')).toBeInTheDocument();
    expect(screen.getByText('14,289')).toBeInTheDocument();
  });

  it('渲染认知引擎建议卡片', () => {
    render(<AdminSkillTagsPage />);
    expect(screen.getByText('认知引擎建议')).toBeInTheDocument();
  });

  it('渲染编辑操作按钮', () => {
    render(<AdminSkillTagsPage />);
    const editButtons = screen.getAllByTitle('编辑节点');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('渲染合并同义词操作按钮', () => {
    render(<AdminSkillTagsPage />);
    const mergeButtons = screen.getAllByTitle('合并同义词');
    expect(mergeButtons.length).toBeGreaterThan(0);
  });

  it('渲染停用操作按钮', () => {
    render(<AdminSkillTagsPage />);
    const blockButtons = screen.getAllByTitle('停用');
    expect(blockButtons.length).toBeGreaterThan(0);
  });
});
