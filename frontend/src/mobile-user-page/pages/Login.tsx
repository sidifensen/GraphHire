"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Network } from 'lucide-react';
import { Link, useNavigate } from '@/mobile-user-page/router';
import { motion } from 'framer-motion';

export default function Login() {
  const [role, setRole] = useState<'seeker' | 'recruiter'>('seeker');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-on-surface antialiased bg-[#fbf8ff]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[radial-gradient(#c3c5d9_1px,transparent_1px)] [background-size:40px_40px]"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[100px] z-0 pointer-events-none"></div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[24px] p-8 shadow-[0px_16px_40px_rgba(0,62,199,0.08)] relative group"
        >
          {/* Subtle Hover Light Border Effect */}
          <div className="absolute inset-0 rounded-[24px] border-[1.5px] border-transparent group-hover:border-primary/20 transition-colors duration-500 pointer-events-none"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">GraphHire</h1>
            <p className="text-sm text-on-surface-variant">智慧连接，触达顶尖人才</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-surface-variant/50 relative">
            <button 
              onClick={() => setRole('seeker')}
              className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                role === 'seeker' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
              }`}
            >
              求职者
            </button>
            <button 
              onClick={() => setRole('recruiter')}
              className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                role === 'recruiter' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/80'
              }`}
            >
              招聘者
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Phone/Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-outline-variant" size={20} />
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                placeholder="请输入邮箱" 
                type="email"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-outline-variant" size={20} />
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                placeholder="请输入密码" 
                type="password"
                required
              />
            </div>

            {/* Auxiliary Links */}
            <div className="flex justify-between items-center px-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary" type="checkbox" />
                <span className="text-xs text-on-surface-variant font-medium">记住我</span>
              </label>
              <a className="text-xs text-primary font-bold hover:opacity-80 transition-opacity" href="#">忘记密码？</a>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg shadow-[0px_4px_12px_rgba(0,62,199,0.3)] hover:shadow-[0px_6px_16px_rgba(0,62,199,0.4)] hover:-translate-y-[1px] hover:bg-primary/90 transition-all duration-200 relative overflow-hidden group flex justify-center items-center gap-2"
                type="submit"
              >
                <span>立即登录</span>
                <ArrowRight size={20} />
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </button>
            </div>
          </form>

          {/* Sign up Link */}
          <div className="mt-8 text-center border-t border-surface-variant/30 pt-6">
            <p className="text-xs text-on-surface-variant">
              还没有账号？ 
              <Link to="/register" className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-all">立即注册</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

