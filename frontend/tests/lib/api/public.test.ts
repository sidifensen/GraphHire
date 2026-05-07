import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  default: {
    get: hoisted.getMock,
  },
}));

describe('publicApi in-flight dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dedupes concurrent jobs.search requests with same params', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { publicApi } = await import('@/lib/api/public');

    const params = { page: 1, size: 20, sortBy: 'createTime' as const };
    const p1 = publicApi.jobs.search(params);
    const p2 = publicApi.jobs.search(params);

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({
      data: {
        records: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      },
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('dedupes concurrent taxonomy tree requests', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { publicApi } = await import('@/lib/api/public');

    const p1 = publicApi.jobs.getPositionTypeTree();
    const p2 = publicApi.jobs.getPositionTypeTree();

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({
      data: [],
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('dedupes concurrent company detail requests for same id', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { publicApi } = await import('@/lib/api/public');

    const p1 = publicApi.companies.getById(9);
    const p2 = publicApi.companies.getById(9);

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({
      data: { id: 9, name: '图谱科技' },
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('dedupes concurrent province-cities requests', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    hoisted.getMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const { publicApi } = await import('@/lib/api/public');

    const p1 = publicApi.jobs.getProvinceCities();
    const p2 = publicApi.jobs.getProvinceCities();

    expect(hoisted.getMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({
      data: [{ province: '北京市', cities: ['北京市'] }],
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(r2);
  });

  it('passes company filter params to public companies search', async () => {
    hoisted.getMock.mockResolvedValueOnce({
      data: {
        records: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      },
    });

    const { publicApi } = await import('@/lib/api/public');

    await publicApi.companies.search({
      keyword: 'AI',
      industryLeafIds: [101, 102],
      companyScaleCode: '5',
      cityList: ['杭州', '深圳'],
      page: 2,
      size: 20,
    });

    expect(hoisted.getMock).toHaveBeenCalledWith(
      '/public/companies',
      expect.objectContaining({
        params: expect.objectContaining({
          keyword: 'AI',
          industryLeafIds: [101, 102],
          companyScaleCode: '5',
          cityList: ['杭州', '深圳'],
          page: 2,
          size: 20,
        }),
      }),
    );
  });
});
