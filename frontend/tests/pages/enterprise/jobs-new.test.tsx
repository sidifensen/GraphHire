/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JobNewPage from '@/app/enterprise/jobs/new/page';
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
    createJob: vi.fn(),
    publishJob: vi.fn(),
  },
}));

describe('JobNewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染新增岗位表单', () => {
    render(<JobNewPage />);

    expect(screen.getByText('新增岗位')).toBeInTheDocument();
    expect(screen.getByText('职位名称')).toBeInTheDocument();
    expect(screen.getByText('城市')).toBeInTheDocument();
    expect(screen.getByText('最低薪资')).toBeInTheDocument();
    expect(screen.getByText('最高薪资')).toBeInTheDocument();
    expect(screen.getByText('职位描述')).toBeInTheDocument();
    expect(screen.getByText('创建并发布')).toBeInTheDocument();
  });

  it('可以输入职位名称', () => {
    render(<JobNewPage />);

    const titleInput = screen.getByLabelText('职位名称');
    fireEvent.change(titleInput, { target: { value: '前端工程师' } });

    expect(titleInput).toHaveValue('前端工程师');
  });

  it('可以输入城市', () => {
    render(<JobNewPage />);

    const cityInput = screen.getByLabelText('城市');
    fireEvent.change(cityInput, { target: { value: '北京' } });

    expect(cityInput).toHaveValue('北京');
  });

  it('可以输入薪资', () => {
    render(<JobNewPage />);

    const minInput = screen.getByLabelText('最低薪资');
    const maxInput = screen.getByLabelText('最高薪资');

    fireEvent.change(minInput, { target: { value: '15000' } });
    fireEvent.change(maxInput, { target: { value: '25000' } });

    expect(minInput).toHaveValue('15000');
    expect(maxInput).toHaveValue('25000');
  });

  it('可以输入职位描述', () => {
    render(<JobNewPage />);

    const descInput = screen.getByLabelText('职位描述');
    fireEvent.change(descInput, { target: { value: '负责前端开发工作' } });

    expect(descInput).toHaveValue('负责前端开发工作');
  });

  it('点击返回按钮跳转回职位管理页', () => {
    render(<JobNewPage />);

    const backLink = screen.getByRole('link', { name: '返回职位管理' });
    expect(backLink.getAttribute('href')).toBe('/enterprise/jobs');
  });

  it('提交时验证必填项', async () => {
    render(<JobNewPage />);

    fireEvent.click(screen.getByText('创建并发布'));

    await waitFor(() => {
      expect(screen.getByText('请填写所有必填项')).toBeInTheDocument();
    });
  });

  it('提交时验证薪资为正数', async () => {
    render(<JobNewPage />);

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '前端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '-1000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '职位描述内容' } });

    fireEvent.click(screen.getByText('创建并发布'));

    await waitFor(() => {
      expect(screen.getByText('薪资必须为正数')).toBeInTheDocument();
    });
  });

  it('提交时验证最低薪资不能高于最高薪资', async () => {
    render(<JobNewPage />);

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '前端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '职位描述内容' } });

    fireEvent.click(screen.getByText('创建并发布'));

    await waitFor(() => {
      expect(screen.getByText('最低薪资不能高于最高薪资')).toBeInTheDocument();
    });
  });

  it('创建成功后跳转到职位列表页', async () => {
    vi.mocked(companyApi.createJob).mockResolvedValue(123);
    vi.mocked(companyApi.publishJob).mockResolvedValue();

    render(<JobNewPage />);

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '前端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '负责前端开发工作' } });

    fireEvent.click(screen.getByText('创建并发布'));

    await waitFor(() => {
      expect(companyApi.createJob).toHaveBeenCalledWith({
        title: '前端工程师',
        location: { city: '北京' },
        salaryRange: { min: 15000, max: 25000, unit: 'CNY/MONTH' },
        description: '负责前端开发工作',
      });
      expect(companyApi.publishJob).toHaveBeenCalledWith(123);
      expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs?created=1');
    });
  });

  it('创建失败时展示错误消息', async () => {
    vi.mocked(companyApi.createJob).mockRejectedValue(new Error('创建失败'));

    render(<JobNewPage />);

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '前端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '负责前端开发工作' } });

    fireEvent.click(screen.getByText('创建并发布'));

    await waitFor(() => {
      expect(screen.getByText('创建失败')).toBeInTheDocument();
    });
  });

  it('提交时禁用按钮防止重复提交', async () => {
    vi.mocked(companyApi.createJob).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(123), 1000)),
    );
    vi.mocked(companyApi.publishJob).mockResolvedValue();

    render(<JobNewPage />);

    fireEvent.change(screen.getByLabelText('职位名称'), { target: { value: '前端工程师' } });
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText('最低薪资'), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText('最高薪资'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('职位描述'), { target: { value: '负责前端开发工作' } });

    const submitButton = screen.getByRole('button', { name: '创建并发布' });
    fireEvent.click(submitButton);

    expect(screen.getByText('提交中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});