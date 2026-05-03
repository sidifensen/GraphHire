import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  default: {
    get: hoisted.getMock,
  },
}));

describe('adminApi in-flight dedupe for tree queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dedupes concurrent getPositionTypeTree requests with same params', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { adminApi } = await import('@/lib/api/admin');

    const params = { keyword: 'Java', status: 1, level: 3 };
    const p1 = adminApi.getPositionTypeTree(params);
    const p2 = adminApi.getPositionTypeTree(params);

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({ data: [] });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('dedupes concurrent getIndustryTree requests with same params', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { adminApi } = await import('@/lib/api/admin');

    const params = { keyword: '互联网', enabled: 1, level: 2 };
    const p1 = adminApi.getIndustryTree(params);
    const p2 = adminApi.getIndustryTree(params);

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({ data: [] });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });
});
