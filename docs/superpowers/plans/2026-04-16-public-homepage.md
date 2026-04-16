# 公开首页实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建公开首页，用户无需登录即可访问，展示平台核心价值和内容

**Architecture:** 通过 Next.js Route Groups 实现公开/受保护路由分离，middleware 调整路由保护逻辑，Header 组件支持未登录状态

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Ant Design, next-themes

---

## 文件清单

```
frontend/
├── app/
│   ├── page.tsx                              # 修改: redirect 到 /(public)
│   ├── (public)/                             # 新建: 公开路由组
│   │   ├── layout.tsx                        # 新建: 公开页 Layout
│   │   └── page.tsx                          # 新建: 公开首页
│   ├── (auth)/                               # 现有: 认证路由组
│   ├── (main)/                               # 现有: 受保护路由组
│   └── layout.tsx                            # 现有: Root Layout
├── components/shared/layout/
│   └── Header.tsx                            # 修改: 支持未登录状态
└── middleware.ts                              # 修改: 调整路由保护逻辑
```

---

## Task 1: 修改 app/page.tsx 根路径 redirect

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: 修改 page.tsx 为 redirect**

将当前直接 redirect to `/login` 改为 redirect to `/(public)`

```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/(public)');
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: redirect root to public homepage"
```

---

## Task 2: 新建 app/(public)/layout.tsx 公开页 Layout

**Files:**
- Create: `frontend/app/(public)/layout.tsx`

- [ ] **Step 1: 创建公开页 Layout**

```typescript
import { Header, Footer } from '@/components/shared/layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/(public)/layout.tsx
git commit -m "feat: add public route group layout"
```

---

## Task 3: 新建 app/(public)/page.tsx 公开首页

**Files:**
- Create: `frontend/app/(public)/page.tsx`

- [ ] **Step 1: 创建公开首页**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const hotJobs = [
  { id: 1, title: '前端开发工程师', company: '字节跳动', salary: '25-40K', location: '北京' },
  { id: 2, title: '后端开发工程师', company: '阿里巴巴', salary: '30-50K', location: '杭州' },
  { id: 3, title: '算法工程师', company: '腾讯', salary: '35-60K', location: '深圳' },
  { id: 4, title: '产品经理', company: '美团', salary: '20-35K', location: '北京' },
  { id: 5, title: 'UI设计师', company: '网易', salary: '18-30K', location: '杭州' },
  { id: 6, title: '数据分析师', company: '京东', salary: '20-35K', location: '北京' },
];

const hotCompanies = [
  { id: 1, name: '字节跳动', logo: '📦' },
  { id: 2, name: '阿里巴巴', logo: '🟠' },
  { id: 3, name: '腾讯', logo: '🐧' },
  { id: 4, name: '美团', logo: '🟡' },
  { id: 5, name: '网易', logo: '🎮' },
  { id: 6, name: '京东', logo: '🟢' },
];

export default function PublicHomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/login?redirect=/person/jobs&search=${encodeURIComponent(searchValue)}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">GraphHire 图谱智聘</h1>
          <p className="text-xl text-white/90 mb-8">基于 AI 能力图谱的智能招聘平台，让人才与职位精准匹配</p>
          <div className="flex gap-4 justify-center">
            <Button type="primary" size="large" onClick={() => router.push('/login')}>
              立即开始
            </Button>
            <Button size="large" ghost onClick={() => document.getElementById('hot-jobs')?.scrollIntoView({ behavior: 'smooth' })}>
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-6 -mt-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex gap-2">
            <Input
              size="large"
              placeholder="搜索职位、公司..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </div>
      </section>

      {/* Hot Jobs Section */}
      <section id="hot-jobs" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">热门职位</h2>
          <Row gutter={[16, 16]}>
            {hotJobs.map((job) => (
              <Col key={job.id} xs={24} sm={12} md={8}>
                <Card hoverable className="h-full" onClick={() => router.push('/login')}>
                  <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{job.company}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span className="text-primary font-medium">{job.salary}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Hot Companies Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">热门企业</h2>
          <Row gutter={[16, 16]}>
            {hotCompanies.map((company) => (
              <Col key={company.id} xs={12} sm={8} md={4}>
                <Card hoverable className="text-center" onClick={() => router.push('/login')}>
                  <div className="text-4xl mb-2">{company.logo}</div>
                  <p className="font-medium">{company.name}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/(public)/page.tsx
git commit -m "feat: add public homepage with hero, search, hot jobs and companies"
```

---

## Task 4: 修改 middleware.ts 调整路由保护逻辑

**Files:**
- Modify: `frontend/middleware.ts`

- [ ] **Step 1: 更新 middleware.ts**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由白名单
const publicPaths = [
  '/',
  '/(public)',
  '/login',
  '/admin/login',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // A 端路由保护
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // C 端路由保护（/person/* 和 /company/*）
  if (pathname.startsWith('/person') || pathname.startsWith('/company')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/person/:path*', '/company/:path*', '/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).)*'],
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/middleware.ts
git commit -m "fix: update middleware to allow public homepage access"
```

---

## Task 5: 修改 Header.tsx 支持未登录状态

**Files:**
- Modify: `frontend/components/shared/layout/Header.tsx`

- [ ] **Step 1: 更新 Header.tsx 支持未登录状态**

```typescript
'use client';

import { Dropdown, Badge, Avatar, Menu, Button } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const personNavItems = [
  { key: '/person/home', label: '首页' },
  { key: '/person/jobs', label: '职位推荐' },
  { key: '/person/graph', label: '能力图谱' },
  { key: '/person/resume', label: '简历管理' },
];

const companyNavItems = [
  { key: '/company/home', label: '首页' },
  { key: '/company/jobs', label: '职位管理' },
  { key: '/company/match', label: '候选人推荐' },
  { key: '/company/talent', label: '人才库' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, clearAuth } = useAuthStore();

  const isLoggedIn = !!role;
  const navItems = role === 'COMPANY' ? companyNavItems : personNavItems;
  const homePath = role === 'COMPANY' ? '/company/home' : '/person/home';

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">{role === 'COMPANY' ? '企业中心' : '个人中心'}</Menu.Item>
      <Menu.Item key="settings">设置</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center">
      <div className="flex items-center gap-8 flex-1">
        <a href="/" className="text-xl font-semibold text-primary">
          GraphHire
        </a>
        {isLoggedIn && (
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.key}
                className={`px-4 py-2 text-sm rounded-button transition-colors ${
                  pathname.startsWith(item.key)
                    ? 'text-primary bg-primary/5 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Badge count={3}>
              <a href="/notifications" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </a>
            </Badge>

            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar className="cursor-pointer bg-primary">U</Avatar>
            </Dropdown>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="text" onClick={() => router.push('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => router.push('/login')}>
              注册
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/shared/layout/Header.tsx
git commit -m "feat: add guest mode to Header with login/register buttons"
```

---

## Task 6: 验证前端运行状态

**Files:**
- None (verification only)

- [ ] **Step 1: 检查前端服务状态**

检查 8888 端口是否有服务运行：
```bash
netstat -ano | findstr :8888
```

- [ ] **Step 2: 使用浏览器访问 http://localhost:8888**

截图确认公开首页正常显示

- [ ] **Step 3: 确认未登录时访问 /person/home 被重定向到 /login**

---

## 依赖项确认

确保以下依赖已安装：
- `@tailwindcss/postcss`: `^4.2.2`
- `next-themes`: `^0.4.0`

如果缺失，执行：
```bash
cd frontend && npm install @tailwindcss/postcss next-themes
```

---

## Spec 覆盖率自检

| 设计文档章节 | 对应 Task |
|------------|-----------|
| 路由结构 | Task 1, 3 |
| Middleware 调整 | Task 4 |
| 公开首页设计 (Hero, Search, Hot Jobs, Hot Companies) | Task 3 |
| Header 未登录状态 | Task 5 |

所有设计内容已覆盖，无遗漏。
