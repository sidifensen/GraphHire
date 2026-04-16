'use client';

import { usePersonStore } from '@/stores/personStore';

export function WelcomeBanner() {
  const info = usePersonStore((s) => s.info);
  const name = info?.name || '求职者';

  return (
    <div className="h-32 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-6 flex items-center justify-between">
      <div className="text-white">
        <h2 className="text-2xl font-semibold">欢迎回来，{name}</h2>
        <p className="mt-1 text-white/80">已为您匹配 12 个新职位</p>
      </div>
      <a
        href="/person/graph"
        className="px-4 py-2 bg-white text-primary rounded-button text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        查看能力图谱 →
      </a>
    </div>
  );
}