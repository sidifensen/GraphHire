import { describe, expect, it } from 'vitest';
import { resolveLoginRoleDecision } from '@/lib/auth/login-role';

describe('resolveLoginRoleDecision', () => {
  it('allows recruiter role for company user', () => {
    const decision = resolveLoginRoleDecision('recruiter', 'COMPANY');
    expect(decision.allowed).toBe(true);
    expect(decision.redirectPath).toBe('/enterprise/dashboard');
    expect(decision.authDomain).toBe('enterprise');
  });

  it('rejects recruiter role for admin user', () => {
    const decision = resolveLoginRoleDecision('recruiter', 'ADMIN');
    expect(decision.allowed).toBe(false);
    expect(decision.errorMessage).toContain('不是企业账号');
  });

  it('allows jobseeker role for person user', () => {
    const decision = resolveLoginRoleDecision('jobseeker', 'PERSON');
    expect(decision.allowed).toBe(true);
    expect(decision.redirectPath).toBe('/');
    expect(decision.authDomain).toBe('user');
  });

  it('rejects jobseeker role for admin user', () => {
    const decision = resolveLoginRoleDecision('jobseeker', 'ADMIN');
    expect(decision.allowed).toBe(false);
    expect(decision.errorMessage).toContain('管理员');
  });
});

