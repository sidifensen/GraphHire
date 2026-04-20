# 前端用户端全面重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于"认知导视"设计风格重构 GraphHire 前端用户端 10 个页面，完整还原设计规范，保留现有 API 集成逻辑

**Architecture:** 以设计系统 token 为核心，修改 tailwind.config.ts 全局配置，更新共享组件样式，按页面逐一重构。共享组件先行，页面组件后行，避免重复修改。

**Tech Stack:** Next.js 16 + TailwindCSS 3 + TypeScript

---

## 文件操作总览

### 设计系统配置
- 修改: `frontend/tailwind.config.ts` — 更新 colors.primary 为 `#003DA6`，补充缺失 color token，调整 borderRadius 映射
- 修改: `frontend/src/styles/globals.css` — 引入 Google Fonts (Manrope + Inter)

### 共享组件
- 修改: `frontend/src/components/ui/button.tsx` — 圆角 0.75rem (md)，主按钮渐变背景，hover 阴影
- 修改: `frontend/src/components/ui/card.tsx` — 圆角 ≥ 1rem (xl)，hover 环境阴影
- 修改: `frontend/src/components/ui/input.tsx` — focus 底部 2px primary 线条
- 修改: `frontend/src/components/ui/badge.tsx` — Chip 圆角 full
- 创建: `frontend/src/components/ui/match-score.tsx` — SVG 环形进度条，渐变笔触，IntersectionObserver 动画

### Layout 组件
- 修改: `frontend/src/components/layout/top-navbar.tsx` — 最大宽度 1440px，无下边框，inset shadow

### 页面组件
- 修改: `frontend/src/app/(auth)/login/page.tsx` — 左右两栏布局，左侧品牌区渐变
- 修改: `frontend/src/app/(auth)/register/page.tsx` — 与登录页风格一致
- 修改: `frontend/src/app/(user)/home/page.tsx` — Hero 区搜索栏，65/35 两栏，径向渐变光晕
- 修改: `frontend/src/app/(user)/jobs/page.tsx` — 筛选 Chip 区，职位卡片含 MatchScore
- 修改: `frontend/src/app/(user)/resume/manage/page.tsx` — 简历卡片列表，状态 Badge
- 修改: `frontend/src/app/(user)/resume/upload/page.tsx` — 拖拽上传区，hover 发光，进度条动画
- 修改: `frontend/src/app/(user)/profile/page.tsx` — 头像上传，技能 Chip 增删
- 修改: `frontend/src/app/(user)/skill-graph/page.tsx` — SVG force-directed layout，节点交互
- 修改: `frontend/src/app/(user)/match/[id]/page.tsx` — 大号 MatchScore，条形图动画，65/35 布局
- 修改: `frontend/src/app/(user)/notifications/page.tsx` — 通知列表，已读/未读背景区分，类型 Badge

---

## Task 1: 设计系统基础配置

### 设计系统 token 更新

**Files:**
- Modify: `frontend/tailwind.config.ts:1-76`
- Modify: `frontend/src/styles/globals.css:1-79`

- [ ] **Step 1: 更新 tailwind.config.ts primary 颜色**

```typescript
// frontend/tailwind.config.ts
// 将 primary: '#004ac6' 改为 '#003DA6'
// 将 'primary-container': '#2563eb' 改为 '#0052D9'
colors: {
  primary: '#003DA6',
  'primary-container': '#0052D9',
  // ... 其余颜色保持
}
```

- [ ] **Step 2: 更新 borderRadius 配置**

```typescript
borderRadius: {
  'DEFAULT': '0.125rem',
  'lg': '0.5rem',    // 原 0.25rem
  'xl': '1rem',      // 原 0.5rem
  '2xl': '1.5rem',   // 原 1rem
  '3xl': '2rem',     // 原 1.5rem
},
```

- [ ] **Step 3: 在 globals.css 添加 Google Fonts**

```css
/* frontend/src/styles/globals.css 文件开头添加 */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: 添加 boxShadow 配置到 tailwind.config.ts**

```typescript
boxShadow: {
  'card-hover': '0 12px 32px -4px rgba(14,28,44,0.06)',
},
```

- [ ] **Step 5: 验证配置**

Run: `cd frontend && npm run dev`
Expected: 浏览器控制台无 color token 警告

---

## Task 2: 共享组件重构

### Button 组件

**Files:**
- Modify: `frontend/src/components/ui/button.tsx:1-43`

- [ ] **Step 1: 更新 Button 圆角为 0.75rem (md)**

```typescript
// 将 rounded-xl 改为 rounded-[0.75rem]
const baseStyles = 'inline-flex items-center justify-center gap-2 font-headline font-semibold rounded-[0.75rem] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
```

- [ ] **Step 2: 更新主按钮渐变和阴影**

```typescript
const variants = {
  primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0px_4px_12px_rgba(0,61,166,0.25)] hover:shadow-[0px_12px_32px_-4px_rgba(14,28,44,0.06)] hover:-translate-y-0.5',
  // secondary, outline, ghost 保持
};
```

### Card 组件

**Files:**
- Modify: `frontend/src/components/ui/card.tsx:1-24`

- [ ] **Step 1: 更新 Card 圆角和阴影**

```typescript
// elevated: 圆角 xl (1rem)，hover 阴影使用 boxShadow
elevated: 'bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(19,27,46,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] border border-outline-variant/15',
flat: 'bg-surface-container-low rounded-xl',
outlined: 'bg-surface-container-lowest rounded-xl border border-outline-variant/15',
```

### Input 组件

**Files:**
- Modify: `frontend/src/components/ui/input.tsx:1-28`

- [ ] **Step 1: 更新 Input focus 样式（底部 2px primary 线条）**

```typescript
// 修改 focus 样式：去除 focus:ring-0，保留 border-b-2 primary
className={cn(
  'w-full bg-surface-container-lowest text-on-surface placeholder:text-outline border-0 border-b-2 border-transparent focus:border-b-2 focus:border-primary transition-all rounded-none px-4 py-3 font-body text-base outline-none',
  error && 'border-error focus:border-error',
  className
)}
```

### Badge 组件

**Files:**
- Modify: `frontend/src/components/ui/badge.tsx`（先检查现有实现）

- [ ] **Step 1: 如 badge.tsx 存在，更新 Chip 圆角为 full (9999px)**

如果 badge.tsx 不存在，需要创建 chip.tsx：
- 创建: `frontend/src/components/ui/chip.tsx`

```typescript
// frontend/src/components/ui/chip.tsx
'use client';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'skill' | 'ai' | 'status';
}

function Chip({ className, variant = 'skill', children, ...props }: ChipProps) {
  const variants = {
    skill: 'bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs font-medium',
    ai: 'bg-primary-fixed text-on-primary-fixed rounded-full px-3 py-1 text-xs font-medium',
    status: 'rounded-full px-3 py-1 text-xs font-medium',
  };
  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export { Chip };
```

### MatchScore 环形进度条组件

**Files:**
- Create: `frontend/src/components/ui/match-score.tsx`

- [ ] **Step 1: 创建 MatchScore SVG 组件**

```typescript
// frontend/src/components/ui/match-score.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface MatchScoreProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MatchScore({ score, size = 80, strokeWidth = 6, className = '' }: MatchScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, score]);

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div ref={ref} className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="matchScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003DA6" />
            <stop offset="100%" stopColor="#0052D9" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e4e6f4"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#matchScoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        />
        {/* Score text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-headline font-bold"
          style={{ fontSize: size * 0.25, fill: '#003DA6' }}
        >
          {animatedScore}%
        </text>
      </svg>
    </div>
  );
}
```

---

## Task 3: TopNavbar 布局组件

**Files:**
- Modify: `frontend/src/components/layout/top-navbar.tsx`

- [ ] **Step 1: 更新 TopNavbar 样式（最大宽度 1440px，无下边框，inset shadow）**

```typescript
// 找到 nav 元素，修改样式
<nav className="sticky top-0 z-50 bg-surface backdrop-blur-xl shadow-[inset_0_-1px_0_0_rgba(196,198,216,0.15)]">
  <div className="max-w-[1440px] mx-auto ...">
```

---

## Task 4: 登录页 / 注册页

### 登录页 graphhire_1

**Files:**
- Modify: `frontend/src/app/(auth)/login/page.tsx:1-68`

- [ ] **Step 1: 确保左右两栏布局，添加左侧品牌区渐变背景**

现有登录页已大致符合，但需要调整：
- 确认左侧品牌区有渐变背景
- 检查主按钮样式是否符合新设计

### 注册页 graphhire_3

**Files:**
- Modify: `frontend/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: 检查注册页是否存在，如存在则调整样式与登录页一致**

---

## Task 5: 首页 graphhire_2

**Files:**
- Modify: `frontend/src/app/(user)/home/page.tsx:1-84`

- [ ] **Step 1: 检查 Hero 区搜索栏样式，添加径向渐变光晕装饰**

```tsx
{/* 在 Hero section 中添加径向渐变光晕 */}
<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
```

- [ ] **Step 2: 检查主按钮和卡片样式**

- [ ] **Step 3: 确保职位卡片包含 MatchScore 组件**

---

## Task 6: 职位列表 graphhire_7

**Files:**
- Modify: `frontend/src/app/(user)/jobs/page.tsx:1-256`

- [ ] **Step 1: 检查筛选 Chip 区样式（背景 #EEF0FA）**

- [ ] **Step 2: 检查职位卡片是否包含 MatchScore**

- [ ] **Step 3: 如有 AI 分析维度面板，检查右侧面板样式**

---

## Task 7: 简历管理 graphhire_4

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx:1-249`

- [ ] **Step 1: 检查简历卡片状态 Badge 颜色区分（蓝色系=完成，红色系=失败）**

---

## Task 8: 上传简历 graphhire_5

**Files:**
- Modify: `frontend/src/app/(user)/resume/upload/page.tsx:1-203`

- [ ] **Step 1: 检查拖拽区域虚线边框样式**

- [ ] **Step 2: 检查 hover 时发光效果**

- [ ] **Step 3: 检查上传进度条动画**

---

## Task 9: 个人资料 graphhire_6

**Files:**
- Modify: `frontend/src/app/(user)/profile/page.tsx:1-338`

- [ ] **Step 1: 检查头像上传区可触发文件选择**

- [ ] **Step 2: 检查技能 Chip 删除功能**

---

## Task 10: 能力图谱 graphhire_8

**Files:**
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx:1-270`

- [ ] **Step 1: 检查 SVG 节点图渲染**

- [ ] **Step 2: 检查点击节点弹出详情侧边栏**

- [ ] **Step 3: 检查 force simulation 动态布局**

---

## Task 11: 匹配详情 graphhire_9

**Files:**
- Modify: `frontend/src/app/(user)/match/[id]/page.tsx:1-487`

- [ ] **Step 1: 检查顶部 MatchScore 分值数字字号 ≥ 48px**

```tsx
// 查找并更新 MatchScore 显示
<span className="font-headline text-[3rem] font-extrabold text-primary">
  {matchResult?.overall ?? mockMatchScore}%
</span>
```

- [ ] **Step 2: 检查条形图入场动画**

- [ ] **Step 3: 检查 65/35 两栏布局**

---

## Task 12: 通知中心 graphhire_10

**Files:**
- Modify: `frontend/src/app/(user)/notifications/page.tsx:1-371`

- [ ] **Step 1: 检查已读/未读通知背景色不同**

- [ ] **Step 2: 检查通知类型 Badge（系统/匹配/招聘方）**

---

## Task 13: 验收验证

- [ ] **Step 1: 运行前端开发服务器**

Run: `cd frontend && npm run dev`

- [ ] **Step 2: 逐一访问 10 个页面，检查 console error**

- [ ] **Step 3: 验证 MatchScore 动画在进入视口时触发**

- [ ] **Step 4: 验证 Tailwind 自定义 token 全部生效，无 class 缺失警告**

---

## 验收标准映射

| AC ID | 描述 | 对应 Task |
|-------|------|----------|
| AC-001 | primary 颜色 token | Task 1 |
| AC-002 | surface-* 颜色梯度 | Task 1 |
| AC-003 | Manrope/Inter 字体 | Task 1 |
| AC-004 | Google Fonts 引入 | Task 1 |
| AC-005 | 无 1px 实线分割线 | 各页面 Task |
| AC-006 ~ AC-015 | 共享组件样式 | Task 2, 3 |
| AC-016 ~ AC-018 | 登录页 | Task 4 |
| AC-019 ~ AC-020 | 注册页 | Task 4 |
| AC-021 ~ AC-024 | 首页 | Task 5 |
| AC-025 ~ AC-027 | 职位列表 | Task 6 |
| AC-028 ~ AC-030 | 简历管理 | Task 7 |
| AC-031 ~ AC-033 | 上传简历 | Task 8 |
| AC-034 ~ AC-036 | 个人资料 | Task 9 |
| AC-037 ~ AC-039 | 能力图谱 | Task 10 |
| AC-040 ~ AC-042 | 匹配详情 | Task 11 |
| AC-043 ~ AC-045 | 通知中心 | Task 12 |
| AC-046 ~ AC-048 | 原型图归档与整体质量 | Task 13 |
