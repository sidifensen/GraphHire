# GraphHire Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 GraphHire 前端基础框架搭建，包含项目初始化、设计系统配置、首页、登录/注册页面，以及认证 API 对接。

**Architecture:** 采用 Next.js 16 App Router，按用户端/企业端/管理端分为不同的布局组（Route Groups）。设计系统通过 Tailwind CSS 4.2 的 CSS 变量实现。状态管理使用 Zustand，API 调用使用 React Query + Axios。

**Tech Stack:** Next.js 16, Tailwind CSS 4.2, TypeScript, Zustand, React Query, Axios, React Hook Form, Zod

---

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # 认证布局组（无导航栏）
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (user)/                   # 用户端布局组
│   │   │   ├── layout.tsx            # TopNavBar + BottomTab（移动端）
│   │   │   └── home/page.tsx
│   │   ├── layout.tsx               # 根布局
│   │   └── page.tsx                 # 根页面（重定向到 /home）
│   ├── components/
│   │   ├── ui/                      # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   └── layout/                  # 布局组件
│   │       ├── top-navbar.tsx
│   │       └── bottom-tab.tsx
│   ├── hooks/
│   │   └── use-auth.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios 实例
│   │   │   └── auth.ts             # 认证 API
│   │   └── stores/
│   │       └── auth-store.ts        # Zustand auth store
│   ├── types/
│   │   └── index.ts                 # 全局类型定义
│   └── styles/
│       └── globals.css              # CSS 变量 + Tailwind 入口
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Task 1: 项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/.env.local`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "graphhire-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8888",
    "build": "next build",
    "start": "next start -p 8888",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.2.0",
    "@tailwindcss/postcss": "^4.2.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

- [ ] **Step 2: 创建 next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 .env.local**

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:7777
```

- [ ] **Step 5: 创建 Tailwind 配置**

```typescript
import type { Config } from 'tailwindcss';
import { createPlugin } from '@tailwindcss/postcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004ac6',
          container: '#2563eb',
          fixed: { dim: '#b4c5ff' },
        },
        secondary: { DEFAULT: '#006c49', container: '#6cf8bb', fixed: { dim: '#4edea3' } },
        tertiary: { DEFAULT: '#784b00', container: '#996100', fixed: { dim: '#ffb95f' } },
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6' },
        surface: {
          DEFAULT: '#faf8ff',
          variant: '#dae2fd',
          container: { lowest: '#ffffff', low: '#f2f3ff', high: '#e2e7ff', highest: '#dae2fd' },
        },
        on: {
          surface: { DEFAULT: '#131b2e', variant: '#434655' },
          primary: { DEFAULT: '#ffffff', container: '#eeefff', fixed: { DEFAULT: '#00174b', variant: '#003ea8' } },
          secondary: { DEFAULT: '#ffffff', fixed: { DEFAULT: '#002113', variant: '#005236' } },
          tertiary: { DEFAULT: '#ffffff', fixed: { DEFAULT: '#2a1700', variant: '#653e00' }, container: '#ffeedd' },
          error: { DEFAULT: '#ffffff', container: '#93000a' },
        },
        outline: { DEFAULT: '#737686', variant: '#c3c6d7' },
        inverse: { surface: '#283044', primary: '#b4c5ff' },
        background: '#faf8ff',
        tint: '#0053db',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '1.25rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [createPlugin()],
};

export default config;
```

- [ ] **Step 6: 创建 postcss.config.mjs**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 7: 创建 globals.css**

```css
@import 'tailwindcss';

@theme {
  --color-primary: #004ac6;
  --color-primary-container: #2563eb;
  --color-secondary: #006c49;
  --color-tertiary: #784b00;
  --color-error: #ba1a1a;
  --color-surface: #faf8ff;
  --color-on-surface: #131b2e;
  --color-on-surface-variant: #434655;
  --font-headline: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
}

@layer base {
  html {
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-headline);
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
}
```

- [ ] **Step 8: 创建 src/styles/globals.css**

```css
@import 'tailwindcss';

@theme {
  --color-primary: #004ac6;
  --color-primary-container: #2563eb;
  --color-secondary: #006c49;
  --color-tertiary: #784b00;
  --color-error: #ba1a1a;
  --color-surface: #faf8ff;
  --color-on-surface: #131b2e;
  --color-on-surface-variant: #434655;
  --font-headline: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
}

@layer base {
  html {
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-headline);
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
}
```

- [ ] **Step 9: 创建 src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import '@/styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘',
  description: '基于AI智能匹配与能力图谱的招聘平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${manrope.variable} ${inter.variable} font-body antialiased bg-surface text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 10: 创建 src/app/page.tsx**

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}
```

- [ ] **Step 11: 安装依赖并验证**

```bash
cd frontend && npm install
npm run dev
# 访问 http://localhost:8888 应该重定向到 /home（暂无页面，先验证不报错）
```

---

## Task 2: 基础 UI 组件

**Files:**
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/badge.tsx`
- Create: `frontend/src/lib/utils.ts`

- [ ] **Step 1: 创建 lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 创建 components/ui/button.tsx**

```tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-headline font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0px_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0px_15px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5',
      secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
      outline: 'border border-outline-variant/20 bg-transparent text-primary hover:bg-surface-container-low',
      ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

- [ ] **Step 3: 创建 components/ui/input.tsx**

```tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface-container-low text-on-surface placeholder:text-outline border-0 border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all rounded-t-lg px-4 py-3 font-body text-base outline-none',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

- [ ] **Step 4: 创建 components/ui/card.tsx**

```tsx
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outlined';
}

function Card({ className, variant = 'elevated', children, ...props }: CardProps) {
  const variants = {
    elevated: 'bg-surface-container-lowest rounded-[1.25rem] shadow-[0px_20px_50px_rgba(19,27,46,0.06)] border border-outline-variant/15',
    flat: 'bg-surface-container-low rounded-xl',
    outlined: 'bg-surface-container-lowest rounded-xl border border-outline-variant/15',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export { Card };
```

- [ ] **Step 5: 创建 components/ui/badge.tsx**

```tsx
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-surface-variant text-primary',
    success: 'bg-secondary-fixed-dim text-secondary',
    warning: 'bg-tertiary-fixed text-tertiary',
    error: 'bg-error-container text-error',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
```

---

## Task 3: 布局组件

**Files:**
- Create: `frontend/src/components/layout/top-navbar.tsx`
- Create: `frontend/src/components/layout/bottom-tab.tsx`
- Create: `frontend/src/components/layout/icons.tsx` (Material Symbols 封装)

- [ ] **Step 1: 创建 components/layout/icons.tsx**

```tsx
import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <span className={`material-symbols-outlined ${className || ''}`} {...props}>
      {name}
    </span>
  );
}
```

- [ ] **Step 2: 创建 components/layout/top-navbar.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/home', label: '首页', icon: 'home' },
  { href: '/jobs', label: '职位', icon: 'work' },
  { href: '/companies', label: '公司', icon: 'business' },
  { href: '/skill-graph', label: '能力图谱', icon: 'psychology' },
];

export function TopNavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant/15">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-full mx-auto">
        {/* Logo */}
        <Link href="/home" className="text-2xl font-bold tracking-tight text-blue-700">
          GraphHire
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'pb-1 transition-colors hover:text-blue-600',
                pathname === link.href
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-on-surface-variant'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="notifications" />
          </button>
          <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="person" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: 创建 components/layout/bottom-tab.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/home', label: '首页', icon: 'home' },
  { href: '/jobs', label: '职位', icon: 'work' },
  { href: '/notifications', label: '消息', icon: 'chat' },
  { href: '/profile', label: '我的', icon: 'person' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/15">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <Icon name={tab.icon} className="text-xl" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## Task 4: 用户端布局

**Files:**
- Create: `frontend/src/app/(user)/layout.tsx`

- [ ] **Step 1: 创建 (user) 布局**

```tsx
import { TopNavBar } from '@/components/layout/top-navbar';
import { BottomTabBar } from '@/components/layout/bottom-tab';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <BottomTabBar />
    </div>
  );
}
```

---

## Task 5: 首页

**Files:**
- Create: `frontend/src/app/(user)/home/page.tsx`
- Create: `frontend/src/components/home/search-bar.tsx`
- Create: `frontend/src/components/home/job-card.tsx`
- Create: `frontend/src/components/home/company-grid.tsx`

- [ ] **Step 1: 创建 components/home/job-card.tsx**

```tsx
import Link from 'next/link';
import { Icon } from '@/components/layout/icons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  salaryMin: number;
  salaryMax: number;
  city: string;
  department: string;
  matchScore?: number;
  className?: string;
}

export function JobCard({
  id,
  title,
  company,
  companyInitial,
  salaryMin,
  salaryMax,
  city,
  department,
  matchScore,
  className,
}: JobCardProps) {
  return (
    <Link href={`/match/${id}`} className="group block">
      <Card className={cn('p-6 hover:shadow-[0px_20px_50px_rgba(19,27,46,0.08)] transition-all duration-300 relative overflow-hidden', className)}>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="font-headline font-bold text-primary text-xl">{companyInitial}</span>
          </div>
          {matchScore && (
            <Badge variant="primary" className="flex items-center gap-1">
              <Icon name="bolt" className="text-sm" style={{ fontVariationSettings: "'FILL' 1" }} />
              {matchScore}% 匹配
            </Badge>
          )}
        </div>

        <h3 className="font-headline text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">{company}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/15">
          <span className="text-primary-container font-semibold">
            {salaryMin}k - {salaryMax}k
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">
            {city} · {department}
          </span>
        </div>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: 创建 components/home/search-bar.tsx**

```tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/layout/icons';
import { Button } from '@/components/ui/button';

const hotTags = ['Python开发', '数据分析', '产品经理'];

export function SearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/jobs?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col md:flex-row gap-4 items-center bg-surface-container-lowest p-2 rounded-xl shadow-[0px_20px_50px_rgba(19,27,46,0.06)] relative z-10 w-full max-w-2xl mx-auto border border-outline-variant/15">
      <div className="flex-1 flex items-center gap-3 px-4 w-full">
        <Icon name="search" className="text-primary" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入职位、公司或技能，例如 'AI算法工程师'..."
          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 font-body outline-none"
        />
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        智能搜索
        <Icon name="arrow_forward" className="text-sm" />
      </Button>
    </form>
  );
}

export function HotTags() {
  return (
    <div className="flex flex-wrap justify-center gap-3 pt-4">
      <span className="text-sm text-on-surface-variant mr-2">热门搜索:</span>
      {hotTags.map((tag) => (
        <button
          key={tag}
          onClick={() => window.location.href = `/jobs?keyword=${encodeURIComponent(tag)}`}
          className="text-sm px-3 py-1 bg-surface-container-highest text-primary rounded-full hover:bg-primary/10 transition-colors"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建 components/home/company-grid.tsx**

```tsx
import { Card } from '@/components/ui/card';

interface Company {
  id: string;
  name: string;
  initial: string;
  jobCount: number;
}

const companies: Company[] = [
  { id: '1', name: 'ByteDance', initial: 'B', jobCount: 1245 },
  { id: '2', name: 'Tencent', initial: 'T', jobCount: 892 },
  { id: '3', name: 'Alibaba', initial: 'A', jobCount: 956 },
  { id: '4', name: 'Meituan', initial: 'M', jobCount: 432 },
  { id: '5', name: 'NetEase', initial: 'N', jobCount: 321 },
];

export function CompanyGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-surface-container-highest transition-colors cursor-pointer group">
          <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow">
            <span className="font-headline font-bold text-xl text-on-surface">{company.initial}</span>
          </div>
          <h4 className="font-semibold text-on-surface">{company.name}</h4>
          <p className="text-xs text-primary mt-1 font-medium">{company.jobCount} 在招职位</p>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 创建 app/(user)/home/page.tsx**

```tsx
import { Icon } from '@/components/layout/icons';
import { JobCard } from '@/components/home/job-card';
import { SearchBar, HotTags } from '@/components/home/search-bar';
import { CompanyGrid } from '@/components/home/company-grid';

const recommendedJobs = [
  { id: '1', title: '高级前端工程师', company: 'TechVision 科技有限公司', companyInitial: 'T', salaryMin: 25, salaryMax: 40, city: '北京', department: '研发部', matchScore: 98 },
  { id: '2', title: '数据产品经理', company: 'DataMind 智库', companyInitial: 'D', salaryMin: 20, salaryMax: 35, city: '上海', department: '产品部', matchScore: 85 },
  { id: '3', title: 'AI 算法研究员', company: 'Alpha Labs', companyInitial: 'A', salaryMin: 30, salaryMax: 50, city: '深圳', department: '核心算法组', matchScore: 82 },
];

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-surface-container-low p-10 md:p-16 overflow-hidden isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-container/5 -z-10 mix-blend-multiply" />
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            智能匹配，预见你的<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">职业未来</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-label max-w-2xl mx-auto">
            基于深度学习技能图谱，为您精准推荐高匹配度职位。
          </p>
          <SearchBar />
          <HotTags />
        </div>
      </section>

      {/* Recommended Jobs */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface">为您推荐</h2>
            <p className="text-on-surface-variant font-label mt-1">基于您的技能图谱 AI 精准匹配</p>
          </div>
          <a href="/jobs" className="text-primary font-medium hover:text-primary-container transition-colors flex items-center gap-1 text-sm">
            查看全部 <Icon name="chevron_right" className="text-sm" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      </section>

      {/* Popular Companies */}
      <section className="space-y-6 pt-8">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">热门企业</h2>
          <p className="text-on-surface-variant font-label mt-1">发现最适合您的工作环境</p>
        </div>
        <CompanyGrid />
      </section>
    </main>
  );
}
```

---

## Task 6: 认证布局和登录页

**Files:**
- Create: `frontend/src/app/(auth)/layout.tsx`
- Create: `frontend/src/app/(auth)/login/page.tsx`
- Create: `frontend/src/components/auth/login-form.tsx`

- [ ] **Step 1: 创建 (auth) 布局**

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-surface">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 创建 lib/types/index.ts**

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  phone?: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}
```

- [ ] **Step 3: 创建 lib/api/client.ts**

```typescript
import axios from 'axios';
import { authStore } from '@/lib/stores/auth-store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7777',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 4: 创建 lib/stores/auth-store.ts**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';

interface AuthState extends AuthTokens {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (tokens, user) =>
        set({
          ...tokens,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

- [ ] **Step 5: 创建 lib/api/auth.ts**

```typescript
import apiClient from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};
```

- [ ] **Step 6: 创建 components/auth/login-form.tsx**

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/layout/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { authStore } from '@/lib/stores/auth-store';

const loginSchema = z.object({
  identifier: z.string().min(1, '请输入手机号或邮箱'),
  password: z.string().min(6, '密码至少6位'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);
      authStore.getState().setAuth(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.user
      );
      router.push('/home');
    } catch (error: any) {
      setError('identifier', { message: error.response?.data?.message || '登录失败' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">
          手机号 / 邮箱
        </label>
        <Input
          {...register('identifier')}
          placeholder="请输入手机号或邮箱"
          error={!!errors.identifier}
        />
        {errors.identifier && (
          <p className="text-error text-sm mt-1">{errors.identifier.message}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider">
            密码
          </label>
          <a href="/forgot-password" className="font-body text-sm text-primary hover:text-primary-container transition-colors">
            忘记密码？
          </a>
        </div>
        <div className="relative">
          <Input
            {...register('password')}
            type="password"
            placeholder="请输入密码"
            error={!!errors.password}
          />
        </div>
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest bg-surface-container-low"
        />
        <label htmlFor="remember" className="font-body text-sm text-on-surface-variant">
          30天内自动登录
        </label>
      </div>

      <Button type="submit" size="lg" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登 录'}
      </Button>

      <div className="mt-10 text-center">
        <p className="font-body text-on-surface-variant">
          还没有账号？
          <a href="/register" className="text-primary font-semibold hover:text-primary-container transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-surface-tint after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1 ml-1">
            立即注册
          </a>
        </p>
      </div>
    </form>
  );
}
```

- [ ] **Step 7: 创建 app/(auth)/login/page.tsx**

```tsx
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_20px_50px_rgba(19,27,46,0.06)] min-h-[600px]">
      {/* Left Panel - Brand */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-surface-container-low overflow-hidden">
        <div className="relative z-10">
          <div className="text-3xl font-headline font-black text-primary tracking-tight mb-6">GraphHire</div>
          <h1 className="font-headline text-display-sm font-bold text-on-surface leading-tight mb-4">
            The Digital Curator<br />for Modern Teams.
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-md">
            Connect with top talent through AI-driven skill matrices and editorial-grade insights.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 mt-12">
          <div className="bg-surface/70 backdrop-blur-xl p-4 rounded-xl border border-outline-variant/15 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="psychology" className="text-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
              <span className="font-headline font-semibold text-sm">AI Matching</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[85%] rounded-full" />
            </div>
          </div>
          <div className="bg-surface/70 backdrop-blur-xl p-4 rounded-xl border border-outline-variant/15 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="insights" className="text-secondary" style={{ fontVariationSettings: "'FILL' 1" }} />
              <span className="font-headline font-semibold text-sm">Skill Growth</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[62%] rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-colors-primary)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 z-0 pointer-events-none bg-gradient-to-t from-surface-container-low to-transparent" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-surface-container-lowest">
        <div className="lg:hidden mb-8">
          <div className="text-3xl font-headline font-black text-primary tracking-tight">GraphHire</div>
        </div>

        <div className="mb-10">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">欢迎回来</h2>
          <p className="font-body text-on-surface-variant">请登录您的账号以继续使用</p>
        </div>

        <div className="flex gap-6 mb-8 border-b border-outline-variant/20">
          <button className="pb-3 text-primary font-semibold border-b-2 border-primary relative top-[1px]">
            密码登录
          </button>
          <button className="pb-3 text-on-surface-variant hover:text-on-surface font-medium transition-colors">
            验证码登录
          </button>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
```

---

## Task 7: 注册页

**Files:**
- Create: `frontend/src/app/(auth)/register/page.tsx`
- Create: `frontend/src/components/auth/register-form.tsx`

- [ ] **Step 1: 创建 components/auth/register-form.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
  role: z.enum(['JOB_SEEKER', 'RECRUITER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'JOB_SEEKER' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authApi.register({ email: data.email, password: data.password, role: data.role });
      router.push('/login');
    } catch (error: any) {
      setError('email', { message: error.response?.data?.message || '注册失败' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">
          邮箱
        </label>
        <Input
          {...register('email')}
          type="email"
          placeholder="请输入邮箱"
          error={!!errors.email}
        />
        {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">
          密码
        </label>
        <Input
          {...register('password')}
          type="password"
          placeholder="请输入密码"
          error={!!errors.password}
        />
        {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">
          确认密码
        </label>
        <Input
          {...register('confirmPassword')}
          type="password"
          placeholder="请再次输入密码"
          error={!!errors.confirmPassword}
        />
        {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <label className="block font-label text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">
          角色选择
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRole('JOB_SEEKER')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              role === 'JOB_SEEKER'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="font-headline font-semibold">求职者</span>
            <p className="text-xs mt-1">寻找理想工作</p>
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              role === 'RECRUITER'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="font-headline font-semibold">招聘者</span>
            <p className="text-xs mt-1">招募优秀人才</p>
          </button>
        </div>
        <input type="hidden" {...register('role')} value={role} />
      </div>

      <Button type="submit" size="lg" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '立即注册'}
      </Button>

      <div className="mt-6 text-center">
        <p className="font-body text-on-surface-variant">
          已有账号？
          <a href="/login" className="text-primary font-semibold hover:text-primary-container transition-colors ml-1">
            立即登录
          </a>
        </p>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: 创建 app/(auth)/register/page.tsx**

```tsx
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_20px_50px_rgba(19,27,46,0.06)] min-h-[600px]">
      {/* Left Panel - Brand (Same as login) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-surface-container-low overflow-hidden">
        <div className="relative z-10">
          <div className="text-3xl font-headline font-black text-primary tracking-tight mb-6">GraphHire</div>
          <h1 className="font-headline text-display-sm font-bold text-on-surface leading-tight mb-4">
            Build Your Dream<br />Career Today.
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-md">
            Join thousands of professionals who found their perfect match through our AI-driven platform.
          </p>
        </div>

        <div className="relative z-10 mt-12">
          <div className="bg-surface/70 backdrop-blur-xl p-4 rounded-xl border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-headline font-semibold text-sm">已有</span>
              <span className="font-headline font-bold text-primary text-xl">10,000+</span>
              <span className="font-headline font-semibold text-sm">用户加入</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-colors-primary)_0%,_transparent_50%)]" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-surface-container-lowest">
        <div className="lg:hidden mb-8">
          <div className="text-3xl font-headline font-black text-primary tracking-tight">GraphHire</div>
        </div>

        <div className="mb-10">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">创建账号</h2>
          <p className="font-body text-on-surface-variant">开启您的招聘之旅</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
```

---

## Task 8: 验证并提交

**验证步骤：**
- [ ] 启动前端开发服务器 `npm run dev`
- [ ] 访问 `/home` 验证首页渲染正确
- [ ] 访问 `/login` 验证登录页渲染正确
- [ ] 访问 `/register` 验证注册页渲染正确
- [ ] 检查控制台无错误

- [ ] **Step 1: 提交代码**

```bash
cd frontend
git add -A
git commit -m "feat: Phase 1 完成 - 项目初始化、首页、登录/注册页

- 初始化 Next.js 16 + Tailwind CSS 4.2 + TypeScript 项目
- 实现设计系统（主题变量、基础 UI 组件）
- 实现用户端布局（TopNavBar + BottomTab）
- 实现首页（Hero 搜索、推荐职位、热门企业）
- 实现登录/注册页面
- 配置 Zustand Auth Store + Axios API 客户端
- API 契约定义完成（auth/login, auth/register）
"
```
