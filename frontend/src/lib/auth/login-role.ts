import type { UserType } from '@/lib/types';

export type LoginRoleSelection = 'jobseeker' | 'recruiter';

export interface LoginRoleDecision {
  allowed: boolean;
  redirectPath?: string;
  authDomain?: 'user' | 'enterprise' | 'admin';
  errorMessage?: string;
}

export function resolveLoginRoleDecision(
  selectedRole: LoginRoleSelection,
  userType: UserType,
): LoginRoleDecision {
  if (selectedRole === 'recruiter') {
    if (userType === 'COMPANY') {
      return { allowed: true, redirectPath: '/enterprise/dashboard', authDomain: 'enterprise' };
    }
    return {
      allowed: false,
      errorMessage: '当前账号不是企业账号，请使用企业账号登录招聘者入口。',
    };
  }

  if (userType === 'PERSON') {
    return { allowed: true, redirectPath: '/', authDomain: 'user' };
  }

  if (userType === 'ADMIN') {
    return {
      allowed: false,
      errorMessage: '当前账号是管理员账号，请前往管理员登录入口。',
    };
  }

  return {
    allowed: false,
    errorMessage: '当前账号不是求职者账号，请切换到招聘者后重试。',
  };
}

