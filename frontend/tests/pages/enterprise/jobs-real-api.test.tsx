import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobsPage from '@/app/enterprise/jobs/page';
import JobDetailPage from '@/app/enterprise/jobs/[id]/page';
import JobCreatePage from '@/app/enterprise/jobs/new/page';
import JobEditPage from '@/app/enterprise/jobs/[id]/edit/page';

const hoisted = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockBack: vi.fn(),
  mockParams: {} as Record<string, string>,
  companyApiMock: {
    getJobList: vi.fn(),
    getJobDetail: vi.fn(),
    createJob: vi.fn(),
    publishJob: vi.fn(),
    updateJob: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/enterprise/jobs',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: hoisted.mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: hoisted.mockBack,
    forward: vi.fn(),
  }),
  useParams: () => hoisted.mockParams,
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: hoisted.companyApiMock,
}));

describe('enterprise jobs real api integration pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.mockParams = {};
  });

  it('loads list page from companyApi.getJobList', async () => {
    hoisted.companyApiMock.getJobList.mockResolvedValue([
      {
        id: 101,
        title: '后端开发工程师',
        department: '技术部',
        city: '北京',
        salaryMin: 20,
        salaryMax: 35,
        salaryUnit: 'k/月',
        status: 'PUBLISHED',
        viewCount: 1280,
        applyCount: 12,
        matchCount: 5,
      },
    ]);

    render(<JobsPage />);

    await waitFor(() => {
      expect(hoisted.companyApiMock.getJobList).toHaveBeenCalledWith();
    });
    expect(await screen.findByText('后端开发工程师')).toBeInTheDocument();
  });

  it('loads detail page from companyApi.getJobDetail', async () => {
    hoisted.mockParams = { id: '7' };
    hoisted.companyApiMock.getJobDetail.mockResolvedValue({
      id: 7,
      title: '算法工程师',
      department: 'AI',
      location: { city: '上海' },
      salaryRange: { min: 35, max: 55, unit: 'k/月' },
      skills: ['Python', 'LLM'],
      status: 'PUBLISHED',
      description: '负责推荐算法研发',
      requiredSkills: ['机器学习', '分布式'],
      experience: '3-5年',
      education: '本科',
      viewCount: 66,
      applyCount: 9,
      matchCount: 4,
    });

    render(<JobDetailPage />);

    await waitFor(() => {
      expect(hoisted.companyApiMock.getJobDetail).toHaveBeenCalledWith(7);
    });
    expect(await screen.findByText('算法工程师')).toBeInTheDocument();
  });

  it('creates then publishes job on create page submit', async () => {
    hoisted.companyApiMock.createJob.mockResolvedValue(88);
    hoisted.companyApiMock.publishJob.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<JobCreatePage />);

    await user.type(screen.getByPlaceholderText('例如：高级前端工程师'), '测试职位');
    await user.type(screen.getByPlaceholderText('选择或输入城市'), '杭州');
    await user.type(screen.getAllByPlaceholderText('0')[0], '20');
    await user.type(screen.getAllByPlaceholderText('0')[1], '30');
    await user.type(screen.getByPlaceholderText('详细描述岗位职责、任职要求及加分项...'), '岗位说明');
    await user.click(screen.getByRole('button', { name: '创建并发布' }));

    await waitFor(() => {
      expect(hoisted.companyApiMock.createJob).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.companyApiMock.publishJob).toHaveBeenCalledWith(88);
    expect(hoisted.mockPush).toHaveBeenCalledWith('/enterprise/jobs');
  });

  it('loads and updates job on edit page save', async () => {
    hoisted.mockParams = { id: '9' };
    hoisted.companyApiMock.getJobDetail.mockResolvedValue({
      id: 9,
      title: '前端工程师',
      department: '产品技术',
      location: { city: '深圳' },
      salaryRange: { min: 18, max: 30, unit: 'k/月' },
      status: 'DRAFT',
      description: '原描述',
      skills: ['React'],
      experience: '1-3年',
      education: '本科',
    });
    hoisted.companyApiMock.updateJob.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<JobEditPage />);

    expect(await screen.findByDisplayValue('前端工程师')).toBeInTheDocument();
    await user.clear(screen.getByDisplayValue('前端工程师'));
    await user.type(screen.getByPlaceholderText('输入职位名称'), '前端工程师（已更新）');
    await user.click(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => {
      expect(hoisted.companyApiMock.updateJob).toHaveBeenCalledWith(
        9,
        expect.objectContaining({ title: '前端工程师（已更新）' }),
      );
    });
    expect(hoisted.mockBack).toHaveBeenCalled();
  });
});
