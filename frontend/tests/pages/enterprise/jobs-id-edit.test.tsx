/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JobEditPage from '@/app/enterprise/jobs/[id]/edit/page';
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
    updateJob: vi.fn(),
  },
}));

describe('JobEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('展示加载状态', () => {
    vi.mocked(companyApi.getJobDetail).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<JobEditPage />);

    expect(screen.getByText('职位详情加载中...')).toBeInTheDocument();
  });

  it('加载职位详情填充表单', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    expect(screen.getByLabelText('城市')).toHaveValue('北京');
    expect(screen.getByLabelText('最低薪资')).toHaveValue('15000');
    expect(screen.getByLabelText('最高薪资')).toHaveValue('25000');
    expect(screen.getByLabelText('职位描述')).toHaveValue('负责前端开发工作');
  });

  it('展示错误状态', async () => {
    vi.mocked(companyApi.getJobDetail).mockRejectedValue(new Error('加载失败'));

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('无效职位参数时展示错误', async () => {
    vi.mocked(companyApi.getJobDetail).mockRejectedValue(new Error('无效的职位参数'));

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByText('无效的职位参数')).toBeInTheDocument();
    });
  });

  it('可以修改表单内容', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '后端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '上海' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '20000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '负责后端开发工作' } });

    expect(screen.getByLabelText('职位名称')).toHaveValue('后端工程师');
    expect(screen.getByLabelText('城市')).toHaveValue('上海');
    expect(screen.getByLabelText('最低薪资')).toHaveValue('20000');
    expect(screen.getByLabelText('最高薪资')).toHaveValue('30000');
    expect(screen.getByLabelText('职位描述')).toHaveValue('负责后端开发工作');
  });

  it('点击返回按钮返回上一页', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.click(screen.getByText('返回'));

    await waitFor(() => {
      expect(backMock).toHaveBeenCalled();
    });
  });

  it('提交时验证必填项', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '' } });

    fireEvent.click(screen.getByText('保存修改'));

    await waitFor(() => {
      expect(screen.getByText('请填写所有必填项')).toBeInTheDocument();
    });
  });

  it('提交时验证薪资为正数', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '-1000' } });

    fireEvent.click(screen.getByText('保存修改'));

    await waitFor(() => {
      expect(screen.getByText('薪资必须为正数')).toBeInTheDocument();
    });
  });

  it('提交时验证最低薪资不能高于最高薪资', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });

    fireEvent.click(screen.getByText('保存修改'));

    await waitFor(() => {
      expect(screen.getByText('最低薪资不能高于最高薪资')).toBeInTheDocument();
    });
  });

  it('保存成功后跳转到职位详情页', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.updateJob).mockResolvedValue();

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '高级前端工程师' } });

    fireEvent.click(screen.getByText('保存修改'));

    await waitFor(() => {
      expect(companyApi.updateJob).toHaveBeenCalledWith(1, {
        title: '高级前端工程师',
        description: '负责前端开发工作',
        location: { city: '北京' },
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
      });
      expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs/1');
    });
  });

  it('保存失败时展示错误消息', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.updateJob).mockRejectedValue(new Error('保存失败'));

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    fireEvent.click(screen.getByText('保存修改'));

    await waitFor(() => {
      expect(screen.getByText('保存失败')).toBeInTheDocument();
    });
  });

  it('提交时禁用按钮防止重复提交', async () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);
    vi.mocked(companyApi.updateJob).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(), 1000)),
    );

    render(<JobEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('职位名称')).toHaveValue('前端工程师');
    });

    const submitButton = screen.getByRole('button', { name: '保存修改' });
    fireEvent.click(submitButton);

    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('展示页面标题和描述', () => {
    const mockJob = {
      id: 1,
      title: '前端工程师',
      location: { city: '北京' },
      salaryRange: { min: 15000, max: 25000 },
      description: '负责前端开发工作',
    };

    vi.mocked(companyApi.getJobDetail).mockResolvedValue(mockJob as any);

    render(<JobEditPage />);

    expect(screen.getByText('修改职位')).toBeInTheDocument();
    expect(screen.getByText('更新职位信息并保存')).toBeInTheDocument();
  });
});