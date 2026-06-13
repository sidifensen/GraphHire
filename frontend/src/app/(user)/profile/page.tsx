'use client';

import React, { useEffect, useState } from 'react';
import { User, FileText, Network, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { userAuthStore } from '@/lib/stores/auth-store';
import { personApi, type PersonProfile } from '@/lib/api/person';
import { chatApi } from '@/lib/api/chat';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

function formatGender(gender?: number | null): string {
  if (gender === 1) {
    return '男';
  }
  if (gender === 2) {
    return '女';
  }
  return '未完善';
}

function formatAge(age?: number | null): string {
  if (age == null) {
    return '未完善';
  }
  return `${age} 岁`;
}

function formatExpectedSalary(expectedSalary?: number | null): string {
  if (expectedSalary == null) {
    return '未完善';
  }
  return `${expectedSalary} 元/月`;
}

function displayField(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '未完善';
}

export default function Profile() {
  const [authState, setAuthState] = useState(() => userAuthStore.getState());
  const authUser = authState.user;
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [stats, setStats] = useState({
    conversationCount: 0,
    unreadCount: 0,
  });
  const [avatarError, setAvatarError] = useState(false);
  const displayName = profile?.realName?.trim() || authUser?.displayName || authUser?.username || '未登录用户';
  const contactText = profile?.email?.trim() || authUser?.email || authUser?.username || '暂无联系方式';
  const avatarSrc = profile?.avatarUrl || authUser?.avatarUrl || null;
  const mobileMenuItems = [
    { name: '个人资料', icon: User, path: '/personal-info' },
    { name: '简历管理', icon: FileText, path: '/resume/manage' },
    { name: '我的图谱', icon: Network, path: '/skill-graph' },
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
      setProfile(null);
      setStats({
        conversationCount: 0,
        unreadCount: 0,
      });
      return () => {
        active = false;
      };
    }
    Promise.all([
      personApi.getProfile(),
      chatApi.listConversations(),
    ])
      .then(([nextProfile, conversations]) => {
        if (!active) {
          return;
        }
        if (nextProfile) {
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
        }
        const conversationCount = Array.isArray(conversations) ? conversations.length : 0;
        const unreadCount = Array.isArray(conversations)
          ? conversations.reduce((total, item) => total + (item.unreadCount || 0), 0)
          : 0;
        setStats({ conversationCount, unreadCount });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setStats({
          conversationCount: 0,
          unreadCount: 0,
        });
      });

    return () => {
      active = false;
    };
  }, [authUser?.id]);

  useEffect(() => {
    const id = authUser?.id;
    if (!id) return;
    const timer = window.setInterval(async () => {
      try {
        const conversations = await chatApi.listConversations();
        if (!Array.isArray(conversations)) return;
        const conversationCount = conversations.length;
        const unreadCount = conversations.reduce((total, item) => total + (item.unreadCount || 0), 0);
        setStats((prev) => ({ ...prev, conversationCount, unreadCount }));
      } catch {
        // no-op
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [authUser?.id]);

  return (
    <div className="flex min-h-screen md:min-h-[calc(100vh-4rem)] flex-col bg-surface-background px-5 pb-32 pt-6 md:px-8 md:pt-12">
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
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-surface-mid px-4 pt-6">
              <div className="text-center group cursor-pointer">
                <div data-testid="profile-stat-conversation" className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{stats.conversationCount}</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">会话数</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div data-testid="profile-stat-unread" className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{stats.unreadCount}</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">未读</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-surface-mid bg-surface-lowest p-6 md:p-8">
            <h3 className="text-lg font-black text-on-surface">个人档案</h3>
            <div className="mt-5 overflow-hidden rounded-xl border border-surface-mid">
              <ProfileInfoRow
                testId="profile-info-row-basic"
                label="性别 / 年龄 / 电话"
                values={[
                  formatGender(profile?.gender),
                  formatAge(profile?.age),
                  displayField(profile?.phone),
                ]}
              />
              <ProfileInfoRow
                testId="profile-info-row-education"
                label="学历 / 学校 / 所在城市"
                values={[
                  displayField(profile?.education),
                  displayField(profile?.school),
                  displayField(profile?.city),
                ]}
              />
              <ProfileInfoRow
                testId="profile-info-row-intention"
                label="目标城市 / 期望薪资"
                values={[
                  displayField(profile?.targetCity),
                  formatExpectedSalary(profile?.expectedSalary),
                ]}
              />
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
        </div>
      </div>
      
      <div className="h-24 md:hidden"></div>
    </div>
  );
}

type ProfileInfoRowProps = {
  testId: string;
  label: string;
  values: string[];
};

function ProfileInfoRow({ testId, label, values }: ProfileInfoRowProps) {
  return (
    <div
      data-testid={testId}
      className="grid grid-cols-1 gap-3 border-b border-surface-mid px-4 py-4 last:border-b-0 md:grid-cols-[220px_1fr]"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-on-surface">
        {values.map((value, index) => (
          <span key={`${label}-${index}`}>{value}</span>
        ))}
      </div>
    </div>
  );
}
