import { render, screen } from '@testing-library/react';
import EnterpriseDashboardPage from '@/app/enterprise/dashboard/page';

describe('EnterpriseDashboardPage 企业仪表盘测试', () => {
  describe('欢迎信息测试', () => {
    test('渲染欢迎标题', () => {
      render(<EnterpriseDashboardPage />);
      const title = screen.getByRole('heading', { name: /欢迎回来，GraphHire 企业管理中心/i });
      expect(title).toBeInTheDocument();
    });

    test('渲染欢迎描述信息', () => {
      render(<EnterpriseDashboardPage />);
      const description = screen.getByText(/您的AI智能招聘助手已就绪/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('统计数据卡片测试', () => {
    test('渲染待处理投递数量', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('待处理投递')).toBeInTheDocument();
    });

    test('渲染新匹配候选人数量', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('156')).toBeInTheDocument();
      expect(screen.getByText('新匹配候选人')).toBeInTheDocument();
    });

    test('渲染在招职位数量', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('在招职位')).toBeInTheDocument();
    });

    test('渲染今日新增标识', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('+3 今日')).toBeInTheDocument();
    });
  });

  describe('趋势图表测试', () => {
    test('渲染职位浏览与转化趋势标题', () => {
      render(<EnterpriseDashboardPage />);
      const chartTitle = screen.getByText('职位浏览与转化趋势');
      expect(chartTitle).toBeInTheDocument();
    });

    test('渲染时间范围标签', () => {
      render(<EnterpriseDashboardPage />);
      const timeRange = screen.getByText('近 7 天');
      expect(timeRange).toBeInTheDocument();
    });

    test('渲染峰值标识', () => {
      render(<EnterpriseDashboardPage />);
      const peak = screen.getByText('峰值');
      expect(peak).toBeInTheDocument();
    });
  });

  describe('快捷操作测试', () => {
    test('渲染启动新招聘区域', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('启动新招聘')).toBeInTheDocument();
    });

    test('渲染快捷操作标题', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('快捷操作')).toBeInTheDocument();
    });

    test('渲染查看智能推荐按钮', () => {
      render(<EnterpriseDashboardPage />);
      const smartRecommend = screen.getByText('查看智能推荐');
      expect(smartRecommend).toBeInTheDocument();
    });

    test('渲染邀请面试按钮', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('邀请面试')).toBeInTheDocument();
    });

    test('渲染发布新职位按钮', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('发布新职位')).toBeInTheDocument();
    });
  });

  describe('近期职位列表测试', () => {
    test('渲染近期发布职位标题', () => {
      render(<EnterpriseDashboardPage />);
      const title = screen.getByText('近期发布职位');
      expect(title).toBeInTheDocument();
    });

    test('渲染职位名称', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('高级前端工程师 (React)')).toBeInTheDocument();
      expect(screen.getByText('数据分析专家')).toBeInTheDocument();
      expect(screen.getByText('产品运营经理')).toBeInTheDocument();
    });

    test('渲染投递数', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('128')).toBeInTheDocument();
      expect(screen.getByText('210')).toBeInTheDocument();
    });

    test('渲染 AI 匹配标签', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('12 人极度匹配')).toBeInTheDocument();
      expect(screen.getByText('34 人匹配')).toBeInTheDocument();
    });

    test('渲染查看全部按钮', () => {
      render(<EnterpriseDashboardPage />);
      const viewAll = screen.getByText('查看全部');
      expect(viewAll).toBeInTheDocument();
    });
  });

  describe('状态显示测试', () => {
    test('渲染招聘中状态', () => {
      render(<EnterpriseDashboardPage />);
      const statuses = screen.getAllByText('招聘中');
      expect(statuses.length).toBeGreaterThan(0);
    });

    test('渲染已结束状态', () => {
      render(<EnterpriseDashboardPage />);
      expect(screen.getByText('已结束')).toBeInTheDocument();
    });
  });
});
