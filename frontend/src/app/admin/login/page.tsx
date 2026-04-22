'use client';

import { useState } from 'react';
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
    <div
      data-testid="admin-login-page"
      className="min-h-screen flex flex-col justify-between items-center text-on-surface antialiased"
      style={{
        backgroundImage: 'radial-gradient(circle at 0% 0%, #dbe9ff 0%, #f8f9ff 50%), radial-gradient(circle at 100% 100%, #e5eeff 0%, #f8f9ff 50%)',
        backgroundColor: '#f8f9ff',
      }}
    >

      {/* Top AppBar */}
      <header className="w-full flex justify-between items-center px-12 py-6 max-w-full">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined icon-fill text-primary text-3xl">hub</span>
          <span className="font-headline text-2xl font-extrabold tracking-tighter text-primary">GraphHire 图谱智聘</span>
          <span className="ml-4 px-2 py-1 rounded bg-primary-container text-on-primary-container text-xs font-semibold tracking-wider uppercase border border-primary/20">管理后台</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-10 relative overflow-hidden" style={{ boxShadow: '0 24px 64px -12px rgba(0, 23, 75, 0.1)' }}>
          <div
            data-testid="admin-login-card-glow"
            className="absolute top-0 right-0 w-48 h-48 bg-primary opacity-5 rounded-full blur-3xl -mr-20 -mt-20"
          ></div>
          <div className="text-center mb-10 relative z-10">
            <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-2">管理后台</h1>
            <p className="text-on-surface-variant text-sm font-body tracking-wide">登录以访问系统控制台</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {/* Account Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant" htmlFor="account">
                管理员账号 / 手机号
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-xl">person</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border-0 bg-surface-container-low text-on-surface rounded focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_2px_0_0_#003da6] transition-all"
                  id="account"
                  name="account"
                  placeholder="请输入账号"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 border-0 bg-surface-container-low text-on-surface rounded focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_2px_0_0_#003da6] transition-all"
                  id="password"
                  name="password"
                  placeholder="请输入密码"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-outline-variant text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary focus:ring-offset-surface-container-lowest"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-on-surface-variant" htmlFor="remember-me">
                  记住账号
                </label>
              </div>
              <div className="text-sm">
                <a className="font-medium text-primary hover:text-primary-container transition-colors" href="#">
                  忘记密码?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-on-primary bg-gradient-to-br from-primary to-primary-container hover:opacity-90 focus:outline-none transition-all shadow-[0_8px_16px_-4px_rgba(0,61,166,0.2)] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-12 py-8 flex justify-between items-center text-on-surface/60 text-sm tracking-wide border-t border-outline/20">
        <div>© 2024 GraphHire 管理后台</div>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-opacity" href="#">隐私协议</a>
          <a className="hover:text-primary transition-opacity" href="#">法律声明</a>
        </div>
      </footer>
    </div>
  );
}
