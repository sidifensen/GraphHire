'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#243142] to-[#0E1C2C] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">hub</span>
            </div>
            <h1 className="text-3xl font-black text-white font-headline tracking-tight">GraphHire</h1>
          </div>
          <p className="text-surface-dim">管理后台登录</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-surface-dim font-medium">管理员账号</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-surface-dim text-xl">person</span>
                <input
                  type="text"
                  placeholder="请输入管理员账号"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-surface-dim/50 focus:outline-none focus:border-primary-fixed focus:bg-white/15 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-surface-dim font-medium">密码</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-surface-dim text-xl">lock</span>
                <input
                  type="password"
                  placeholder="请输入密码"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-surface-dim/50 focus:outline-none focus:border-primary-fixed focus:bg-white/15 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-surface-dim cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-primary-fixed" />
                记住登录状态
              </label>
              <a href="#" className="text-primary-fixed hover:underline">忘记密码？</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#003DA6] to-[#2D50CD] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">autorenew</span>
                  登录中...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  登录
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-surface-dim">
              切换到 <a href="/login" className="text-primary-fixed hover:underline">候选人登录</a>
              或 <a href="/enterprise" className="text-primary-fixed hover:underline">企业登录</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-surface-dim/50 text-xs mt-8">
          © 2024 GraphHire 图谱智聘 · 管理员后台
        </p>
      </div>
    </div>
  );
}