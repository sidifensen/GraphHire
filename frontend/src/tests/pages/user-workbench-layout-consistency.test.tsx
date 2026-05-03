import { render, screen, waitFor } from '@testing-library/react';
import ResumeManagePage from '@/app/(user)/resume/manage/page';
import ApplicationsPage from '@/app/(user)/applications/page';
import SkillGraphPage from '@/app/(user)/skill-graph/page';
import PersonalInfoPage from '@/app/(user)/personal-info/page';
import { vi } from 'vitest';

const {
  getMyResumesMock,
  getApplicationsMock,
  getProfileMock,
} = vi.hoisted(() => ({
  getMyResumesMock: vi.fn(),
  getApplicationsMock: vi.fn(),
  getProfileMock: vi.fn(),
}));

vi.mock('@/lib/api/resume', () => ({
  resumeApi: {
    getMyResumes: getMyResumesMock,
    setDefault: vi.fn(),
    parse: vi.fn(),
    uploadWithProgress: vi.fn(),
    delete: vi.fn(),
    preview: vi.fn(),
  },
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getApplications: getApplicationsMock,
    withdrawApplication: vi.fn(),
    getProfile: getProfileMock,
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

function expectMaxWidthContainerWithoutHorizontalPadding(layoutMenu: HTMLElement) {
  const maxWidthContainer = layoutMenu.closest('.max-w-7xl') as HTMLElement | null;
  expect(maxWidthContainer).not.toBeNull();
  expect(maxWidthContainer).not.toHaveClass('p-5');
  expect(maxWidthContainer).not.toHaveClass('px-5');
  expect(maxWidthContainer).not.toHaveClass('md:px-8');
}

describe('User workbench desktop layout consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyResumesMock.mockResolvedValue([]);
    getApplicationsMock.mockResolvedValue([]);
    getProfileMock.mockResolvedValue(null);
  });

  it('keeps resume manage page desktop wrapper consistent with personal info page', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    getMyResumesMock.mockClear();
    render(<ResumeManagePage />);
    await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
  });

  it('keeps applications page desktop wrapper consistent with personal info page', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    getApplicationsMock.mockClear();
    render(<ApplicationsPage />);
    await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
  });

  it('keeps skill graph page desktop wrapper consistent with personal info page', async () => {
    const personalInfoRender = render(<PersonalInfoPage />);
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
    personalInfoRender.unmount();

    render(<SkillGraphPage />);
    expectMaxWidthContainerWithoutHorizontalPadding(
      screen.getByRole('navigation', { name: '我的页面菜单' }),
    );
  });
});
