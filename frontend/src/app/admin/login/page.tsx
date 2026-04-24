'use client';

import { useState } from 'react';
import { Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { adminAuthStore } from '@/lib/stores/auth-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login({ username, password });
      adminAuthStore.getState().setAuth(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        { id: response.userId, username, type: response.userType }
      );
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败，请检查用户名和密码';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWAq2BdbZGD7SBOjWG8vwqUDG-UHpkTTZ3_w2TnwckeuljE5gTIZWYAXL7d671Q8X9REizxOhEcgTHtfi1Znn3XZ1bbvtAaHxehiadjn0f14RHV1MURJuTI5b_CSmvqdlhFX10NvOO2ERUufNnCSSjFneBxoi7vR1u2aGTx0q-IsZK92EDdVx2_55f7iRQsCbqWzubnw6lQLo7-DMKWbMUuI6u6r7FN7xKdtdnoei8g1lIJGk0zJREfhg9MixtrC1yO9lIUM_en5zL"
          alt="background"
          className="h-full w-full object-cover object-bottom mix-blend-multiply"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 lg:flex-row lg:px-24">
        <section className="flex flex-1 flex-col justify-center pb-12 pt-24 lg:pb-0 lg:pr-12 lg:pt-0">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">GraphHire</span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
            开启 AI 智能
            <br />
            招聘管理
            <br />
            新篇章。
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">于无声处见繁华，重新定义招聘管理体验。</p>
        </section>

        <section className="flex flex-1 items-center justify-center py-10 lg:justify-end">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/40 bg-white/85 p-10 shadow-2xl backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">欢迎回来</h2>
              <p className="mt-2 text-sm text-slate-500">请登录以继续管理 GraphHire 平台</p>
            </div>

            <div className="mb-8 flex gap-6 border-b border-slate-200">
              <button className="border-b-2 border-blue-600 pb-3 text-base font-medium text-blue-600">账号登录</button>
              <button className="pb-3 text-base font-medium text-slate-400">快捷登录</button>
            </div>

            {error ? <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="account">
                  账号 / 手机号
                </label>
                <input
                  id="account"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的账号"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  密码
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  记住我
                </label>
                <a href="#" className="font-medium text-slate-700 hover:text-blue-600">
                  忘记密码?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '登录中...' : '登 录'}
              </button>

              <div className="pt-3 text-center text-sm">
                <span className="text-slate-500">新职员?</span>
                <a href="#" className="ml-1 font-medium text-slate-800 hover:underline">
                  申请内部账号
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>

      <footer className="z-10 flex w-full flex-col items-center justify-between px-10 py-6 text-xs text-slate-400 md:flex-row">
        <p>© 2026 GRAPHHIRE. ALL RIGHTS RESERVED.</p>
        <div className="mt-3 flex gap-6 md:mt-0">
          <a href="#" className="hover:text-slate-600">
            隐私政策
          </a>
          <a href="#" className="hover:text-slate-600">
            服务条款
          </a>
          <a href="#" className="hover:text-slate-600">
            联系我们
          </a>
        </div>
      </footer>
    </div>
  );
}
