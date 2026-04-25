import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobEditPage from '@/app/enterprise/jobs/[id]/edit/page';

const useParamsMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: backMock,
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => useParamsMock(),
}));

describe('Enterprise Job Edit Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    backMock.mockReset();
    useParamsMock.mockReturnValue({ id: '1' });
  });

  test('左上返回按钮可回到上一页', async () => {
    const user = userEvent.setup();
    render(<JobEditPage />);

    await user.click(screen.getByRole('button', { name: '返回' }));
    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
