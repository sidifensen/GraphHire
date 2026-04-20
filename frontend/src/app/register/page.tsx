'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [role, setRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <style jsx global>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <div className="min-h-screen bg-[#f8f9ff] text-[#0e1c2c] font-body flex items-center justify-center relative overflow-hidden antialiased">
        {/* Ambient Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#dbe1ff] opacity-30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#d5e4fa] opacity-40 blur-[120px] pointer-events-none" />

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-screen">
          <div className="flex flex-col lg:flex-row w-full bg-white rounded-xl shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden">
            {/* Left Pane: Branding */}
            <div className="hidden lg:flex flex-col w-[35%] bg-[#eef4ff] p-12 relative overflow-hidden justify-between border-r border-[#e5eeff]/50">
              {/* Background Image Placeholder */}
              <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwmuoFo1R--r-fZ27-XSnwb4ddH66PLKTc255gbUUT9SXpj1uV3Euc-jFU3hFZvDL2H2811RjlIqb4OFsC1nGRkDNR2zvjCICuc0auRuGKT0tY3pNzEdhQInJK2-X8pjLQDE8tn5_aWmPFhqRvPHJHs65wXM390bk4-nKnoP-CyuY0Rcg_v93kOynUxXqLJwFe4qMbKwGe4bQn5FtsSFdYaXUIA75gEAjhFgUD6aYVOneZJRcLzX-VMUvHPDwdkMet-K0tEs2x7wqs')" }} />

              <div className="relative z-10">
                <h1 className="font-black text-2xl tracking-tighter text-[#003da6] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>图谱智聘</h1>
                <p className="text-[#394851] text-sm tracking-wide font-medium">GraphHire</p>
              </div>

              <div className="relative z-10 mt-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dbe1ff] mb-6">
                  <span className="text-[#00174b]" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <span className="text-xs font-semibold text-[#00174b] tracking-wide">AI 驱动的职业导航</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4 text-[#0e1c2c]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  构建您的<br />职业图谱档案。
                </h2>
                <p className="text-[#434654] text-sm leading-relaxed mb-8">
                  通过认知分析与智能匹配，消除求职噪音。加入我们，让算法为您寻找最契合的发展路径。
                </p>
              </div>
            </div>

            {/* Right Pane: Form Area */}
            <div className="w-full lg:w-[65%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              {/* Back to Home */}
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#737686] hover:text-[#003da6] transition-colors mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>

              <div className="max-w-md w-full mx-auto lg:mx-0">
                <h2 className="text-2xl font-bold mb-8 text-[#0e1c2c]" style={{ fontFamily: 'Manrope, sans-serif' }}>创建账号</h2>

                {/* Role Switcher */}
                <div className="flex bg-[#eef4ff] p-1 rounded-lg w-fit mb-8">
                  <button
                    onClick={() => setRole('jobseeker')}
                    className={`shadow-sm rounded text-sm transition-all py-2 px-8 ${role === 'jobseeker' ? 'bg-white text-[#003da6] font-bold' : 'text-[#394851] hover:text-[#0e1c2c] font-medium'}`}
                  >
                    求职者
                  </button>
                  <button
                    onClick={() => setRole('recruiter')}
                    className={`rounded text-sm transition-colors py-2 px-8 ${role === 'recruiter' ? 'bg-white text-[#003da6] font-bold shadow-sm' : 'text-[#394851] hover:text-[#0e1c2c] font-medium'}`}
                  >
                    招聘者
                  </button>
                </div>

                <form className="flex flex-col gap-5">
                  {/* Phone Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#0e1c2c]">邮箱</label>
                    <input
                      className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                      placeholder="请输入邮箱地址"
                      type="email"
                    />
                  </div>

                  {/* Verification Code */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#0e1c2c]">验证码</label>
                    <div className="flex gap-3">
                      <input
                        className="flex-1 bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                        placeholder="6 位验证码"
                        type="text"
                      />
                      <button
                        className="whitespace-nowrap px-6 py-3 rounded bg-[#dbe9ff] text-[#003da6] font-medium text-sm hover:bg-[#e5eeff] transition-colors"
                        type="button"
                      >
                        获取验证码
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#0e1c2c]">密码</label>
                    <input
                      className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                      placeholder="设置 8-20 位密码，包含字母和数字"
                      type="password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#0e1c2c]">确认密码</label>
                    <input
                      className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                      placeholder="请再次输入密码"
                      type="password"
                    />
                  </div>

                  {/* Recruiter Fields */}
                  <div className={`flex-col gap-5 pt-4 mt-2 border-t border-[#e5eeff] ${role === 'recruiter' ? 'flex' : 'hidden'}`}>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">公司全称</label>
                      <input
                        className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                        placeholder="请输入营业执照上的公司全称"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">统一社会信用代码</label>
                      <input
                        className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                        placeholder="请输入 18 位信用代码"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start gap-3 mt-2">
                    <div className="flex items-center h-5">
                      <input
                        className="w-4 h-4 rounded text-[#003da6] border-[#c3c6d7] bg-[#eef4ff] focus:ring-[#003da6] focus:ring-offset-0 cursor-pointer"
                        id="agreement"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                    </div>
                    <label className="text-xs text-[#434654] leading-tight cursor-pointer select-none pt-0.5" htmlFor="agreement">
                      我已阅读并同意 <a className="text-[#003da6] hover:text-[#0052d9] transition-colors" href="#">《用户服务协议》</a> 和 <a className="text-[#003da6] hover:text-[#0052d9] transition-colors" href="#">《隐私政策》</a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full py-3.5 mt-4 rounded-lg bg-gradient-to-br from-[#003da6] to-[#0052d9] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center"
                    type="submit"
                  >
                    立即注册
                  </button>
                </form>

                {/* Post-registration Guidance Hint */}
                <div className="mt-8 p-4 rounded-lg bg-[#e5eeff] flex items-start gap-3 border border-[#dbe9ff]/50">
                  <span className="text-[#003da6] mt-0.5" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>info</span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#003da6] mb-1">注册成功后</h4>
                    <p className="text-xs text-[#394851] leading-relaxed">
                      系统将引导您进入「认知图谱初始化」流程，填写核心履历特征，以便 AI 引擎为您构建专属的竞争力画像。
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-[#394851]">
                    已有账号？ <Link className="text-[#003da6] font-medium hover:underline underline-offset-4" href="/login">立即登录</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
