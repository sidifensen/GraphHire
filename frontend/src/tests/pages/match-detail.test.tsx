import { render, screen } from '@testing-library/react';
import MatchDetailPage from '@/app/(user)/match/[id]/page';

describe('MatchDetailPage 匹配详情页测试', () => {
  describe('匹配概览测试', () => {
    test('渲染职位标题', () => {
      render(<MatchDetailPage />);
      const title = screen.getByRole('heading', { name: '高级认知交互设计师' });
      expect(title).toBeInTheDocument();
    });

    test('渲染公司信息', () => {
      render(<MatchDetailPage />);
      const companyInfo = screen.getByText(/星海人工智能研究院/);
      expect(companyInfo).toBeInTheDocument();
    });

    test('渲染匹配分数', () => {
      render(<MatchDetailPage />);
      // 92% 被分成 "92" 和 "%" 两个元素
      expect(screen.getByText('92')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      const scoreLabel = screen.getByText('总匹配度');
      expect(scoreLabel).toBeInTheDocument();
    });

    test('渲染薪资信息', () => {
      render(<MatchDetailPage />);
      const salary = screen.getByText('15k - 25k');
      expect(salary).toBeInTheDocument();
    });

    test('渲染 AI 推荐标签', () => {
      render(<MatchDetailPage />);
      const recommendedTag = screen.getByText('AI 极力推荐');
      expect(recommendedTag).toBeInTheDocument();
    });
  });

  describe('职位信息测试', () => {
    test('渲染职位详情标签', () => {
      render(<MatchDetailPage />);
      expect(screen.getByText('3-5年')).toBeInTheDocument();
      expect(screen.getByText('本科及以上')).toBeInTheDocument();
    });

    test('渲染地点信息', () => {
      render(<MatchDetailPage />);
      const location = screen.getByText(/杭州/);
      expect(location).toBeInTheDocument();
    });
  });

  describe('AI 分析测试', () => {
    test('渲染 AI 深度认知解析标题', () => {
      render(<MatchDetailPage />);
      const aiTitle = screen.getByText('AI 深度认知解析');
      expect(aiTitle).toBeInTheDocument();
    });

    test('渲染 AI 分析总结', () => {
      render(<MatchDetailPage />);
      const summary = screen.getByText(/基于您的图谱节点数据/);
      expect(summary).toBeInTheDocument();
    });

    test('渲染 AI 洞察卡片', () => {
      render(<MatchDetailPage />);
      expect(screen.getByText('核心技能完美覆盖')).toBeInTheDocument();
      expect(screen.getByText('行业经验高度吻合')).toBeInTheDocument();
    });
  });

  describe('技能对比测试', () => {
    test('渲染技能维度明细对比标题', () => {
      render(<MatchDetailPage />);
      const title = screen.getByText('技能维度明细对比');
      expect(title).toBeInTheDocument();
    });

    test('渲染技能对比列表', () => {
      render(<MatchDetailPage />);
      expect(screen.getByText('系统化设计思维')).toBeInTheDocument();
      expect(screen.getByText('AI 交互模式创新')).toBeInTheDocument();
      expect(screen.getByText('前端代码基础 (React/Vue)')).toBeInTheDocument();
    });

    test('渲染匹配等级标签', () => {
      render(<MatchDetailPage />);
      const highMatch = screen.getAllByText('高匹配');
      expect(highMatch.length).toBeGreaterThan(0);
    });
  });

  describe('五维雷达分析测试', () => {
    test('渲染五维匹配雷达分析标题', () => {
      render(<MatchDetailPage />);
      const title = screen.getByText('五维匹配雷达分析');
      expect(title).toBeInTheDocument();
    });

    test('渲染维度评分条', () => {
      render(<MatchDetailPage />);
      expect(screen.getByText('技能')).toBeInTheDocument();
      expect(screen.getByText('经验')).toBeInTheDocument();
      expect(screen.getByText('学历')).toBeInTheDocument();
      expect(screen.getByText('薪资')).toBeInTheDocument();
      expect(screen.getByText('地点')).toBeInTheDocument();
    });

    test('渲染具体分数', () => {
      render(<MatchDetailPage />);
      expect(screen.getAllByText('95%').length).toBeGreaterThan(0);
      expect(screen.getAllByText('90%').length).toBeGreaterThan(0);
      expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    });
  });

  describe('操作按钮测试', () => {
    test('渲染立即投递按钮', () => {
      render(<MatchDetailPage />);
      const applyButton = screen.getByRole('button', { name: /立即投递/i });
      expect(applyButton).toBeInTheDocument();
    });
  });
});
