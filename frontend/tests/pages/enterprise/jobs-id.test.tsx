/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EnterpriseJobDetailPage from '@/app/enterprise/jobs/[id]/page';
import { companyApi } from '@/lib/api/company';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: backMock,
    forward: vi.fn(),
  }),
  useParams: () => ({ id: '1' }),
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
    getJobDetail: vi.fn(),
    triggerJobMatch: vi.fn(),
  },
}));

describe('EnterpriseJobDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('展示加载状态', () => {
    vi.mocked(companyApi.getJobDetail).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<EnterpriseJobDetailPage />);

    expect(screen.getByText('职位详情加载中...')).toBeInTheDocument();
  });

  it('展示职位详情数据', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      department: '技术部',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      status: 'PUBLISHED',
      description: '负责前端开发工作',
      skills: ['React', 'TypeScript'],
      publishedAt: '2024-01-01',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    expect(screen.getByText('已发布')).toBeInTheDocument();
    expect(screen.getByText('北京')).toBeInTheDocument();
    expect(screen.getByText('15k-25k')).toBeInTheDocument();
    expect(screen.getByText('负责前端开发工作')).toBeInTheDocument();
  });

  it('展示技能要求', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      skills: ['React', 'TypeScript', 'Node.js'],
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('展示暂无技能要求', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      skills: [],
      requiredSkills: [],
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无技能要求')).toBeInTheDocument();
    });
  });

  it('展示错误状态和重试按钮', async () => {
    vi.mocked(companyApi.getJobDetail).mockRejectedValue(new Error('加载失败'));

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('无效职位参数时展示错误', async () => {
    vi.mocked(companyApi.getJobDetail).mockRejectedValue(new Error('无效的职位参数'));

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('无效的职位参数')).toBeInTheDocument();
    });

    expect(screen.queryByText('重试')).toBeNull();
  });

  it('点击返回按钮返回上一页', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('返回'));

    await waitFor(() => {
      expect(backMock).toHaveBeenCalled();
    });
  });

  it('点击修改职位按钮跳转到编辑页', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('修改职位'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs/1/edit');
    });
  });

  it('点击查看匹配候选人按钮', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    const matchLink = screen.getByRole('link', { name: '查看匹配候选人' });
    expect(matchLink.getAttribute('href')).toBe('/enterprise/recommendations?jobId=1');
  });

  it('点击一键匹配全部候选人按钮', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.triggerJobMatch).mockResolvedValue();

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('一键匹配全部候选人'));

    await waitFor(() => {
      expect(companyApi.triggerJobMatch).toHaveBeenCalledWith(1);
    });
  });

  it('匹配启动中显示禁用状态', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.triggerJobMatch).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('一键匹配全部候选人'));

    await waitFor(() => {
      expect(screen.getByText('匹配启动中...')).toBeInTheDocument();
    });
  });

  it('匹配成功后显示消息', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.triggerJobMatch).mockResolvedValue();

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('一键匹配全部候选人'));

    await waitFor(() => {
      expect(screen.getByText('已开始匹配，正在刷新候选人推荐')).toBeInTheDocument();
    });
  });

  it('匹配失败时显示错误消息', async () => {
    const mockJob = { id: 1, title: '前端工程师' };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.triggerJobMatch).mockRejectedValue(new Error('匹配失败'));

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('前端工程师')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('一键匹配全部候选人'));

    await waitFor(() => {
      expect(screen.getByText(/匹配失败/)).toBeInTheDocument();
    });
  });

  it('未找到职位时展示提示', async () => {
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(null as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('未找到职位详情')).toBeInTheDocument();
    });
  });

  it('展示薪资待定当没有薪资信息', async () => {
    const mockJob = { id: 1, title: '前端工程师', salaryRange: {} };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('薪资待定')).toBeInTheDocument();
    });
  });

  it('展示发布时间', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      publishedAt: '2024-01-15',
    };
    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<EnterpriseJobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    });
  });
});