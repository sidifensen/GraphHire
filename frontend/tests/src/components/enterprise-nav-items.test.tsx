import { NAV_ITEMS } from '@/app/enterprise/_mock/constants';

describe('Enterprise nav items', () => {
  it('does not expose company profile in top/bottom main navigation', () => {
    expect(NAV_ITEMS.some((item) => item.path === '/company/profile')).toBe(false);
  });
});
