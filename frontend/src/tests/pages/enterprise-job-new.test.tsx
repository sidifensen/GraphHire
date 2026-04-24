import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobNewPage from '@/app/enterprise/jobs/new/page';
import { companyApi } from '@/lib/api/company';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: {
    createJob: vi.fn(),
    publishJob: vi.fn(),
  },
}));

describe('Enterprise Job New Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(companyApi.createJob).mockResolvedValue(101);
    vi.mocked(companyApi.publishJob).mockResolvedValue();
  });

  test('校验必填项与薪资区间', async () => {
    const user = userEvent.setup();
    render(<JobNewPage />);

    await user.click(screen.getByRole('button', { name: '创建并发布' }));
    expect(await screen.findByText('请填写所有必填项')).toBeInTheDocument();

    await user.type(screen.getByLabelText('职位名称'), '高级前端工程师');
    await user.type(screen.getByLabelText('职位描述'), '负责核心业务开发');
    await user.type(screen.getByLabelText('城市'), '上海');
    await user.type(screen.getByLabelText('最低薪资'), '60000');
    await user.type(screen.getByLabelText('最高薪资'), '30000');
    await user.click(screen.getByRole('button', { name: '创建并发布' }));
    expect(await screen.findByText('最低薪资不能高于最高薪资')).toBeInTheDocument();
    expect(companyApi.createJob).not.toHaveBeenCalled();
  });

  test('成功时依次创建并发布后跳转', async () => {
    const user = userEvent.setup();
    render(<JobNewPage />);

    await user.type(screen.getByLabelText('职位名称'), '高级前端工程师');
    await user.type(screen.getByLabelText('职位描述'), '负责核心业务开发');
    await user.type(screen.getByLabelText('城市'), '上海');
    await user.type(screen.getByLabelText('最低薪资'), '30000');
    await user.type(screen.getByLabelText('最高薪资'), '60000');
    await user.click(screen.getByRole('button', { name: '创建并发布' }));

    await waitFor(() => {
      expect(companyApi.createJob).toHaveBeenCalledTimes(1);
      expect(companyApi.publishJob).toHaveBeenCalledWith(101);
      expect(pushMock).toHaveBeenCalledWith('/enterprise/jobs?created=1');
    });
  });

  test('创建失败时不调用发布并提示错误', async () => {
    vi.mocked(companyApi.createJob).mockRejectedValueOnce(new Error('create failed'));
    const user = userEvent.setup();
    render(<JobNewPage />);

    await user.type(screen.getByLabelText('职位名称'), '高级前端工程师');
    await user.type(screen.getByLabelText('职位描述'), '负责核心业务开发');
    await user.type(screen.getByLabelText('城市'), '上海');
    await user.type(screen.getByLabelText('最低薪资'), '30000');
    await user.type(screen.getByLabelText('最高薪资'), '60000');
    await user.click(screen.getByRole('button', { name: '创建并发布' }));

    expect(await screen.findByText('create failed')).toBeInTheDocument();
    expect(companyApi.publishJob).not.toHaveBeenCalled();
  });

  test('发布失败时提示错误且不跳转', async () => {
    vi.mocked(companyApi.publishJob).mockRejectedValueOnce(new Error('publish failed'));
    const user = userEvent.setup();
    render(<JobNewPage />);

    await user.type(screen.getByLabelText('职位名称'), '高级前端工程师');
    await user.type(screen.getByLabelText('职位描述'), '负责核心业务开发');
    await user.type(screen.getByLabelText('城市'), '上海');
    await user.type(screen.getByLabelText('最低薪资'), '30000');
    await user.type(screen.getByLabelText('最高薪资'), '60000');
    await user.click(screen.getByRole('button', { name: '创建并发布' }));

    expect(await screen.findByText('publish failed')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

