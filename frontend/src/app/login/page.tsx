'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { authApi } from '@/lib/api/auth';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { LoginRequest } from '@/lib/types';

// Material Symbols SVG icons
const PersonIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

const VisibilityOffIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);

const ArrowForwardIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
  </svg>
);

const PsychologyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const isDev = process.env.NODE_ENV === 'development';

const DEV_ACCOUNTS = {
  jobseeker: { username: '13800138001@phone.com', password: 'password123' },
  recruiter: { username: 'hr@techchina.com', password: 'password123' },
};

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [username, setUsername] = useState(isDev ? DEV_ACCOUNTS.jobseeker.username : '');
  const [password, setPassword] = useState(isDev ? DEV_ACCOUNTS.jobseeker.password : '');
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
    if (isDev) {
      setUsername(DEV_ACCOUNTS[role].username);
      setPassword(DEV_ACCOUNTS[role].password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: LoginRequest = { username, password };
      const response = await authApi.login(data);
      const nextUser = { id: response.userId, username, type: response.userType };
      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      if (activeRole === 'recruiter') {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
      }

      if (activeRole === 'recruiter') {
        router.push('/enterprise/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败，请检查用户名和密码';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0e1c2c] font-body flex items-center justify-center relative overflow-hidden antialiased">
      {/* Ambient Background Elements for Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#dbe1ff] opacity-30 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#d5e4fa] opacity-40 blur-[120px] pointer-events-none"></div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-screen">
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-6rem)] bg-white rounded-xl shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden">
          {/* Left Pane: Cognitive Branding (35% width on desktop) */}
          <div className="hidden lg:flex flex-col w-[35%] bg-[#eef4ff] p-12 relative overflow-hidden justify-between border-r border-[#e5eeff]/50">
            {/* Abstract Graph Image */}
            <div
              className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-multiply"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwmuoFo1R--r-fZ27-XSnwb4ddH66PLKTc255gbUUT9SXpj1uV3Euc-jFU3hFZvDL2H2811RjlIqb4OFsC1nGRkDNR2zvjCICuc0auRuGKT0tY3pNzEdhQInJK2-X8pjLQDE8tn5_aWmPFhqRvPHJHs65wXM390bk4-nKnoP-CyuY0Rcg_v93kOynUxXqLJwFe4qMbKwGe4bQn5FtsSFdYaXUIA75gEAjhFgUD6aYVOneZJRcLzX-VMUvHPDwdkMet-K0tEs2x7wqs')" }}
            ></div>

            <div className="relative z-10">
              <h1 className="font-headline font-black text-2xl tracking-tighter text-[#003da6] mb-2">图谱智聘</h1>
              <p className="text-[#394851] text-sm tracking-wide font-medium">GraphHire</p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dbe1ff] mb-6">
                <PsychologyIcon />
                <span className="text-xs font-semibold text-[#00174b] tracking-wide">AI 驱动的职业导航</span>
              </div>
              <h2 className="font-headline text-3xl font-bold leading-tight mb-4 text-[#0e1c2c]">消除噪音<br />发现深层关联</h2>
              <p className="text-[#434654] text-sm leading-relaxed mb-8">
                GraphHire 通过构建全景式职业认知图谱，将海量简历与岗位数据转化为结构化洞察。不再是盲目的关键词匹配，而是基于能力基因的精准导航。
              </p>
            </div>
          </div>

          {/* Right Pane: Form Area (65% width on desktop) */}
          <div className="w-full lg:w-[65%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            {/* Back to Home */}
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#737686] hover:text-[#003da6] transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </Link>

            <div className="max-w-md w-full mx-auto lg:mx-0">
              <h2 className="font-headline text-2xl font-bold mb-8 text-[#0e1c2c]">欢迎回来</h2>

              {/* Error Message */}
              {reviewPending && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
                  该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Role Switcher (Segmented Control) */}
              <div className="flex bg-[#eef4ff] p-1 rounded-lg w-fit mb-8" role="tablist">
                {(['jobseeker', 'recruiter'] as const).map((role) => {
                  const isActive = activeRole === role;
                  const label = role === 'jobseeker' ? '求职者' : '招聘者';

                  return (
                    <button
                      key={role}
                      aria-selected={isActive}
                      onClick={() => handleRoleSwitch(role)}
                      className={`relative rounded text-sm py-2 px-8 transition-colors ${
                        isActive
                          ? 'text-[#003da6] font-bold'
                          : 'text-[#394851] hover:text-[#0e1c2c] font-medium'
                      }`}
                      role="tab"
                    >
                      {isActive && (
                        <motion.span
                          data-testid="role-switch-indicator"
                          layoutId="login-role-indicator"
                          className="absolute inset-0 rounded bg-white shadow-sm"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 450, damping: 36 }
                          }
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeRole}
                  data-testid="login-role-panel"
                  data-role={activeRole}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                >
                  <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Username/Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">用户名/邮箱</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <PersonIcon />
                        </div>
                        <input
                          className="w-full bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 pl-12 pr-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                          placeholder="请输入用户名/邮箱"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">密码</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockIcon />
                        </div>
                        <input
                          className="w-full bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 pl-12 pr-12 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                          placeholder="请输入密码"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#434654] hover:text-[#003da6] transition-colors"
                        >
                          <VisibilityOffIcon />
                        </button>
                      </div>
                    </div>

                    {/* Utilities Row */}
                    <div className="flex items-center justify-end mt-2">
                      <Link className="text-xs text-[#003da6] hover:text-[#0052d9] transition-colors" href="#">
                        忘记密码？
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      className="w-full py-3.5 mt-4 rounded-lg bg-gradient-to-br from-[#003da6] to-[#0052d9] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? '登录中...' : <><span>登录</span><ArrowForwardIcon /></>}
                    </button>
                  </form>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#394851]">
                  还没有账号？{' '}
                  <Link className="text-[#003da6] font-medium hover:underline underline-offset-4" href="/register">
                    立即注册
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
