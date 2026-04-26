/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JobsPage from '@/app/enterprise/jobs/page';
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
    getJobList: vi.fn(),
    publishJob: vi.fn(),
    closeJob: vi.fn(),
  },
}));

describe('JobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('展示加载状态', () => {
    vi.mocked(companyApi.getJobList).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<JobsPage />);

    expect(screen.getByText('职位列表加载中...')).toBeInTheDocument();
  });

  it('展示职位列表数据', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
      {
        id: 2,
        title: '后端工程师',
        department: '技术部',
        city: '上海',
        salaryRange: { min: 20000, max: 30000, unit: 'CNY/MONTH' },
        status: 'DRAFT',
        viewCount: 50,
        applyCount: 2,
        matchCount: 1,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    expect(screen.getByText('后端工程师')).toBeInTheDocument();
    expect(screen.getAllByText('已发布').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('草稿').length).toBeGreaterThanOrEqual(1);
  });

  it('展示暂无数据状态', async () => {
    vi.mocked(companyApi.getJobList).mockResolvedValue([]);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无职位数据')).toBeInTheDocument();
    });
  });

  it('展示错误状态和重试按钮', async () => {
    vi.mocked(companyApi.getJobList).mockRejectedValue(new Error('加载失败'));

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('点击职位项跳转到详情页', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('前端工程师'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs/1');
    });
  });

  it('展示状态筛选按钮', () => {
    vi.mocked(companyApi.getJobList).mockResolvedValue([]);

    render(<JobsPage />);

    expect(screen.getByText('全部状态')).toBeInTheDocument();
    expect(screen.getByText('已发布')).toBeInTheDocument();
    expect(screen.getByText('草稿')).toBeInTheDocument();
    expect(screen.getByText('已关闭')).toBeInTheDocument();
  });

  it('点击状态筛选重新加载列表', async () => {
    vi.mocked(companyApi.getJobList).mockResolvedValue([]);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('全部状态')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('已发布'));

    await waitFor(() => {
      expect(companyApi.getJobList).toHaveBeenCalledWith({ status: 'PUBLISHED', keyword: undefined });
    });
  });

  it('展示搜索框和搜索按钮', () => {
    vi.mocked(companyApi.getJobList).mockResolvedValue([]);

    render(<JobsPage />);

    expect(screen.getByPlaceholderText('搜索职位名称...')).toBeInTheDocument();
    expect(screen.getByText('搜索')).toBeInTheDocument();
  });

  it('点击发布新职位按钮', () => {
    vi.mocked(companyApi.getJobList).mockResolvedValue([]);

    render(<JobsPage />);

    const button = screen.getByRole('link', { name: '发布新职位' });
    expect(button.getAttribute('href')).toBe('/enterprise/jobs/new');
  });

  it('点击详情按钮跳转到详情页', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    const detailLink = screen.getByRole('link', { name: '详情' });
    expect(detailLink.getAttribute('href')).toBe('/enterprise/jobs/1');
  });

  it('点击匹配候选人按钮', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    const matchLink = screen.getByRole('link', { name: '匹配候选人' });
    expect(matchLink.getAttribute('href')).toBe('/enterprise/recommendations?jobId=1');
  });

  it('点击发布按钮发布职位', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'DRAFT',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);
    vi.mocked(companyApi.publishJob).mockResolvedValue();

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    const publishButton = screen.getByTitle('发布');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(companyApi.publishJob).toHaveBeenCalledWith(1);
    });
  });

  it('点击暂停按钮关闭职位', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);
    vi.mocked(companyApi.closeJob).mockResolvedValue();

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    const closeButton = screen.getByTitle('暂停');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(companyApi.closeJob).toHaveBeenCalledWith(1);
    });
  });

  it('展示操作成功消息', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        status: 'DRAFT',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);
    vi.mocked(companyApi.publishJob).mockResolvedValue();

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    const publishButton = screen.getByTitle('发布');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('职位状态已更新')).toBeInTheDocument();
    });
  });

  it('展示薪资信息', async () => {
    const mockJobs = [
      {
        id: 1,
        title: '前端工程师',
        department: '技术部',
        city: '北京',
        salaryMin: 15000,
        salaryMax: 25000,
        status: 'PUBLISHED',
        viewCount: 100,
        applyCount: 5,
        matchCount: 3,
      },
    ];

    vi.mocked(companyApi.getJobList).mockResolvedValue(mockJobs as any);

    render(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('15k-25k')).toBeInTheDocument();
    });
  });
});