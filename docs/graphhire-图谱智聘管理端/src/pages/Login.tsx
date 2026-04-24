import { Network } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="bg-surface min-h-screen flex flex-col relative overflow-hidden text-on-surface font-sans">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWAq2BdbZGD7SBOjWG8vwqUDG-UHpkTTZ3_w2TnwckeuljE5gTIZWYAXL7d671Q8X9REizxOhEcgTHtfi1Znn3XZ1bbvtAaHxehiadjn0f14RHV1MURJuTI5b_CSmvqdlhFX10NvOO2ERUufNnCSSjFneBxoi7vR1u2aGTx0q-IsZK92EDdVx2_55f7iRQsCbqWzubnw6lQLo7-DMKWbMUuI6u6r7FN7xKdtdnoei8g1lIJGk0zJREfhg9MixtrC1yO9lIUM_en5zL"
          alt="background"
          className="w-full h-full object-cover object-bottom mix-blend-multiply"
        />
      </div>

      <div className="absolute top-8 left-10 z-20 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <Network size={20} />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-on-surface">GraphHire</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto z-10 px-6 lg:px-24">
        <div className="flex-1 flex flex-col justify-center pt-24 lg:pt-0 pb-12 lg:pb-0 lg:pr-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-bold leading-[1.1] text-on-surface mb-8 font-display tracking-tight text-4xl lg:text-6xl">
              开启 AI 智能<br />
              招聘管理<br />
              新篇章。
            </h1>
            <p className="text-lg lg:text-xl text-outline max-w-lg leading-relaxed">
              于无声处见繁华，重新定义招聘管理体验。
            </p>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center lg:justify-end py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card w-full max-w-[440px] rounded-2xl p-10 relative z-10"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-on-surface mb-3 font-display">欢迎回来</h2>
              <p className="text-sm text-outline">请登录以继续管理 GraphHire 平台</p>
            </div>

            <div className="flex gap-6 mb-8 border-b border-outline-variant">
              <button className="pb-3 text-base font-medium text-primary border-b-2 border-primary">账号登录</button>
              <button className="pb-3 text-base font-medium text-outline hover:text-on-surface transition-colors">快捷登录</button>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">账号 / 手机号</label>
                <input
                  type="text"
                  placeholder="请输入您的账号"
                  className="block w-full px-4 py-3 border-none rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  className="block w-full px-4 py-3 border-none rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-outline cursor-pointer">
                  <input type="checkbox" className="rounded border-outline-variant text-primary" />
                  记住我
                </label>
                <a href="#" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">忘记密码?</a>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-lg text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                登 录
              </button>

              <div className="pt-4 text-center text-sm">
                <span className="text-outline">新职员?</span>
                <a href="#" className="font-medium text-on-surface hover:underline ml-1">申请内部账号</a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-10 py-8 z-10 text-xs text-outline font-display uppercase tracking-wider">
        <p>© 2024 GRAPHHIRE. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6 mt-4 md:mt-0 lowercase">
          <a href="#" className="hover:text-on-surface transition-colors">隐私政策</a>
          <a href="#" className="hover:text-on-surface transition-colors">服务条款</a>
          <a href="#" className="hover:text-on-surface transition-colors">联系我们</a>
        </div>
      </footer>
    </div>
  );
}
