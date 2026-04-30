'use client';

import React, { useEffect, useState } from 'react';
import { Edit2, MessageSquare, Briefcase, Heart, ChevronRight, User, FileText, Send, Network, Settings, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/app/(user)/_mock/context/ThemeContext';
import { userAuthStore } from '@/lib/stores/auth-store';
import { personApi, type PersonProfile } from '@/lib/api/person';
import { logoutWithServerInvalidation } from '@/lib/logout';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [authState, setAuthState] = useState(() => userAuthStore.getState());
  const authUser = authState.user;
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const displayName = profile?.realName?.trim() || authUser?.displayName || authUser?.username || '未登录用户';
  const contactText = profile?.email?.trim() || authUser?.email || authUser?.username || '暂无联系方式';
  const avatarSrc = profile?.avatarUrl || authUser?.avatarUrl || null;

  const menuItems = [
    { name: '个人资料', icon: User, path: '/personal-info' },
    { name: '简历管理', icon: FileText, path: '/resume' },
    { name: '投递记录', icon: Send, path: '/applications' },
    { name: '我的图谱', icon: Network, path: '/graph' },
    { name: '账号设置', icon: Settings, path: '#', divider: true },
  ];

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    const unsubscribe = userAuthStore.subscribe((nextState) => {
      setAuthState(nextState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    if (!authUser?.id) {
      return () => {
        active = false;
      };
    }
    personApi
      .getProfile()
      .then((nextProfile) => {
        if (!active || !nextProfile) {
          return;
        }
        setProfile(nextProfile);
        const nextPatch: {
          displayName?: string;
          email?: string;
          avatarUrl?: string | null;
        } = {};
        if (nextProfile.realName && nextProfile.realName.trim()) {
          nextPatch.displayName = nextProfile.realName.trim();
        }
        if (nextProfile.email && nextProfile.email.trim()) {
          nextPatch.email = nextProfile.email.trim();
        }
        if (nextProfile.avatarUrl) {
          nextPatch.avatarUrl = nextProfile.avatarUrl;
        }
        if (Object.keys(nextPatch).length > 0) {
          userAuthStore.getState().updateUser(nextPatch);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [authUser?.id]);

  const handleLogout = async () => {
    await logoutWithServerInvalidation(router.push, '/login', 'user');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-background p-5 md:p-8">
      <div className="max-w-7xl mx-auto w-full md:pt-16 md:pb-32 grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Profile Card & Stats (Left Column on Desktop) */}
        <div className="md:col-span-4 md:sticky md:top-24 space-y-6">
          <section className="bg-surface-lowest rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,82,255,0.05)] relative overflow-hidden pt-8">
            <div className="flex items-center gap-5 relative z-10 flex-col text-center">
              <div className="w-20 md:w-28 md:h-28 h-20 rounded-full overflow-hidden border-4 border-surface-background bg-surface-mid shadow-sm mx-auto">
                {!avatarSrc || avatarError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                  </div>
                ) : (
                  <img 
                    src={avatarSrc}
                    className="w-full h-full object-cover" 
                    alt="avatar"
                    onError={() => setAvatarError(true)}
                  />
                )}
              </div>
              <div className="flex-1 w-full flex flex-col items-center">
                <h2 className="text-2xl font-black text-on-surface mb-1">{displayName}</h2>
                <p className="text-body-md text-on-surface-variant mb-4">{contactText}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container/30 text-primary text-xs font-bold">
                    离职-随时到岗
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-mid flex justify-between items-center px-4">
              <div className="text-center group cursor-pointer">
                <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">12</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">沟通过</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">5</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">面试</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">28</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">收藏</div>
              </div>
            </div>
          </section>

          {/* Additional Info (Desktop Only) */}
          <div className="hidden md:block bg-surface-lowest rounded-3xl p-6 shadow-sm border border-surface-mid">
            <h3 className="font-black text-sm uppercase text-outline mb-4 tracking-widest">求职意向</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-wide mb-1">期望城市</div>
                <div className="text-sm font-bold text-on-surface">北京、上海、杭州</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-wide mb-1">期望薪资</div>
                <div className="text-sm font-bold text-on-surface">25k - 45k</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu & Settings (Right Column on Desktop) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Theme Toggle */}
          <section className="bg-surface-lowest rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,82,255,0.05)] flex items-center justify-between border border-transparent md:border-surface-mid">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="text-body-lg font-bold text-on-surface">夜间模式</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-all duration-300 relative flex items-center px-1 ${
                theme === 'dark' ? 'bg-primary' : 'bg-surface-mid'
              }`}
            >
              <motion.div 
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-sm"
              />
            </button>
          </section>

          {/* Menu List */}
          <section className="bg-surface-lowest rounded-3xl shadow-[0_4px_20px_rgba(0,82,255,0.05)] overflow-hidden border border-transparent md:border-surface-mid">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {menuItems.map((item, idx) => (
                <Link 
                  key={item.name}
                  href={item.path}
                  className={`flex items-center justify-between p-5 hover:bg-surface-low transition-colors border-b border-surface-background ${idx % 2 === 0 ? 'md:border-r' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.divider ? 'bg-surface-mid text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                      <item.icon size={22} />
                    </div>
                    <span className="text-body-lg font-bold text-on-surface">{item.name}</span>
                  </div>
                  <ChevronRight className="text-outline" size={20} />
                </Link>
              ))}
              <Link 
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  void handleLogout();
                }}
                className="flex items-center justify-between p-5 hover:bg-surface-low transition-colors text-red-500 md:col-span-2"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500">
                    <Settings size={22} />
                  </div>
                  <span className="text-body-lg font-bold">退出登录</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Desktop Summary Content */}
          <div className="hidden md:grid grid-cols-2 gap-6 mt-2">
            <div className="bg-surface-lowest p-8 rounded-[32px] border border-surface-mid flex flex-col gap-4">
               <MessageSquare className="text-primary" size={32} />
               <h3 className="font-black text-xl">职业咨询</h3>
               <p className="text-sm text-on-surface-variant leading-relaxed">获取专业的职业规划建议，提升面试竞争力。</p>
            </div>
            <div className="bg-surface-lowest p-8 rounded-[32px] border border-surface-mid flex flex-col gap-4">
               <Briefcase className="text-primary" size={32} />
               <h3 className="font-black text-xl">内推机会</h3>
               <p className="text-sm text-on-surface-variant leading-relaxed">查看专属内推岗位，让职业路径更通畅。</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-24 md:hidden"></div>
    </div>
  );
}
