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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_35%)]" />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 lg:flex-row lg:px-20">
        <section className="flex flex-1 flex-col justify-center py-20 lg:pr-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">GraphHire</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-6xl">
            开启 AI 智能
            <br />
            招聘管理
            <br />
            新篇章。
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-500">于无声处见繁华，重新定义招聘管理体验。</p>
        </section>

        <section className="flex flex-1 items-center justify-center py-10 lg:justify-end">
          <div className="w-full max-w-[440px] rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">欢迎回来</h2>
              <p className="mt-2 text-sm text-slate-500">请登录以继续管理 GraphHire 平台</p>
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
                className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
