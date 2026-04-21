/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api/client';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have HTTP methods', () => {
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.put).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should be an axios instance', () => {
    expect(apiClient).toHaveProperty('defaults');
    expect(apiClient).toHaveProperty('interceptors');
    expect(apiClient).toHaveProperty('get');
    expect(apiClient).toHaveProperty('post');
  });
});
