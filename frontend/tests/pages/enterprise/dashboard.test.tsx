/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EnterpriseDashboardPage from '@/app/enterprise/dashboard/page';
import { companyApi } from '@/lib/api/company';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  enterpriseAuthStore: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      accessToken: 'mock-token',
      user: { id: 1, username: 'test@graphhire.com', type: 'company' },
    })),
  },
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    getDashboard: vi.fn(),
    getInfo: vi.fn(),
  },
}));

describe('EnterpriseDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('展示加载状态', () => {
    vi.mocked(companyApi.getDashboard).mockImplementation(
      () => new Promise(() => {}),
    );
    vi.mocked(companyApi.getInfo).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<EnterpriseDashboardPage />);

    expect(screen.getByText('企业仪表盘加载中...')).toBeInTheDocument();
  });

  it('展示企业名称和仪表盘数据', async () => {
    const mockDashboard = {
      pendingApplicationCount: 5,
      newMatchCandidateCount: 3,
      activeJobCount: 10,
      recentJobs: [
        {
          id: 1,
          title: '前端工程师',
          department: '技术部',
          applyCount: 8,
          matchCount: 2,
          status: 'PUBLISHED',
        },
      ],
    };
    const mockCompanyInfo = { name: 'GraphHire 测试公司' };

    vi.mocked(companyApi.getDashboard).mockResolvedValue(mockDashboard as any);
    vi.mocked(companyApi.getInfo).mockResolvedValue(mockCompanyInfo as any);

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('GraphHire 测试公司')).toBeInTheDocument();
    });

    expect(screen.getByText('待处理投递')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('新匹配候选人')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('在招职位')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('展示错误状态和重试按钮', async () => {
    vi.mocked(companyApi.getDashboard).mockRejectedValue(new Error('加载失败'));
    vi.mocked(companyApi.getInfo).mockRejectedValue(new Error('加载失败'));

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('展示暂无数据状态', async () => {
    vi.mocked(companyApi.getDashboard).mockResolvedValue({
      pendingApplicationCount: 0,
      newMatchCandidateCount: 0,
      activeJobCount: 0,
      recentJobs: [],
    } as any);
    vi.mocked(companyApi.getInfo).mockResolvedValue({ name: null } as any);

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('未获取到企业名称')).toBeInTheDocument();
    });
  });

  it('展示近期职位表格', async () => {
    const mockDashboard = {
      pendingApplicationCount: 0,
      newMatchCandidateCount: 0,
      activeJobCount: 0,
      recentJobs: [
        {
          id: 1,
          title: '前端工程师',
          department: '技术部',
          applyCount: 8,
          matchCount: 2,
          status: 'PUBLISHED',
        },
        {
          id: 2,
          title: '后端工程师',
          department: '技术部',
          applyCount: 5,
          matchCount: 1,
          status: 'DRAFT',
        },
      ],
    };

    vi.mocked(companyApi.getDashboard).mockResolvedValue(mockDashboard as any);
    vi.mocked(companyApi.getInfo).mockResolvedValue({ name: '测试公司' } as any);

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    expect(screen.getByText('后端工程师')).toBeInTheDocument();
    expect(screen.getByText('近期发布职位')).toBeInTheDocument();
  });

  it('展示启动新招聘卡片', async () => {
    vi.mocked(companyApi.getDashboard).mockResolvedValue({
      pendingApplicationCount: 0,
      newMatchCandidateCount: 0,
      activeJobCount: 0,
      recentJobs: [],
    } as any);
    vi.mocked(companyApi.getInfo).mockResolvedValue({ name: '测试公司' } as any);

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('启动新招聘')).toBeInTheDocument();
    });
    expect(screen.getByText('发布新职位')).toBeInTheDocument();
  });

  it('展示快捷操作链接', async () => {
    vi.mocked(companyApi.getDashboard).mockResolvedValue({
      pendingApplicationCount: 0,
      newMatchCandidateCount: 0,
      activeJobCount: 0,
      recentJobs: [],
    } as any);
    vi.mocked(companyApi.getInfo).mockResolvedValue({ name: '测试公司' } as any);

    render(<EnterpriseDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('查看智能推荐')).toBeInTheDocument();
    });
    expect(screen.getByText('员工管理')).toBeInTheDocument();
  });
});