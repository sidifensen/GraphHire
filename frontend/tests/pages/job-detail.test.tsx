import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobDetailPage from '@/app/(user)/jobs/[id]/page';

const useParamsMock = vi.fn();
const useRouterMock = vi.fn();
const getByIdMock = vi.fn();
const authStoreMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
  useRouter: () => useRouterMock(),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: (selector: (state: any) => unknown) => authStoreMock(selector),
}));

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    jobs: {
      getById: (...args: unknown[]) => getByIdMock(...args),
    },
  },
}));

describe('JobDetailPage back button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: '1' });
    useRouterMock.mockReturnValue({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
    authStoreMock.mockImplementation((selector) => selector({ user: null }));
    getByIdMock.mockResolvedValue({
      id: 1,
      companyName: '图谱科技',
      title: '前端工程师',
      city: '上海',
      jobType: 1,
      requiredSkills: ['React'],
    });
  });

  it('renders back button and falls back to jobs list when no history', async () => {
    const push = vi.fn();
    useRouterMock.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
    const user = userEvent.setup();

    render(<JobDetailPage />);
    const backButton = await screen.findByRole('button', { name: /返回/i });
    await user.click(backButton);

    expect(push).toHaveBeenCalledWith('/jobs');
  });
});
