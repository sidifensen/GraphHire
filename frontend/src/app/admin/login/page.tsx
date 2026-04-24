'use client';

import { Network } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-surface text-on-surface font-sans">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWAq2BdbZGD7SBOjWG8vwqUDG-UHpkTTZ3_w2TnwckeuljE5gTIZWYAXL7d671Q8X9REizxOhEcgTHtfi1Znn3XZ1bbvtAaHxehiadjn0f14RHV1MURJuTI5b_CSmvqdlhFX10NvOO2ERUufNnCSSjFneBxoi7vR1u2aGTx0q-IsZK92EDdVx2_55f7iRQsCbqWzubnw6lQLo7-DMKWbMUuI6u6r7FN7xKdtdnoei8g1lIJGk0zJREfhg9MixtrC1yO9lIUM_en5zL"
          alt="background"
          className="h-full w-full object-cover object-bottom mix-blend-multiply"
        />
      </div>

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
              招聘管理
              <br />
              新篇章。
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-outline lg:text-xl">于无声处见繁华，重新定义招聘管理体验。</p>
          </motion.div>
        </div>

        <div className="flex flex-1 items-center justify-center py-12 lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card relative z-10 w-full max-w-[440px] rounded-2xl p-10"
          >
            <div className="mb-8">
              <h2 className="font-display mb-3 text-3xl font-bold text-on-surface">欢迎回来</h2>
              <p className="text-sm text-outline">请登录以继续管理 GraphHire 平台</p>
            </div>

            <div className="mb-8 flex gap-6 border-b border-outline-variant">
              <button className="border-b-2 border-primary pb-3 text-base font-medium text-primary">账号登录</button>
              <button className="pb-3 text-base font-medium text-outline transition-colors hover:text-on-surface">快捷登录</button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">账号 / 手机号</label>
                <input
                  type="text"
                  placeholder="请输入您的账号"
                  className="block w-full rounded-lg border-none bg-surface px-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  className="block w-full rounded-lg border-none bg-surface px-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-outline">
                  <input type="checkbox" className="rounded border-outline-variant text-primary" />
                  记住我
                </label>
                <a href="#" className="text-sm font-medium text-on-surface transition-colors hover:text-primary">
                  忘记密码?
                </a>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                登 录
              </button>

              <div className="pt-4 text-center text-sm">
                <span className="text-outline">新职员?</span>
                <a href="#" className="ml-1 font-medium text-on-surface hover:underline">
                  申请内部账号
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <footer className="font-display z-10 flex w-full flex-col items-center justify-between px-10 py-8 text-xs uppercase tracking-wider text-outline md:flex-row">
        <p>© 2024 GRAPHHIRE. ALL RIGHTS RESERVED.</p>
        <div className="mt-4 flex gap-6 lowercase md:mt-0">
          <a href="#" className="transition-colors hover:text-on-surface">
            隐私政策
          </a>
          <a href="#" className="transition-colors hover:text-on-surface">
            服务条款
          </a>
          <a href="#" className="transition-colors hover:text-on-surface">
            联系我们
          </a>
        </div>
      </footer>
    </div>
  );
}
