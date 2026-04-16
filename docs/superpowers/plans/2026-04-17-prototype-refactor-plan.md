# 原型图重构为 Next.js 页面 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 14 个 HTML 原型页面完全重构为 Next.js 页面，统一使用 Tailwind CSS 和 Material Symbols 图标库

**Architecture:** 整体替换 tailwind.config.ts 配色系统，抽取共享布局组件，然后逐页面组重写。所有布局不再使用 Ant Design ProLayout，统一使用 Tailwind 手写布局。

**Tech Stack:** Next.js App Router, Tailwind CSS, Material Symbols Outlined, TypeScript

---

## 文件映射总览

### 基础设施
| 操作 | 文件路径 |
|-----|---------|
| Modify | `frontend/tailwind.config.ts` |
| Modify | `frontend/app/globals.css` |
| Create | `frontend/components/shared/layout/PublicHeader.tsx` |
| Create | `frontend/components/shared/layout/PublicFooter.tsx` |
| Create | `frontend/components/shared/layout/SideNav.tsx` |
| Create | `frontend/components/shared/layout/TopBar.tsx` |
| Create | `frontend/components/shared/layout/GlassCard.tsx` |
| Create | `frontend/components/shared/layout/StatCard.tsx` |
| Create | `frontend/components/shared/layout/index.ts` |

### 公开端 / 个人端（TopNav + Footer）
| 操作 | 文件路径 |
|-----|---------|
| Modify | `frontend/app/(public)/page.tsx` |
| Modify | `frontend/app/(main)/person/resume/page.tsx` |
| Modify | `frontend/app/(main)/person/graph/page.tsx` |
| Create | `frontend/app/(main)/person/jobs/[id]/page.tsx` |

### 企业端（SideNav + TopBar）
| 操作 | 文件路径 |
|-----|---------|
| Modify | `frontend/app/(main)/company/home/page.tsx` |
| Create | `frontend/app/(main)/company/job/page.tsx` |
| Create | `frontend/app/(main)/company/profile/page.tsx` |
| Create | `frontend/app/(main)/company/job/create/page.tsx` |
| Create | `frontend/app/(main)/company/resume/page.tsx` |

### 管理端（SideNav + TopBar）
| 操作 | 文件路径 |
|-----|---------|
| Modify | `frontend/app/(admin)/dashboard/page.tsx` |
| Create | `frontend/app/(admin)/users/page.tsx` |
| Create | `frontend/app/(admin)/task/page.tsx` |
| Create | `frontend/app/(admin)/skill/page.tsx` |
| Create | `frontend/app/(admin)/company/page.tsx` |

---

## 第一批：基础设施

### Task 1: 更新 Tailwind 配置

**Files:**
- Modify: `frontend/tailwind.config.ts`

- [ ] **Step 1: 备份并替换 tailwind.config.ts**

替换 `frontend/tailwind.config.ts` 全部内容为：

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005bbf',
          container: '#1a73e8',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc7ff',
        },
        secondary: {
          DEFAULT: '#006972',
          container: '#8feefc',
          fixed: '#92f1fe',
          'fixed-dim': '#75d5e2',
        },
        tertiary: {
          DEFAULT: '#005ac0',
          container: '#2a73e1',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc6ff',
        },
        background: '#f8f9fa',
        surface: {
          DEFAULT: '#f8f9fa',
          container: '#edeeef',
          'container-low': '#f3f4f5',
          'container-lowest': '#ffffff',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          variant: '#e1e3e4',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          tint: '#005bc0',
        },
        'on-surface': '#191c1d',
        'on-surface-variant': '#414754',
        'on-background': '#191c1d',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#006d77',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffffff',
        outline: '#727785',
        'outline-variant': '#c1c6d6',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        inverse: '#f0f1f2',
        inverseSurface: '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        inversePrimary: '#adc7ff',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',
        'on-secondary-fixed': '#001f23',
        'on-secondary-fixed-variant': '#004f56',
        'on-tertiary-fixed': '#001a41',
        'on-tertiary-fixed-variant': '#004494',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: 提交**

```bash
git add frontend/tailwind.config.ts
git commit -m "feat(frontend): 更新 tailwind 配色系统为 Material Design 风格"
```

---

### Task 2: 更新全局 CSS

**Files:**
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: 替换 globals.css 内容**

替换 `frontend/app/globals.css` 全部内容为：

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:wght@300..700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/app/globals.css
git commit -m "feat(frontend): 更新全局样式，引入 Material Symbols 和玻璃效果"
```

---

### Task 3: 创建共享布局组件

**Files:**
- Create: `frontend/components/shared/layout/PublicHeader.tsx`
- Create: `frontend/components/shared/layout/PublicFooter.tsx`
- Create: `frontend/components/shared/layout/SideNav.tsx`
- Create: `frontend/components/shared/layout/TopBar.tsx`
- Create: `frontend/components/shared/layout/GlassCard.tsx`
- Create: `frontend/components/shared/layout/StatCard.tsx`
- Create: `frontend/components/shared/layout/index.ts`

- [ ] **Step 1: 创建 PublicHeader.tsx**

创建 `frontend/components/shared/layout/PublicHeader.tsx`：

```tsx
'use client';

import Link from 'next/link';

const navLinks = [
  { href: '/', label: '探索职位' },
  { href: '/person/jobs', label: '我的申请' },
  { href: '/notifications', label: '消息中心' },
  { href: '/insights', label: '职业洞察' },
];

export default function PublicHeader() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md font-headline antialiased">
      <div className="flex justify-between items-center px-8 h-16 w-full max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-blue-700">
            图谱智聘
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 hover:bg-slate-50 transition-colors rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 transition-colors rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden ml-2 bg-surface-container-high">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 创建 PublicFooter.tsx**

创建 `frontend/components/shared/layout/PublicFooter.tsx`：

```tsx
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-surface-container-highest/50 py-16 px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <span className="text-xl font-bold tracking-tight text-blue-700">图谱智聘</span>
          <p className="text-on-surface-variant max-w-xs text-sm">
            通过智能劳动力映射和数据驱动的洞察，赋能下一代人才。
          </p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">平台</span>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">职位搜索</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">企业名录</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">价格方案</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">资源</span>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">使用指南</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">AI 洞察</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">博客</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">法律</span>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">隐私政策</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">服务条款</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">联系我们</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-outline-variant/20 flex justify-between items-center text-xs text-outline font-medium">
        <span>© 2024 图谱智聘 (GraphHire AI Inc.) 保留所有权利。</span>
        <div className="flex gap-6">
          <Link className="hover:text-primary" href="#">Twitter</Link>
          <Link className="hover:text-primary" href="#">LinkedIn</Link>
          <Link className="hover:text-primary" href="#">GitHub</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: 创建 SideNav.tsx**

创建 `frontend/components/shared/layout/SideNav.tsx`：

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SideNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  bottomAction?: React.ReactNode;
}

export default function SideNav({ items, logo, title, subtitle, bottomAction }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 bg-slate-50 dark:bg-slate-900 w-64 border-r-0 font-headline antialiased z-50">
      {logo || title ? (
        <div className="flex items-center gap-3 px-2 mb-8">
          {logo && <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">{logo}</div>}
          <div>
            <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      ) : null}

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {bottomAction && (
        <div className="mt-auto pt-4">
          {bottomAction}
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: 创建 TopBar.tsx**

创建 `frontend/components/shared/layout/TopBar.tsx`：

```tsx
'use client';

interface TopBarProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function TopBar({ title, breadcrumbs, actions }: TopBarProps) {
  return (
    <header className="flex justify-between items-center h-16 px-8 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10 font-headline">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="material-symbols-outlined text-xs">chevron_right</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-primary">{crumb.label}</a>
                ) : (
                  <span className="text-primary font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        {actions || (
          <>
            <div className="relative group">
              <input
                className="bg-surface-container-low border-none rounded-full px-4 py-2 pl-10 w-64 focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                placeholder="搜索..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-500 transition-colors">notifications</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-500 transition-colors">settings</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-500 transition-colors">help_outline</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 5: 创建 GlassCard.tsx**

创建 `frontend/components/shared/layout/GlassCard.tsx`：

```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glass-card rounded-xl ring-1 ring-primary/10 relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: 创建 StatCard.tsx**

创建 `frontend/components/shared/layout/StatCard.tsx`：

```tsx
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  accentColor?: string;
}

export default function StatCard({ icon, label, value, trend, trendType, accentColor = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: 'bg-primary-container/10 text-primary',
    secondary: 'bg-secondary-container/20 text-secondary',
    tertiary: 'bg-tertiary-container/10 text-tertiary',
    error: 'bg-error-container/20 text-error',
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all hover:translate-y-[-4px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-lg ${colorMap[accentColor as keyof typeof colorMap] || colorMap.primary} flex items-center justify-center mb-4`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="text-sm font-label font-bold text-outline uppercase tracking-wider">{label}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-headline font-extrabold text-on-surface">{value}</span>
          {trend && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trendType === 'up' ? 'text-green-600 bg-green-50' :
              trendType === 'down' ? 'text-error bg-error-container/50' :
              'text-on-surface-variant bg-surface-container-high'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 创建 index.ts**

创建 `frontend/components/shared/layout/index.ts`：

```ts
export { default as PublicHeader } from './PublicHeader';
export { default as PublicFooter } from './PublicFooter';
export { default as SideNav } from './SideNav';
export { default as TopBar } from './TopBar';
export { default as GlassCard } from './GlassCard';
export { default as StatCard } from './StatCard';
```

- [ ] **Step 8: 提交**

```bash
git add frontend/components/shared/layout/
git commit -m "feat(frontend): 添加共享布局组件 PublicHeader, PublicFooter, SideNav, TopBar, GlassCard, StatCard"
```

---

## 第二批：公开端 + 个人端页面

### Task 4: 重写公开首页 `(public)/page.tsx`

**Files:**
- Modify: `frontend/app/(public)/page.tsx`

- [ ] **Step 1: 读取并替换为原型 003-首页.html 的结构**

替换 `frontend/app/(public)/page.tsx` 内容，实现：
- Hero Section（玻璃搜索框、渐变光晕）
- 为您推荐 Section（JobCard 列表）
- 热门技能 & 顶级雇主 Section
- PublicHeader + PublicFooter 集成

```tsx
import { PublicHeader, PublicFooter } from '@/components/shared/layout';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <PublicHeader />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[716px] flex items-center justify-center px-8 py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] bg-primary-fixed opacity-20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary-fixed opacity-20 blur-[100px] rounded-full" />
          </div>
          <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold tracking-widest uppercase border border-outline-variant/20">
                AI 驱动搜索
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-background leading-tight">
                通过 <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">AI 图谱映射</span> <br /> 发现您的理想职位
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-lg">
                超越关键词匹配。我们的智能图谱将您独特的技能特征映射到行业领先公司的高增长机遇中。
              </p>
            </div>
            {/* Search Bar */}
            <div className="glass-card p-2 rounded-2xl border border-outline-variant/20 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-outline mr-3">search</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface" placeholder="职位名称、技能或公司" type="text" />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-outline mr-3">location_on</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface" placeholder="地点或远程办公" type="text" />
              </div>
              <button className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                立即探索
              </button>
            </div>
          </div>
        </section>

        {/* Recommended Section */}
        <section className="max-w-7xl mx-auto px-8 py-20 bg-surface-container-low rounded-[3rem]">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tight">为您推荐</h2>
              <p className="text-on-surface-variant">基于您的近期动态和图谱智聘 AI 档案映射结果。</p>
            </div>
            <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              查看所有匹配 <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Job Cards - 3 cards with mock data */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center p-2">
                      <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">T{i}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold border border-outline-variant/10">
                      {92 + i}% 匹配
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-on-surface">
                      {['高级产品设计师', '全栈工程师', 'AI 研究科学家'][i - 1]}
                    </h3>
                    <p className="text-on-surface-variant font-medium">
                      {['Lumina Systems', 'Vertex Finance', 'Neural Pathways'][i - 1]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">
                      {['远程办公', '纽约, NY', '帕罗奥图, CA'][i - 1]}
                    </span>
                    <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-medium text-outline">全职</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 flex justify-between items-center border-t border-surface-container">
                  <span className="text-on-surface font-bold">
                    {['$140k – $180k', '$165k – $210k', '$190k – $250k'][i - 1]}
                  </span>
                  <button className="text-primary font-bold">立即申请</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Skills & Employers */}
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-on-surface">您网络中的热门技能</h2>
                <p className="text-on-surface-variant">为您当前符合条件的空缺职位最常要求的技能。</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {['Typescript', 'LLM 微调', '数据可视化', 'Figma', '向量数据库', 'React Native', 'Kubernetes'].map((skill) => (
                  <span key={skill} className="bg-secondary-container/20 text-on-secondary-container px-5 py-2.5 rounded-xl border border-secondary-container/10 text-sm font-semibold hover:bg-secondary-container/40 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-on-surface">顶级招聘合作伙伴</h2>
                <p className="text-on-surface-variant">正活跃在图谱智聘人才库中招贤纳士的行业领导者。</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {['Stripe', 'Linear', 'OpenAI', 'Shopify', 'Airbnb', 'Notion'].map((company) => (
                  <div key={company} className="h-24 bg-surface-container flex items-center justify-center rounded-xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                    <span className="font-headline font-black text-outline text-lg">{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/app/\(public\)/page.tsx
git commit -m "feat(frontend): 重写公开首页，按照原型实现 Hero、推荐职位、热门技能模块"
```

---

### Task 5: 重写简历解析页 `(main)/person/resume/page.tsx`

**Files:**
- Modify: `frontend/app/(main)/person/resume/page.tsx`

- [ ] **Step 1: 重写简历解析页**

替换内容，实现上传区域 + AI 解析进度 + 技能提取侧边栏。

- [ ] **Step 2: 提交**

```bash
git add frontend/app/\(main\)/person/resume/page.tsx
git commit -m "feat(frontend): 重写简历解析页，实现上传进度和 AI 技能提取"
```

---

### Task 6: 重写能力图谱页 `(main)/person/graph/page.tsx`

**Files:**
- Modify: `frontend/app/(main)/person/graph/page.tsx`

- [ ] **Step 1: 重写能力图谱页**

替换内容，实现中心节点图谱 + 侧边技能分析面板。

- [ ] **Step 2: 提交**

```bash
git add frontend/app/\(main\)/person/graph/page.tsx
git commit -m "feat(frontend): 重写能力图谱页，实现可视化节点和技能分析"
```

---

### Task 7: 创建匹配详情页 `(main)/person/jobs/[id]/page.tsx`

**Files:**
- Create: `frontend/app/(main)/person/jobs/[id]/page.tsx`

- [ ] **Step 1: 创建匹配详情页**

实现左右分栏布局：左侧 AI 洞察 + 雷达图，右侧技能验证表格。

- [ ] **Step 2: 提交**

```bash
git add frontend/app/\(main\)/person/jobs/\[id\]/page.tsx
git commit -m "feat(frontend): 创建匹配详情页，实现 AI 洞察和技能验证表格"
```

---

## 第三批：企业端页面

### Task 8: 重写企业控制台 `(main)/company/home/page.tsx`

**Files:**
- Modify: `frontend/app/(main)/company/home/page.tsx`

- [ ] **Step 1: 读取现有文件并替换内容**

企业端使用 SideNav + TopBar 布局。

- [ ] **Step 2: 提交**

---

### Task 9: 创建职位管理页 `(main)/company/job/page.tsx`

**Files:**
- Create: `frontend/app/(main)/company/job/page.tsx`

- [ ] **Step 1: 创建职位管理页**

实现统计数据 + Tab 过滤 + 职位表格 + AI 分析侧边栏。

- [ ] **Step 2: 提交**

---

### Task 10: 创建企业信息页 `(main)/company/profile/page.tsx`

**Files:**
- Create: `frontend/app/(main)/company/profile/page.tsx`

- [ ] **Step 1: 创建企业信息页**

实现认证状态 + 基本信息表单 + 资质证明卡片。

- [ ] **Step 2: 提交**

---

### Task 11: 创建发布新职位页 `(main)/company/job/create/page.tsx`

**Files:**
- Create: `frontend/app/(main)/company/job/create/page.tsx`

- [ ] **Step 1: 创建发布新职位页**

实现表单（基本信息、职位描述）+ 技能标签 + AI 建议面板 + 固定底部操作栏。

- [ ] **Step 2: 提交**

---

### Task 12: 创建推荐简历页 `(main)/company/resume/page.tsx`

**Files:**
- Create: `frontend/app/(main)/company/resume/page.tsx`

- [ ] **Step 1: 创建推荐简历页**

实现左侧筛选器 + 候选人卡片列表 + 悬浮 AI 助手。

- [ ] **Step 2: 提交**

---

## 第四批：管理端页面

### Task 13: 重写管理后台仪表盘 `(admin)/dashboard/page.tsx`

**Files:**
- Modify: `frontend/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: 重写仪表盘**

实现统计数据卡片 + 趋势图 + 待办事项 + 最新企业审核表格。

- [ ] **Step 2: 提交**

---

### Task 14: 创建用户管理页 `(admin)/users/page.tsx`

**Files:**
- Create: `frontend/app/(admin)/users/page.tsx`

- [ ] **Step 1: 创建用户管理页**

实现用户类型筛选 + 状态筛选 + 用户表格 + 账户状态图例。

- [ ] **Step 2: 提交**

---

### Task 15: 创建任务监控页 `(admin)/task/page.tsx`

**Files:**
- Create: `frontend/app/(admin)/task/page.tsx`

- [ ] **Step 1: 创建任务监控页**

实现处理统计 + 任务类型 Tab + 任务明细表格 + 分页。

- [ ] **Step 2: 提交**

---

### Task 16: 创建技能标签管理页 `(admin)/skill/page.tsx`

**Files:**
- Create: `frontend/app/(admin)/skill/page.tsx`

- [ ] **Step 1: 创建技能标签管理页**

实现统计数据 + 标签表格 + 同义词推荐侧边栏 + 分类快捷访问。

- [ ] **Step 2: 提交**

---

### Task 17: 创建企业审核页 `(admin)/company/page.tsx`

**Files:**
- Create: `frontend/app/(admin)/company/page.tsx`

- [ ] **Step 1: 创建企业审核页**

实现审核统计 + 状态 Tab + 企业审核表格 + 审核模态框。

- [ ] **Step 2: 提交**

---

## 自检清单

完成所有任务后：

1. 检视 tailwind.config.ts 颜色是否与原型一致
2. 确认所有 SideNav 使用统一组件
3. 确认所有 TopBar 使用统一组件
4. 确认无 Ant Design 布局残留
5. 启动 `npm run dev` 验证构建通过

---

**Plan complete.** Saved to `docs/superpowers/plans/2026-04-17-prototype-refactor-plan.md`.
