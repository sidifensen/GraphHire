import { render, screen } from '@testing-library/react';
import JobsPage from '@/app/enterprise/jobs/page';

describe('JobsPage 企业职位管理测试', () => {
  describe('页面标题测试', () => {
    test('渲染职位管理标题', () => {
      render(<JobsPage />);
      const title = screen.getByText('职位管理');
      expect(title).toBeInTheDocument();
    });

    test('渲染页面描述', () => {
      render(<JobsPage />);
      const description = screen.getByText(/管理您的招聘需求与 AI 匹配进度/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('筛选条件测试', () => {
    test('渲染状态筛选标签', () => {
      render(<JobsPage />);
      expect(screen.getByText('全部状态')).toBeInTheDocument();
      expect(screen.getByText('草稿')).toBeInTheDocument();
    });

    test('渲染搜索框', () => {
      render(<JobsPage />);
      const searchInput = screen.getByPlaceholderText('搜索职位名称...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('职位列表测试', () => {
    test('渲染职位名称', () => {
      render(<JobsPage />);
      expect(screen.getByText('高级算法工程师')).toBeInTheDocument();
      expect(screen.getByText('资深产品经理')).toBeInTheDocument();
    });

    test('渲染职位状态标签', () => {
      render(<JobsPage />);
      const publishedTags = screen.getAllByText('已发布');
      expect(publishedTags.length).toBeGreaterThan(0);
      expect(screen.getAllByText('审核中').length).toBeGreaterThan(0);
    });

    test('渲染部门信息', () => {
      render(<JobsPage />);
      expect(screen.getByText('AI 研发中心')).toBeInTheDocument();
      expect(screen.getByText('商业化团队')).toBeInTheDocument();
    });

    test('渲染薪资范围', () => {
      render(<JobsPage />);
      expect(screen.getByText('40k-60k')).toBeInTheDocument();
      expect(screen.getByText('30k-45k')).toBeInTheDocument();
    });

    test('渲染发布时间', () => {
      render(<JobsPage />);
      expect(screen.getByText('发布于 2天前')).toBeInTheDocument();
      expect(screen.getByText('提交于 4小时前')).toBeInTheDocument();
    });
  });

  describe('统计数据测试', () => {
    test('渲染曝光量', () => {
      render(<JobsPage />);
      expect(screen.getByText('1,245')).toBeInTheDocument();
      expect(screen.getAllByText('曝光量').length).toBeGreaterThan(0);
    });

    test('渲染投递数', () => {
      render(<JobsPage />);
      expect(screen.getByText('86')).toBeInTheDocument();
      expect(screen.getAllByText('投递数').length).toBeGreaterThan(0);
    });

    test('渲染 AI 高匹配数', () => {
      render(<JobsPage />);
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('AI 高匹配')).toBeInTheDocument();
    });
  });

  describe('操作按钮测试', () => {
    test('渲染匹配候选人按钮', () => {
      render(<JobsPage />);
      const matchButtons = screen.getAllByText('匹配候选人');
      expect(matchButtons.length).toBeGreaterThan(0);
    });

    test('渲染职位图谱按钮', () => {
      render(<JobsPage />);
      expect(screen.getByText('职位图谱')).toBeInTheDocument();
    });

    test('渲染发布新职位按钮', () => {
      render(<JobsPage />);
      expect(screen.getByText('发布新职位')).toBeInTheDocument();
    });

    test('渲染批量操作按钮', () => {
      render(<JobsPage />);
      expect(screen.getByText('批量下架')).toBeInTheDocument();
      expect(screen.getByText('批量修改')).toBeInTheDocument();
    });
  });

  describe('复选框测试', () => {
    test('渲染职位复选框', () => {
      render(<JobsPage />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
