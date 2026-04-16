# 原型图重构为 Next.js 页面 — 设计规格

**日期：** 2026-04-17
**状态：** 已批准
**范围：** 14 个前端页面完全重写

---

## 1. 技术决策

### 1.1 Tailwind 配置扩展

将现有简单配色替换为原型中的 Material Design 风格配色系统：

```typescript
colors: {
  primary: '#005bbf',
  'primary-container': '#1a73e8',
  'primary-fixed': '#d8e2ff',
  secondary: '#006972',
  'secondary-container': '#8feefc',
  tertiary: '#005ac0',
  'tertiary-container': '#2a73e1',
  background: '#f8f9fa',
  surface: '#f8f9fa',
  'surface-container': '#edeeef',
  'surface-container-low': '#f3f4f5',
  'surface-container-lowest': '#ffffff',
  'surface-container-high': '#e7e8e9',
  'surface-container-highest': '#e1e3e4',
  'surface-variant': '#e1e3e4',
  'surface-dim': '#d9dadb',
  'surface-bright': '#f8f9fa',
  'surface-tint': '#005bc0',
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
  error: '#ba1a1a',
  'error-container': '#ffdad6',
  'on-error': '#ffffff',
  'on-error-container': '#93000a',
  inverse: '#f0f1f2',
  'inverse-surface': '#2e3132',
  'inverse-on-surface': '#f0f1f2',
  'inverse-primary': '#adc7ff',
  'primary-fixed-dim': '#adc7ff',
  'secondary-fixed': '#92f1fe',
  'secondary-fixed-dim': '#75d5e2',
  'tertiary-fixed': '#d8e2ff',
  'tertiary-fixed-dim': '#adc6ff',
  'on-primary-fixed': '#001a41',
  'on-primary-fixed-variant': '#004493',
  'on-secondary-fixed': '#001f23',
  'on-secondary-fixed-variant': '#004f56',
  'on-tertiary-fixed': '#001a41',
  'on-tertiary-fixed-variant': '#004494',
}
```

### 1.2 字体系统

| 用途 | 字体 |
|-----|-----|
| 标题/品牌 | Manrope (700, 800) |
| 正文 | Inter (300-700) |
| 标签 | Inter (400-600) |

### 1.3 图标库

**Material Symbols Outlined** — 所有图标使用此库，不依赖 Ant Design 图标。

### 1.4 圆角规范

```typescript
borderRadius: {
  DEFAULT: '0.25rem',  // 4px - 小按钮、标签
  lg: '0.5rem',        // 8px - 输入框
  xl: '0.75rem',       // 12px - 卡片
  full: '9999px'       // 圆形头像、胶囊按钮
}
```

---

## 2. 页面路由映射

| # | 原型文件 | 页面名称 | 目标路由 | 布局类型 |
|---|---------|---------|---------|---------|
| 1 | 003-首页.html | 公开首页 | `(public)/page.tsx` | TopNav + Footer |
| 2 | 002-简历解析.html | 简历解析 | `(main)/person/resume/page.tsx` | TopNav + Footer |
| 3 | 004-能力图谱映射.html | 能力图谱 | `(main)/person/graph/page.tsx` | TopNav + SidePanel |
| 4 | 001-匹配详情.html | 匹配详情 | `(main)/person/jobs/[id]/page.tsx` | TopNav + Footer |
| 5 | 005-控制台.html | 企业控制台 | `(main)/company/home/page.tsx` | SideNav + TopBar |
| 6 | 006-职位管理.html | 职位管理 | `(main)/company/job/page.tsx` | SideNav + TopBar |
| 7 | 007-企业信息.html | 企业信息 | `(main)/company/profile/page.tsx` | SideNav + TopBar |
| 8 | 008-发布新职位.html | 发布新职位 | `(main)/company/job/create/page.tsx` | SideNav + TopBar |
| 9 | 009-推荐简历.html | 推荐简历 | `(main)/company/resume/page.tsx` | SideNav + TopBar |
| 10 | 010-仪表盘.html | 管理后台仪表盘 | `(admin)/dashboard/page.tsx` | SideNav + TopBar |
| 11 | 011-用户管理.html | 用户管理 | `(admin)/users/page.tsx` | SideNav + TopBar |
| 12 | 012-任务监控.html | 任务监控 | `(admin)/task/page.tsx` | SideNav + TopBar |
| 13 | 013-技能标签管理.html | 技能标签管理 | `(admin)/skill/page.tsx` | SideNav + TopBar |
| 14 | 014-企业审核.html | 企业审核 | `(admin)/company/page.tsx` | SideNav + TopBar |

---

## 3. 共享组件设计

### 3.1 布局组件

```
components/shared/layout/
├── PublicHeader.tsx       # 公开端顶部导航（玻璃效果）
├── PublicFooter.tsx       # 公开端页脚
├── SideNav.tsx            # 企业端/管理端通用侧边栏（可配置 active 状态）
├── TopBar.tsx             # 企业端/管理端顶部栏
├── GlassCard.tsx          # 玻璃拟态卡片
├── StatCard.tsx           # 统计数字卡片（Bento 风格）
└── index.ts
```

### 3.2 UI 组件（已存在，保持）

```
components/shared/ui/
├── Badge.tsx
├── Avatar.tsx
├── Tag.tsx
├── Button.tsx
├── Card.tsx
└── index.ts
```

### 3.3 布局类型定义

**TopNav + Footer（公开端/个人端）：**
- 固定顶部导航栏，高度 64px，背景 `bg-white/70 backdrop-blur-md`
- 页面内容 pt-16

**SideNav + TopBar（企业端/管理端）：**
- 固定左侧导航，宽度 256px (w-64)
- 固定顶部栏，高度 64px，ml-64
- 页面内容 ml-64 mt-16

---

## 4. 实现顺序

### 第一批（框架基础设施）
1. 更新 `tailwind.config.ts` 配色系统
2. 更新 `app/globals.css` 全局样式
3. 创建共享布局组件

### 第二批（公开端 + 个人端）
4. `(public)/page.tsx` — 首页
5. `(main)/person/resume/page.tsx` — 简历解析
6. `(main)/person/graph/page.tsx` — 能力图谱
7. `(main)/person/jobs/[id]/page.tsx` — 匹配详情

### 第三批（企业端）
8. `(main)/company/home/page.tsx` — 控制台
9. `(main)/company/job/page.tsx` — 职位管理
10. `(main)/company/profile/page.tsx` — 企业信息
11. `(main)/company/job/create/page.tsx` — 发布新职位
12. `(main)/company/resume/page.tsx` — 推荐简历

### 第四批（管理端）
13. `(admin)/dashboard/page.tsx` — 仪表盘
14. `(admin)/users/page.tsx` — 用户管理
15. `(admin)/task/page.tsx` — 任务监控
16. `(admin)/skill/page.tsx` — 技能标签管理
17. `(admin)/company/page.tsx` — 企业审核

---

## 5. 关键样式规范

### 5.1 玻璃效果
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

### 5.2 卡片悬浮动效
```css
transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5
```

### 5.3 渐变光晕
```html
<!-- 背景装饰 -->
<div class="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] bg-primary-fixed opacity-20 blur-[120px] rounded-full"></div>
```

### 5.4 雇主 Logo 灰度动画
```css
grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all
```

---

## 6. 依赖移除

- 移除 `@ant-design/pro-components` 的 ProLayout
- 移除所有 Ant Design 布局组件
- 统一使用 Tailwind CSS 手写布局

---

## 7. 验收标准

- [ ] 所有 14 个页面路由可访问
- [ ] Tailwind 配色系统与原型一致
- [ ] 侧边栏导航激活状态正确
- [ ] 玻璃效果、悬浮动效与原型一致
- [ ] 响应式布局在 md/lg 断点正常
- [ ] 无 Ant Design 布局依赖
