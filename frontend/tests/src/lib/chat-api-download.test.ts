import { describe, expect, it, vi, beforeEach } from 'vitest';

const getMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  default: {
    get: getMock,
  },
}));

describe('chatApi.downloadResume', () => {
  beforeEach(() => {
    vi.resetModules();
    getMock.mockReset();
  });

  it('throws backend message when blob is json error payload', async () => {
    getMock.mockResolvedValue({
      data: new Blob([JSON.stringify({ code: 404, message: '请求资源不存在', data: null })], {
        type: 'application/json',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const { chatApi } = await import('@/lib/api/chat');

    await expect(chatApi.downloadResume(1, 2)).rejects.toThrow('请求资源不存在');
  });

  it('returns blob and decoded filename when payload is pdf', async () => {
    const pdfBlob = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
    getMock.mockResolvedValue({
      data: pdfBlob,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': "attachment; filename*=UTF-8''%E7%AE%80%E5%8E%86.pdf",
      },
    });

    const { chatApi } = await import('@/lib/api/chat');
    const result = await chatApi.downloadResume(1, 2);

    expect(result.blob).toBe(pdfBlob);
    expect(result.fileName).toBe('简历.pdf');
  });
});
