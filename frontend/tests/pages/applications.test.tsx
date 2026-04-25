import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ApplicationsPage from '@/app/(user)/applications/page';

const getApplications = vi.fn();
const authStoreMock = vi.fn();

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getApplications: (...args: unknown[]) => getApplications(...args),
  },
}));

function buildItems(count: number) {
  return Array.from({ length: count }).map((_, idx) => ({
    id: idx + 1,
    jobId: 100 + idx,
    jobTitle: `职位-${idx + 1}`,
    companyName: `公司-${idx + 1}`,
    status: idx % 2 === 0 ? 'PENDING' : 'REJECTED',
    matchScore: idx % 3 === 0 ? undefined : 80 + (idx % 20),
    appliedAt: '2026-04-25T10:00:00',
  }));
}

describe('ApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStoreMock.mockImplementation((selector) => selector({ user: { id: 1, username: 'u', type: 'PERSON' } }));
    getApplications.mockResolvedValue(buildItems(12));
  });

  it('renders application list data', async () => {
    render(<ApplicationsPage />);
    await screen.findByText('职位-1');
    expect(screen.getByText('投递记录')).toBeDefined();
    expect(screen.getByText('公司-1')).toBeDefined();
  });

  it('shows match percentage with 匹配度 label', async () => {
    render(<ApplicationsPage />);
    await screen.findByText('职位-2');
    expect(screen.getByText('匹配度：81%')).toBeDefined();
  });

  it('filters by status', async () => {
    render(<ApplicationsPage />);
    await screen.findByText('职位-1');
    fireEvent.click(screen.getByRole('button', { name: '已拒绝' }));
    await waitFor(() => {
      expect(screen.queryByText('职位-1')).toBeNull();
      expect(screen.getByText('职位-2')).toBeDefined();
    });
  });

  it('supports pagination', async () => {
    render(<ApplicationsPage />);
    await screen.findByText('职位-1');
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => {
      expect(screen.getByText('职位-11')).toBeDefined();
      expect(screen.queryByText('职位-1')).toBeNull();
    });
  });

  it('shows login hint when user missing', async () => {
    authStoreMock.mockImplementation((selector) => selector({ user: null }));
    render(<ApplicationsPage />);
    await screen.findByText('请先登录后查看投递记录。');
  });

  it('shows error state and retries', async () => {
    getApplications
      .mockRejectedValueOnce(new Error('加载失败'))
      .mockResolvedValueOnce(buildItems(3));

    render(<ApplicationsPage />);
    await screen.findByText('加载失败');

    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    await screen.findByText('职位-1');
    expect(getApplications).toHaveBeenCalledTimes(2);
  });
});
