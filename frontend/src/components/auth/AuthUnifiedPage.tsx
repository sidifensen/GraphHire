'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Network } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { resolveLoginRoleDecision } from '@/lib/auth/login-role';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { CompanyRegisterRequest, LoginRequest, PersonRegisterRequest } from '@/lib/types';

const LOGIN_DEV_ACCOUNTS = {
  jobseeker: { username: '13800138001@phone.com', password: 'password123' },
  recruiter: { username: 'hr@techchina.com', password: 'password123' },
} as const;

export type AuthMode = 'login' | 'register';

interface AuthUnifiedPageProps {
  initialMode: AuthMode;
}

export default function AuthUnifiedPage({ initialMode }: AuthUnifiedPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [loginRole, setLoginRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [loginEmail, setLoginEmail] = useState<string>(LOGIN_DEV_ACCOUNTS.jobseeker.username);
  const [loginPassword, setLoginPassword] = useState<string>(LOGIN_DEV_ACCOUNTS.jobseeker.password);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [reviewPending, setReviewPending] = useState(false);

  const [registerRole, setRegisterRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [registerEmail, setRegisterEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [unifiedSocialCreditCode, setUnifiedSocialCreditCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [verifyCodeCooldown, setVerifyCodeCooldown] = useState(0);
  const [registerError, setRegisterError] = useState('');
  const [registerNotice, setRegisterNotice] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setReviewPending(params.get('review') === 'pending');
    if (params.get('role') === 'enterprise') {
      setRegisterRole('recruiter');
    } else if (initialMode === 'register') {
      setRegisterRole('jobseeker');
    }
  }, [initialMode]);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === 'object') {
      const maybeResponse = err as {
        code?: string;
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const rawMessage = maybeResponse.message;
      if (
        maybeResponse.code === 'ECONNABORTED' ||
        (typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('timeout'))
      ) {
        return '请求超时，请稍后重试';
      }
      const message = maybeResponse.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
    return err instanceof Error ? err.message : fallback;
  };

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      const nextPath = nextMode === 'login' ? '/login' : '/register';
      if (window.location.pathname !== nextPath) {
        window.history.pushState(null, '', nextPath);
      }
    }
    setLoginError('');
    setRegisterError('');
    setRegisterNotice('');
  };

  const handleLoginRoleSwitch = (role: 'jobseeker' | 'recruiter') => {
    setLoginRole(role);
    setLoginEmail(LOGIN_DEV_ACCOUNTS[role].username);
    setLoginPassword(LOGIN_DEV_ACCOUNTS[role].password);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const data: LoginRequest = { username: loginEmail, password: loginPassword };
      const response = await authApi.login(data);
      const decision = resolveLoginRoleDecision(loginRole, response.userType);
      if (!decision.allowed || !decision.authDomain || !decision.redirectPath) {
        setLoginError(decision.errorMessage ?? '账号角色与当前登录入口不匹配');
        return;
      }

      const nextUser = { id: response.userId, username: loginEmail, type: response.userType };
      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      if (decision.authDomain === 'enterprise') {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
      }
      router.push(decision.redirectPath);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : '登录失败，请检查邮箱和密码');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterRoleSwitch = (role: 'jobseeker' | 'recruiter') => {
    setRegisterRole(role);
    setRegisterError('');
    setRegisterNotice('');
  };

  const handleSendVerifyCode = async () => {
    if (!registerEmail) {
      setRegisterError('请先输入邮箱地址');
      return;
    }

    setVerifyCodeLoading(true);
    setRegisterError('');
    setRegisterNotice('');

    try {
      await authApi.sendVerifyCode(registerEmail, 'register');
      setVerifyCodeCooldown(60);
      const timer = window.setInterval(() => {
        setVerifyCodeCooldown((prev) => {
          if (prev <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setRegisterError(extractErrorMessage(err, '发送验证码失败'));
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError('');
    setRegisterNotice('');

    if (!registerEmail) {
      setRegisterError('请输入邮箱地址');
      return;
    }
    if (!verifyCode) {
      setRegisterError('请输入验证码');
      return;
    }
    if (!registerPassword) {
      setRegisterError('请输入密码');
      return;
    }
    if (registerPassword.length < 8 || registerPassword.length > 20) {
      setRegisterError('密码长度应为 8-20 位');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setRegisterError('两次输入的密码不一致');
      return;
    }
    if (!agreed) {
      setRegisterError('请阅读并同意用户协议');
      return;
    }
    if (registerRole === 'recruiter') {
      if (!companyName) {
        setRegisterError('请输入公司全称');
        return;
      }
      if (!unifiedSocialCreditCode) {
        setRegisterError('请输入统一社会信用代码');
        return;
      }
    }

    setRegisterLoading(true);
    try {
      let response;
      if (registerRole === 'jobseeker') {
        const data: PersonRegisterRequest = { username: registerEmail, password: registerPassword, verifyCode };
        response = await authApi.personRegister(data);
      } else {
        const data: CompanyRegisterRequest = {
          username: registerEmail,
          password: registerPassword,
          verifyCode,
          companyName,
          unifiedSocialCreditCode,
        };
        response = await authApi.companyRegister(data);
      }

      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      const nextUser = { id: response.userId, username: registerEmail, type: response.userType };
      if (response.userType === 'COMPANY') {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
        router.push('/enterprise/dashboard');
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
        router.push('/');
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '注册失败，请稍后重试');
      if (registerRole === 'recruiter' && message.includes('该公司正在审核中，暂不可进入企业端')) {
        setRegisterNotice('注册成功，企业已提交管理员审核。审核通过后即可进入企业端。');
        window.setTimeout(() => {
          router.push('/login?review=pending');
        }, 1200);
        return;
      }
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-surface text-on-surface font-sans">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
          alt="auth-background"
          className="h-full w-full object-cover object-center mix-blend-multiply"
        />
      </div>

      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.22),transparent_40%)]" />

      <div className="absolute left-10 top-8 z-20 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Network size={20} />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-on-surface">GraphHire</span>
      </div>

      <div className="z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 lg:flex-row lg:px-24">
        <div className="flex flex-1 flex-col justify-center pb-12 pt-24 lg:pb-0 lg:pr-12 lg:pt-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display mb-8 text-4xl font-bold leading-[1.1] tracking-tight text-on-surface lg:text-6xl">
              开启 AI 智能
              <br />
              人才连接
              <br />
              新篇章。
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-outline lg:text-xl">让招聘与求职在同一张能力图谱中高效相遇。</p>
          </motion.div>
        </div>

        <div className="flex flex-1 items-center justify-center py-12 lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="glass-card relative z-10 w-full max-w-[480px] rounded-2xl p-8 md:p-10"
          >
            <div className="mb-7">
              <h2 className="font-display mb-2 text-3xl font-bold text-on-surface">{mode === 'login' ? '欢迎回来' : '创建账号'}</h2>
              <p className="text-sm text-outline">{mode === 'login' ? '请登录以继续使用 GraphHire' : '完成注册以开启智能招聘体验'}</p>
            </div>

            {mode === 'login' ? (
              <>
                {reviewPending ? (
                  <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。
                  </div>
                ) : null}
                {loginError ? <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{loginError}</div> : null}

                <div className="mb-6 flex border-b border-surface-variant/50" role="tablist">
                  <button
                    role="tab"
                    aria-selected={loginRole === 'jobseeker'}
                    onClick={() => handleLoginRoleSwitch('jobseeker')}
                    className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                      loginRole === 'jobseeker' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
                    }`}
                  >
                    求职者
                  </button>
                  <button
                    role="tab"
                    aria-selected={loginRole === 'recruiter'}
                    onClick={() => handleLoginRoleSwitch('recruiter')}
                    className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                      loginRole === 'recruiter' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
                    }`}
                  >
                    招聘者
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div>
                    <input
                      className="block w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3.5 text-sm text-on-surface placeholder:text-outline outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="请输入邮箱"
                      type="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <input
                      className="block w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3.5 text-sm text-on-surface placeholder:text-outline outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="请输入密码"
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end px-1 pt-1">
                    <a className="text-xs font-bold text-primary transition-opacity hover:opacity-80" href="#">
                      忘记密码？
                    </a>
                  </div>

                  <div className="pt-2">
                    <button
                      className="w-full rounded-xl bg-primary py-3.5 text-lg font-bold text-white shadow-[0px_4px_12px_rgba(0,62,199,0.3)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-[0px_6px_16px_rgba(0,62,199,0.4)] disabled:opacity-50"
                      type="submit"
                      disabled={loginLoading}
                    >
                      {loginLoading ? '登录中...' : '立即登录'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <span className="text-xs font-medium text-on-surface-variant">还未有账号？</span>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="ml-1 text-xs font-black text-primary hover:underline underline-offset-2"
                  >
                    去注册
                  </button>
                </div>
              </>
            ) : (
              <>
                {registerError ? <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{registerError}</div> : null}
                {registerNotice ? <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{registerNotice}</div> : null}

                <form onSubmit={handleRegisterSubmit} className="space-y-6" autoComplete="off">
                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">选择您的身份</label>
                    <div className="flex gap-4" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={registerRole === 'jobseeker'}
                        onClick={() => handleRegisterRoleSwitch('jobseeker')}
                        className={`h-full flex-1 rounded-xl border-2 p-4 text-sm font-bold transition-all ${
                          registerRole === 'jobseeker'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-surface-variant bg-surface text-on-surface hover:border-outline-variant'
                        }`}
                      >
                        我是求职者
                      </button>

                      <button
                        type="button"
                        role="tab"
                        aria-selected={registerRole === 'recruiter'}
                        onClick={() => handleRegisterRoleSwitch('recruiter')}
                        className={`h-full flex-1 rounded-xl border-2 p-4 text-sm font-bold transition-all ${
                          registerRole === 'recruiter'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-surface-variant bg-surface text-on-surface hover:border-outline-variant'
                        }`}
                      >
                        我是招聘者
                      </button>
                    </div>
                  </div>

                  <div className="h-px w-full bg-outline-variant/30" />

                  <AnimatePresence mode="wait">
                    {registerRole === 'recruiter' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 rounded-2xl border border-outline-variant/30 bg-surface-low p-4 text-on-surface">
                          <div>
                            <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="companyName">
                              公司名称
                            </label>
                            <input
                              id="companyName"
                              className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                              placeholder="请输入企业全称"
                              type="text"
                              value={companyName}
                              onChange={(event) => setCompanyName(event.target.value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="creditCode">
                              统一社会信用代码
                            </label>
                            <input
                              id="creditCode"
                              className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                              placeholder="18位验证码或数字"
                              type="text"
                              value={unifiedSocialCreditCode}
                              onChange={(event) => setUnifiedSocialCreditCode(event.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="email">
                        邮箱
                      </label>
                      <input
                        id="email"
                        autoComplete="off"
                        className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="请输入邮箱"
                        type="email"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="verificationCode">
                        验证码
                      </label>
                      <div className="flex gap-3">
                        <input
                          id="verificationCode"
                          autoComplete="off"
                          className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="6位验证码"
                          type="text"
                          value={verifyCode}
                          onChange={(event) => setVerifyCode(event.target.value)}
                        />
                        <button
                          className="whitespace-nowrap rounded-lg border border-outline-variant bg-surface-low px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-variant disabled:opacity-50"
                          type="button"
                          onClick={handleSendVerifyCode}
                          disabled={verifyCodeLoading || verifyCodeCooldown > 0}
                        >
                          {verifyCodeCooldown > 0 ? `${verifyCodeCooldown}s` : '获取验证码'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="password">
                          设置密码
                        </label>
                        <input
                          id="password"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="至少8位字符"
                          type="password"
                          value={registerPassword}
                          onChange={(event) => setRegisterPassword(event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-on-surface-variant" htmlFor="confirmPassword">
                          确认密码
                        </label>
                        <input
                          id="confirmPassword"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="再次输入密码"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded border-outline-variant bg-surface-lowest text-primary focus:ring-primary"
                      id="agreement"
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => setAgreed(event.target.checked)}
                    />
                    <label className="text-xs font-medium leading-relaxed text-on-surface-variant" htmlFor="agreement">
                      我已阅读并同意 <a className="font-black text-primary hover:underline" href="#">《用户协议》</a> 和{' '}
                      <a className="font-black text-primary hover:underline" href="#">《隐私政策》</a>
                    </label>
                  </div>

                  <button
                    className="w-full rounded-xl bg-primary py-4 text-lg font-black text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                    type="submit"
                    disabled={registerLoading}
                  >
                    {registerLoading ? '注册中...' : '创建账号'}
                  </button>

                  <div className="text-center">
                    <span className="text-xs font-medium text-on-surface-variant">已有账号？</span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="ml-1 text-xs font-black text-primary hover:underline underline-offset-2"
                    >
                      去登录
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
