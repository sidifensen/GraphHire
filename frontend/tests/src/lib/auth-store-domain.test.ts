import { beforeAll, describe, expect, it, vi } from 'vitest';

let getAuthDomainByPath: (pathname: string) => 'admin' | 'enterprise' | 'user';
let getStorageKeyByDomain: (domain: 'admin' | 'enterprise' | 'user') => string;

beforeAll(async () => {
  const actual = await vi.importActual<typeof import('@/lib/stores/auth-store')>('@/lib/stores/auth-store');
  getAuthDomainByPath = actual.getAuthDomainByPath;
  getStorageKeyByDomain = actual.getStorageKeyByDomain;
});

describe('auth store domain isolation', () => {
  it('maps route prefix to auth domain', () => {
    expect(getAuthDomainByPath('/admin/dashboard')).toBe('admin');
    expect(getAuthDomainByPath('/enterprise/jobs')).toBe('enterprise');
    expect(getAuthDomainByPath('/jobs')).toBe('user');
  });

  it('uses different storage keys across domains', () => {
    expect(getStorageKeyByDomain('user')).toBe('auth-storage-user');
    expect(getStorageKeyByDomain('enterprise')).toBe('auth-storage-enterprise');
    expect(getStorageKeyByDomain('admin')).toBe('auth-storage-admin');
  });
});