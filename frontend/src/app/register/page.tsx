'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { PersonRegisterRequest, CompanyRegisterRequest } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [agreed, setAgreed] = useState(false);

  // Form fields - empty initialization
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [unifiedSocialCreditCode, setUnifiedSocialCreditCode] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [verifyCodeCooldown, setVerifyCodeCooldown] = useState(0);
  const [error, setError] = useState('');

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

  const handleRoleSwitch = (newRole: 'jobseeker' | 'recruiter') => {
    setRole(newRole);
    setError('');
  };

  const handleSendVerifyCode = async () => {
    if (!email) {
      setError('请先输入邮箱地址');
      return;
    }

    setVerifyCodeLoading(true);
    setError('');

    try {
      await authApi.sendVerifyCode(email, 'register');
      setVerifyCodeCooldown(60);
      const timer = setInterval(() => {
        setVerifyCodeCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '发送验证码失败');
      setError(message);
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    if (!verifyCode) {
      setError('请输入验证码');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (password.length < 8 || password.length > 20) {
      setError('密码长度应为 8-20 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!agreed) {
      setError('请阅读并同意用户协议');
      return;
    }
    if (role === 'recruiter') {
      if (!companyName) {
        setError('请输入公司全称');
        return;
      }
      if (!unifiedSocialCreditCode) {
        setError('请输入统一社会信用代码');
        return;
      }
    }

    setLoading(true);

    try {
      let response;
      if (role === 'jobseeker') {
        const data: PersonRegisterRequest = { username: email, password, verifyCode };
        response = await authApi.personRegister(data);
      } else {
        const data: CompanyRegisterRequest = {
          username: email,
          password,
          verifyCode,
          companyName,
          unifiedSocialCreditCode,
        };
        response = await authApi.companyRegister(data);
      }

      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      const nextUser = { id: response.userId, username: email, type: response.userType };
      if (response.userType === 'COMPANY') {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
        router.push('/enterprise/dashboard');
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
        router.push('/');
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '注册失败，请稍后重试');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0e1c2c] font-body flex items-center justify-center relative overflow-hidden antialiased">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#dbe1ff] opacity-30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#d5e4fa] opacity-40 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-screen">
        <div className="flex flex-col lg:flex-row w-full bg-white rounded-xl shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden">
          {/* Left Pane: Branding */}
          <div className="hidden lg:flex flex-col w-[35%] bg-[#eef4ff] p-12 relative overflow-hidden justify-between border-r border-[#e5eeff]/50">
            <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwmuoFo1R--r-fZ27-XSnwb4ddH66PLKTc255gbUUT9SXpj1uV3Euc-jFU3hFZvDL2H2811RjlIqb4OFsC1nGRkDNR2zvjCICuc0auRuGKT0tY3pNzEdhQInJK2-X8pjLQDE8tn5_aWmPFhqRvPHJHs65wXM390bk4-nKnoP-CyuY0Rcg_v93kOynUxXqLJwFe4qMbKwGe4bQn5FtsSFdYaXUIA75gEAjhFgUD6aYVOneZJRcLzX-VMUvHPDwdkMet-K0tEs2x7wqs')" }} />

            <div className="relative z-10">
              <h1 className="font-black text-2xl tracking-tighter text-[#003da6] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>图谱智聘</h1>
              <p className="text-[#394851] text-sm tracking-wide font-medium">GraphHire</p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dbe1ff] mb-6">
                <svg className="w-4 h-4 text-[#00174b]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Role Switcher */}
              <div className="flex bg-[#eef4ff] p-1 rounded-lg w-fit mb-8">
                <button
                  onClick={() => handleRoleSwitch('jobseeker')}
                  className={`shadow-sm rounded text-sm transition-all py-2 px-8 ${role === 'jobseeker' ? 'bg-white text-[#003da6] font-bold' : 'text-[#394851] hover:text-[#0e1c2c] font-medium'}`}
                >
                  求职者
                </button>
                <button
                  onClick={() => handleRoleSwitch('recruiter')}
                  className={`rounded text-sm transition-colors py-2 px-8 ${role === 'recruiter' ? 'bg-white text-[#003da6] font-bold shadow-sm' : 'text-[#394851] hover:text-[#0e1c2c] font-medium'}`}
                >
                  招聘者
                </button>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#0e1c2c]">邮箱</label>
                  <input
                    className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                    placeholder="请输入邮箱地址"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                    />
                    <button
                      className="whitespace-nowrap px-6 py-3 rounded bg-[#dbe9ff] text-[#003da6] font-medium text-sm hover:bg-[#e5eeff] transition-colors disabled:opacity-50"
                      type="button"
                      onClick={handleSendVerifyCode}
                      disabled={verifyCodeLoading || verifyCodeCooldown > 0}
                    >
                      {verifyCodeCooldown > 0 ? `${verifyCodeCooldown}s` : '获取验证码'}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#0e1c2c]">确认密码</label>
                  <input
                    className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                    placeholder="请再次输入密码"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Recruiter Fields */}
                {role === 'recruiter' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">公司全称</label>
                      <input
                        className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                        placeholder="请输入营业执照上的公司全称"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#0e1c2c]">统一社会信用代码</label>
                      <input
                        className="bg-[#eef4ff] border-b-2 border-transparent focus:border-[#003da6] focus:bg-white focus:ring-0 px-4 py-3 rounded text-sm text-[#0e1c2c] placeholder:text-[#737686] transition-all outline-none"
                        placeholder="请输入 18 位信用代码"
                        type="text"
                        value={unifiedSocialCreditCode}
                        onChange={(e) => setUnifiedSocialCreditCode(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

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
                  className="w-full py-3.5 mt-4 rounded-lg bg-gradient-to-br from-[#003da6] to-[#0052d9] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '注册中...' : '立即注册'}
                </button>
              </form>

              {/* Post-registration Guidance Hint */}
              <div className="mt-8 p-4 rounded-lg bg-[#e5eeff] flex items-start gap-3 border border-[#dbe9ff]/50">
                <svg className="w-5 h-5 text-[#003da6] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
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
  );
}
