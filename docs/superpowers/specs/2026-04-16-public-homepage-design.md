# 公开首页设计文档

**日期**: 2026-04-16
**状态**: 已批准

---

## 1. 背景与目标

GraphHire 前端目前存在"一进就登录"的问题，用户首次访问时无法看到平台内容，降低了用户体验和转化率。

**目标**：创建一个公开的首页，用户无需登录即可访问，展示平台核心价值和内容，同时保留用户端/企业端的路由保护。

---

## 2. 路由结构

### 2.1 路由分组

| 路由组 | 路径 | 保护状态 | 说明 |
|--------|------|----------|------|
| `(public)` | `/` | 无需登录 | 公开首页 |
| `(auth)` | `/login`, `/admin/login` | 无需登录 | 认证页 |
| `(main)` | `/person/*`, `/company/*` | 需要登录 | 受保护用户/企业端 |
| `(admin)` | `/admin/*` | 需要 admin_token | 管理后台 |

### 2.2 文件结构

```
app/
├── page.tsx                          # Redirect to /(public)
├── (public)/                         # 新建：公开路由组
│   ├── layout.tsx                    # 公开页 Layout
│   └── page.tsx                      # 公开首页
├── (auth)/                           # 现有：认证路由组
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── admin-login/page.tsx
├── (main)/                           # 现有：受保护路由组
│   ├── layout.tsx
│   ├── person/
│   └── company/
├── (admin)/                          # 现有：管理后台
│   └── ...
└── layout.tsx                        # Root Layout
```

---

## 3. Middleware 调整

### 3.1 公开路由白名单

```typescript
const publicPaths = ['/', '/login', '/admin/login', '/api/health'];
```

### 3.2 路由保护逻辑

```typescript
// 公开路由直接放行
if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
  return NextResponse.next();
}

// /person/* 需要登录（/person/home 也需要）
if (pathname.startsWith('/person/')) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
}

// /company/* 需要登录（/company/home 也需要）
if (pathname.startsWith('/company/')) {
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
}

// /admin/* 需要 admin_token
if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) {
  const adminToken = request.cookies.get('admin_token')?.value;
  if (!adminToken) return NextResponse.redirect(new URL('/admin/login', request.url));
}
```

---

## 4. 公开首页设计

### 4.1 页面结构

```
公开首页
├── Hero Section（平台介绍）
│   ├── 标题：GraphHire 图谱智聘
│   ├── 副标题：基于 AI 能力图谱的智能招聘平台
│   └── CTA 按钮：立即开始 / 了解更多
├── Search Section（搜索框）
│   ├── 职位搜索输入框
│   └── 搜索按钮
├── Hot Jobs Section（热门职位）
│   ├── 标题：热门职位
│   └── 职位卡片列表（6-8个）
├── Hot Companies Section（热门企业）
│   ├── 标题：知名企业
│   └── 企业 Logo + 名称列表
└── Footer（页脚）
    ├── 平台介绍
    └── 链接
```

### 4.2 Header 状态

**未登录时**：
```
[GraphHire Logo]              [登录] [注册]
```

**登录后**：
```
[GraphHire Logo]  [首页] [职位推荐] [能力图谱] [简历管理]    [通知] [头像]
```

---

## 5. 实现计划

### 5.1 文件改动清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `app/page.tsx` | 改为 redirect 到 `/(public)` |
| 新建 | `app/(public)/page.tsx` | 公开首页 |
| 新建 | `app/(public)/layout.tsx` | 公开页 Layout |
| 修改 | `middleware.ts` | 调整路由保护逻辑 |
| 修改 | `components/shared/layout/Header.tsx` | 支持未登录状态 |

### 5.2 依赖项

- `next-themes` — 主题支持（已安装）
- `@tailwindcss/postcss` — Tailwind v4 支持（已安装）

---

## 6. 风险与注意事项

1. **热更新**：Next.js 15 + Tailwind v4 配置需确认 `@tailwindcss/postcss` 正确加载
2. **API 调用**：首页中需要调用的 API（如热门职位列表）应支持未登录访问
3. **Cookie 命名**：`/person/*` 和 `/company/*` 统一使用 `token` cookie
