import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnterpriseCompanyProfilePage from '@/app/enterprise/company/profile/page';

const hoisted = vi.hoisted(() => ({
  companyApiMock: {
    getInfo: vi.fn(),
    listIndustryOptions: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

vi.mock('@/lib/api/company', () => ({
  companyApi: hoisted.companyApiMock,
}));

describe('EnterpriseCompanyProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.companyApiMock.getInfo.mockResolvedValue({
      name: '图智科技',
      industryId: 12,
      authStatus: 'VERIFIED',
    });
    hoisted.companyApiMock.listIndustryOptions.mockResolvedValue([
      {
        id: 1,
        name: '计算机/互联网',
        enabled: 1,
        sort: 1,
        children: [
          { id: 11, name: '企业软件', enabled: 1, sort: 1 },
          { id: 12, name: '电商', enabled: 1, sort: 2 },
        ],
      },
      {
        id: 2,
        name: '制造业',
        enabled: 1,
        sort: 2,
        children: [
          { id: 21, name: '机械', enabled: 1, sort: 1 },
        ],
      },
    ]);
    hoisted.companyApiMock.updateProfile.mockResolvedValue(undefined);
  });

  it('uses shadcn select and keeps parent-child industry linkage', async () => {
    const user = userEvent.setup();
    render(<EnterpriseCompanyProfilePage />);

    await waitFor(() => {
      expect(hoisted.companyApiMock.getInfo).toHaveBeenCalledTimes(1);
      expect(hoisted.companyApiMock.listIndustryOptions).toHaveBeenCalledTimes(1);
    });

    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes[0].tagName).toBe('BUTTON');
    expect(comboboxes[1].tagName).toBe('BUTTON');
    const parentTrigger = comboboxes[0];

    await user.click(parentTrigger);
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: '制造业' }));
    const nextComboboxes = screen.getAllByRole('combobox');
    const childTrigger = nextComboboxes[1];
    await user.click(childTrigger);
    const childListbox = screen.getByRole('listbox');
    expect(within(childListbox).getByRole('option', { name: '机械' })).toBeInTheDocument();
    expect(within(childListbox).queryByRole('option', { name: '电商' })).toBeNull();
    await user.click(within(childListbox).getByRole('option', { name: '机械' }));

    await user.click(screen.getByRole('button', { name: /保存/ }));

    await waitFor(() => {
      expect(hoisted.companyApiMock.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ industryId: 21 }),
      );
    });
  });
});
