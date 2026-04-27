"use client";

import React, { useState } from 'react';
import { Mail, Lock, Phone, ShieldCheck, Building2, User, Briefcase, RefreshCw, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from '@/mobile/router';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [role, setRole] = useState<'seeker' | 'recruiter'>('seeker');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#fbf8ff] p-4 relative overflow-x-hidden antialiased">
      {/* Decorative Tech Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-secondary-container/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Registration Container */}
      <main className="w-full max-w-[560px] z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/85 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0px_8px_32px_rgba(0,62,199,0.08)] overflow-hidden"
        >
          {/* Header Section */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                <RefreshCw className="text-primary" size={24} />
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter">GraphHire</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-1">开启您的 AI 招聘之旅</h1>
            <p className="text-sm text-on-surface-variant font-medium">选择您的专属角色，体验数据驱动的精准匹配</p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">选择您的身份</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="role" 
                      checked={role === 'seeker'} 
                      onChange={() => setRole('seeker')}
                      className="sr-only peer" 
                    />
                    <div className="h-full border-2 border-surface-variant bg-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-outline-variant">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        role === 'seeker' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <User size={20} />
                      </div>
                      <span className={`text-sm font-bold transition-colors ${role === 'seeker' ? 'text-primary' : 'text-on-surface'}`}>我是求职者</span>
                    </div>
                  </label>

                  <label className="flex-1 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="role" 
                      checked={role === 'recruiter'} 
                      onChange={() => setRole('recruiter')}
                      className="sr-only peer" 
                    />
                    <div className="h-full border-2 border-surface-variant bg-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-outline-variant relative overflow-hidden group">
                      {role === 'recruiter' && <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        role === 'recruiter' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <Briefcase size={20} />
                      </div>
                      <span className={`text-sm font-bold transition-colors ${role === 'recruiter' ? 'text-primary' : 'text-on-surface'}`}>我是招聘者</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="h-px w-full bg-outline-variant/30"></div>

              <AnimatePresence mode="wait">
                {role === 'recruiter' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1">
                      <div className="space-y-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 relative">
                        <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#fbf8ff] px-2 text-[10px] font-black text-primary tracking-widest uppercase border border-outline-variant/20 rounded">企业认证信息</div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="companyName">公司名称</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                            <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="companyName" placeholder="请输入企业全称" type="text" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="creditCode">统一社会信用代码</label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                            <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="creditCode" placeholder="18位验证码或数字" type="text" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="phone">手机号码</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="phone" placeholder="请输入手机号" type="tel" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="verificationCode">验证码</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="verificationCode" placeholder="6位验证码" type="text" />
                    </div>
                    <button className="whitespace-nowrap px-4 py-2.5 bg-surface-container border border-outline-variant text-primary font-bold text-xs rounded-lg hover:bg-surface-variant transition-colors" type="button">
                      获取验证码
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="password">设置密码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="password" placeholder="至少8位字符" type="password" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="confirmPassword">确认密码</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" id="confirmPassword" placeholder="再次输入密码" type="password" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-2">
                <input className="w-4 h-4 text-primary bg-white border-outline-variant rounded focus:ring-primary cursor-pointer mt-0.5" id="agreement" type="checkbox" required />
                <label className="text-xs text-on-surface-variant font-medium leading-relaxed" htmlFor="agreement">
                  我已阅读并同意 <a className="text-primary font-black hover:underline" href="#">《用户协议》</a> 和 <a className="text-primary font-black hover:underline" href="#">《隐私政策》</a>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98]" 
                type="submit"
              >
                创建账号
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-[shine_1.5s_ease-in-out_infinite]"></div>
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-xs text-on-surface-variant font-medium">已有账号？</span>
                <Link to="/login" className="text-primary font-black text-xs ml-1 hover:underline underline-offset-2">去登录</Link>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
      <style>{`
        @keyframes shine {
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}

