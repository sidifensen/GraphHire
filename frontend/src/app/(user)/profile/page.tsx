'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Briefcase, Settings, Moon, Sun, User, FileText, Send, Network, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/app/(user)/_mock/context/ThemeContext';
import { userAuthStore } from '@/lib/stores/auth-store';
import { personApi, type PersonProfile } from '@/lib/api/person';
import { logoutWithServerInvalidation } from '@/lib/logout';
import { useRouter } from 'next/navigation';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

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
  const mobileMenuItems = [
    { name: '个人资料', icon: User, path: '/personal-info' },
    { name: '简历管理', icon: FileText, path: '/resume/manage' },
    { name: '投递记录', icon: Send, path: '/applications' },
    { name: '我的图谱', icon: Network, path: '/skill-graph' },
    { name: '账号设置', icon: Settings, path: '#' },
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
    <div className="flex min-h-screen flex-col bg-surface-background px-5 pb-32 pt-6 md:px-8 md:pt-12">
      <div className="mx-auto flex w-full max-w-7xl gap-6 lg:gap-8">
        <UserWorkbenchSidebar />
        <div className="flex-1 space-y-6">
          <section className="rounded-2xl border border-surface-mid bg-surface-lowest p-6 md:p-8">
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
                <h2 className="mb-1 text-2xl font-black text-on-surface">{displayName}</h2>
                <p className="text-body-md text-on-surface-variant mb-4">{contactText}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container/30 text-primary text-xs font-bold">
                    离职-随时到岗
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-surface-mid px-4 pt-6">
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

          <section className="md:hidden overflow-hidden rounded-2xl border border-surface-mid bg-surface-lowest">
            <nav aria-label="我的页面移动菜单">
              {mobileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex items-center justify-between border-b border-surface-mid px-5 py-4 text-on-surface transition-colors last:border-b-0 hover:bg-surface-low"
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} className="text-primary" />
                    <span className="text-base font-bold">{item.name}</span>
                  </span>
                  <ChevronRight size={16} className="text-outline" />
                </Link>
              ))}
            </nav>
          </section>

          <section className="rounded-2xl border border-surface-mid bg-surface-lowest p-5">
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-outline">界面偏好</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="flex-1 text-body-lg font-bold text-on-surface">夜间模式</span>
              <button
                onClick={toggleTheme}
                className={`relative flex h-8 w-14 items-center rounded-full px-1 transition-all duration-300 ${
                  theme === 'dark' ? 'bg-primary' : 'bg-surface-mid'
                }`}
              >
                <motion.div
                  animate={{ x: theme === 'dark' ? 24 : 0 }}
                  className="h-6 w-6 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-surface-mid bg-surface-lowest">
            <h3 className="border-b border-surface-mid px-5 py-4 text-sm font-black uppercase tracking-widest text-outline">账户操作</h3>
            <div className="px-5 py-4">
              <button
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
                  <Settings size={20} />
                </span>
                <span className="text-sm font-bold">退出登录</span>
              </button>
            </div>
          </section>

          <div className="hidden lg:grid grid-cols-2 gap-6">
            <div className="rounded-2xl border border-surface-mid bg-surface-lowest p-6 md:p-8">
               <MessageSquare className="text-primary" size={32} />
               <h3 className="font-black text-xl">职业咨询</h3>
               <p className="text-sm text-on-surface-variant leading-relaxed">获取专业的职业规划建议，提升面试竞争力。</p>
            </div>
            <div className="rounded-2xl border border-surface-mid bg-surface-lowest p-6 md:p-8">
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
