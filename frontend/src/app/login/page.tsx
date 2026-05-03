'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api/auth';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { LoginRequest } from '@/lib/types';
import { resolveLoginRoleDecision } from '@/lib/auth/login-role';

const DEV_ACCOUNTS = {
  jobseeker: { username: '13800138001@phone.com', password: 'password123' },
  recruiter: { username: 'hr@techchina.com', password: 'password123' },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [email, setEmail] = useState<string>(DEV_ACCOUNTS.jobseeker.username);
  const [password, setPassword] = useState<string>(DEV_ACCOUNTS.jobseeker.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewPending, setReviewPending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setReviewPending(params.get('review') === 'pending');
  }, []);

  const handleRoleSwitch = (role: 'jobseeker' | 'recruiter') => {
    setActiveRole(role);
    setEmail(DEV_ACCOUNTS[role].username);
    setPassword(DEV_ACCOUNTS[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: LoginRequest = { username: email, password };
      const response = await authApi.login(data);
      const decision = resolveLoginRoleDecision(activeRole, response.userType);
      if (!decision.allowed || !decision.authDomain || !decision.redirectPath) {
        setError(decision.errorMessage ?? '账号角色与当前登录入口不匹配');
        return;
      }

      const nextUser = { id: response.userId, username: email, type: response.userType };
      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      if (decision.authDomain === 'enterprise') {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
      }
      router.push(decision.redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-layout-shell"
      className="min-h-screen relative overflow-hidden font-sans text-on-surface antialiased bg-gradient-to-br from-[#f5f8ff] via-[#f7f9fd] to-[#eef3ff]"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35 bg-[radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-[22%] right-[4%] w-[36rem] h-[36rem] rounded-full bg-primary/10 blur-[90px] z-0 pointer-events-none" />
      <div className="absolute -bottom-[26%] left-[6%] w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-[90px] z-0 pointer-events-none" />

      <div className="relative z-10 min-h-screen w-full max-w-[1160px] mx-auto px-4 py-8 md:py-12 lg:py-16 flex items-center">
        <div className="grid w-full items-center gap-8 md:gap-12 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section data-testid="login-brand-panel" className="hidden lg:block">
            <p className="inline-flex items-center rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary/90">
              GRAPHHIRE
            </p>
            <h2 className="mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-[1.15] text-[#102847]">
              简约现代的人才连接体验
            </h2>
            <p className="mt-4 max-w-[34ch] text-base leading-7 text-on-surface-variant">
              智慧连接，触达顶尖人才。更清晰的登录入口，为求职者和招聘者建立高效率的第一步。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-primary/20 bg-white/75 px-4 py-1.5 text-sm font-semibold text-primary/85">角色分流</span>
              <span className="rounded-full border border-primary/20 bg-white/75 px-4 py-1.5 text-sm font-semibold text-primary/85">快速登录</span>
              <span className="rounded-full border border-primary/20 bg-white/75 px-4 py-1.5 text-sm font-semibold text-primary/85">稳定体验</span>
            </div>
          </section>

          <main data-testid="login-form-panel" className="w-full max-w-[440px] mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/88 backdrop-blur-xl border border-white/80 rounded-[28px] p-8 shadow-[0px_18px_50px_rgba(10,42,88,0.12)] relative group"
            >
              <div className="absolute inset-0 rounded-[28px] border border-primary/5 group-hover:border-primary/20 transition-colors duration-500 pointer-events-none" />

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">GraphHire</h1>
                <p className="text-sm text-on-surface-variant">智慧连接，触达顶尖人才</p>
              </div>

              {reviewPending && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
                  该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。
                </div>
              )}
              {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

              <div className="flex mb-8 border-b border-surface-variant/50 relative" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeRole === 'jobseeker'}
                  onClick={() => handleRoleSwitch('jobseeker')}
                  className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                    activeRole === 'jobseeker' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
                  }`}
                >
                  求职者
                </button>
                <button
                  role="tab"
                  aria-selected={activeRole === 'recruiter'}
                  onClick={() => handleRoleSwitch('recruiter')}
                  className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                    activeRole === 'recruiter' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
                  }`}
                >
                  招聘者
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    className="block w-full px-4 py-3.5 bg-surface-lowest border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    placeholder="请输入邮箱"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    className="block w-full px-4 py-3.5 bg-surface-lowest border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end items-center px-1 pt-1">
                  <a className="text-xs text-primary font-bold hover:opacity-80 transition-opacity" href="#">
                    忘记密码？
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg shadow-[0px_4px_12px_rgba(0,62,199,0.3)] hover:shadow-[0px_6px_16px_rgba(0,62,199,0.4)] hover:-translate-y-[1px] hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? '登录中...' : '立即登录'}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center border-t border-surface-variant/30 pt-6">
                <p className="text-xs text-on-surface-variant">
                  还没有账号？
                  <Link href="/register" className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-all">
                    立即注册
                  </Link>
                </p>
                <p className="text-xs text-on-surface-variant mt-2">
                  <Link href="/" className="text-primary/80 hover:text-primary underline-offset-4 hover:underline">
                    返回首页
                  </Link>
                </p>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
