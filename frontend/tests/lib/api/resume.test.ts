/// <reference types="vitest/globals" />
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGet = vi.fn();

vi.mock('@/lib/api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { resumeApi } from '@/lib/api/resume';

describe('resumeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps backend createTime and SUCCESS status to frontend fields', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 1,
          fileName: 'a.pdf',
          filePath: 's3://resumes/a.pdf',
          status: 'SUCCESS',
          isDefault: true,
          createTime: '2026-04-22T10:00:00',
          updateTime: '2026-04-22T10:30:00',
        },
      ],
    });

    const list = await resumeApi.getMyResumes();

    expect(list[0].createdAt).toBe('2026-04-22T10:00:00');
    expect(list[0].updatedAt).toBe('2026-04-22T10:30:00');
    expect(list[0].status).toBe('COMPLETED');
  });

  it('maps numeric parseStatus to frontend status', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 2,
          fileName: 'b.pdf',
          parseStatus: 1,
          createTime: '2026-04-22T11:00:00',
        },
      ],
    });

    const list = await resumeApi.getMyResumes();

    expect(list[0].status).toBe('PROCESSING');
    expect(list[0].createdAt).toBe('2026-04-22T11:00:00');
  });

  it('falls back to timestamp in filePath when time fields are missing', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 3,
          fileName: 'c.pdf',
          status: 'SUCCESS',
          filePath: 's3://resumes/1776837199655_简历.pdf',
        },
      ],
    });

    const list = await resumeApi.getMyResumes();

    expect(list[0].createdAt).toBe(new Date(1776837199655).toISOString());
    expect(list[0].status).toBe('COMPLETED');
  });
});
