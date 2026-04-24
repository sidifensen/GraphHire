# 用户端职位页面设计规范（Job Page）

## 1. Visual Theme & Atmosphere

**设计哲学：** 智性克制、去噪显真。通过精密的留白、克制的色彩和克制的动效传达 AI 图谱的专业感。

**氛围关键词：** 科技蓝、精密感、呼吸感、无界、智能

**定调：** 科技感不是炫技，而是让每个元素都精确到位，用最少的视觉噪音传达最清晰的认知意图。

---

## 2. Color Palette & Roles

继承自 [用户端 DESIGN.md](../前端原型图/用户端/DESIGN.md) 核心调色板：

```css
:root {
  /* 核心调色板 */
  --color-primary: #003DA6;
  --color-primary-container: #0052D9;
  --color-surface: #F8F9FF;
  --color-surface-container-low: #F1F3FF;
  --color-surface-container-lowest: #FFFFFF;
  --color-surface-variant: #E8EAFF;
  --color-on-surface: #1A1D21;
  --color-on-surface-variant: #6F787A;
  --color-tertiary: #394851;

  /* RGB 辅助值（便于 rgba 使用）*/
  --color-primary-rgb: 0, 61, 166;
  --color-surface-rgb: 248, 249, 255;
  --color-on-surface-rgb: 26, 29, 33;
}
```

---

## 3. Typography Rules

**字体：** Manrope（英文/数字） + Noto Sans SC（中文）

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
```

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| headline-lg | 2rem | 700 | 1.2 | 页面标题 |
| title-lg | 1.5rem | 600 | 1.3 | 卡片职位名 |
| title-md | 1.25rem | 600 | 1.4 | 公司名称 |
| body-lg | 1rem | 400 | 1.6 | 正文 |
| body-sm | 0.875rem | 400 | 1.5 | 辅助信息 |
| label-lg | 0.875rem | 500 | 1.4 | 标签文字 |

**中文字体回退：** `Noto Sans SC, "PingFang SC", "Microsoft YaHei", sans-serif`

---

## 4. Component Stylings

### 4.1 搜索区域 (Search Section)

**容器：** `surface-container-low` 背景，`xl` 圆角 (1.5rem)，`p-8`，右侧光晕装饰

```
┌─────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░ 渐变光晕（右上角，opacity 15%）░░░░░░░░░░░░░░░░░░  │
│                                                                 │
│    探索智能匹配职位                                              │
│    [ 搜索框 ──────────────────────── ] [城市] [搜索按钮]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**搜索框：**
- 背景：`surface-container-lowest`（纯白）
- 圆角：`lg` (1rem)
- 左侧图标：Material Symbols `search_insights`，`tertiary` 色
- Focus：底部 2px `primary` 色线条（不用粗边框）
- 内边距：`pl-12 pr-4 py-4`
- 字号：18px

**搜索按钮：**
- 渐变背景：`linear-gradient(135deg, var(--color-primary), var(--color-primary-container))`
- 圆角：`lg` (1rem)
- 内边距：`px-8 py-4`
- Hover：`opacity-90`，微上浮 `translateY(-1px)`

### 4.2 职位卡片 (Job Card)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [左侧蓝色指示条 - hover 显示]                                         │
│                                                                        │
│  资深前端工程师                                    💰 35-60K · 13薪    │
│  字节跳动                                              北京·朝阳       │
│                                                                        │
│  [React] [TypeScript] [Node.js] [GraphQL]                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**默认态：**
- 背景：`surface-container-lowest`（纯白）
- 圆角：`xl` (1.5rem)
- 内边距：`p-8`
- 底部间距：`mb-6`

**Hover 态：**
- `translateY(-4px)` 上浮
- 阴影：`0 20px 40px -8px rgba(var(--color-primary-rgb), 0.12)`
- 左侧出现 `4px primary` 色竖条
- 过渡：`all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**Focus 态：**
- `outline: 2px solid var(--color-primary)`
- `outline-offset: 2px`

**技能标签：**
- 背景：`surface-variant`
- 文字：`on-surface-variant`
- 圆角：`full` (9999px)
- 内边距：`px-3 py-1`
- 字号：`label-lg`
- Hover：背景变为 `primary`，文字变为 `on-primary`，`scale(1.05)`

---

## 5. Layout Principles

**最大宽度：** `max-w-[1200px]`，水平居中

**网格系统：** 单列卡片流，`gap-6`

**间距梯度：**
- 页面边距：`px-6 py-4`
- Section 间距：`mb-12`
- 卡片间距：`mb-6`

**响应式策略：**
- Desktop (≥1024px)：全宽度搜索栏
- Tablet (768-1023px)：搜索栏保持全宽
- Mobile (<768px)：搜索栏垂直堆叠，卡片全宽

---

## 6. Depth & Elevation

**阴影体系：**
```css
/* 卡片默认 */
--shadow-card: 0 2px 8px -2px rgba(var(--color-on-surface-rgb), 0.06);

/* 卡片悬浮（科技蓝倾向） */
--shadow-card-hover: 0 20px 40px -8px rgba(var(--color-primary-rgb), 0.12);

/* 输入框默认 */
--shadow-input: 0 2px 8px -2px rgba(var(--color-on-surface-rgb), 0.04);
```

---

## 7. Animation & Interaction

**交互档位：L2（流畅交互）**

### 入场动画 (Page Load)
```css
.search-section {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片依次入场，stagger 80ms */
.job-card:nth-child(1) { animation-delay: 0.1s; }
.job-card:nth-child(2) { animation-delay: 0.18s; }
.job-card:nth-child(3) { animation-delay: 0.26s; }
```

### 滚动触发 (Scroll Reveal)
```css
.job-card {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.job-card.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 悬停效果 (Hover)
```css
.job-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* 左侧蓝色指示条 */
.job-card::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 4px; height: 60%;
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-container));
  border-radius: 0 4px 4px 0;
  transition: transform 0.3s ease-out;
}
.job-card:hover::before {
  transform: translateY(-50%) scaleY(1);
}
```

### 技能标签动画
```css
.skill-tag {
  transition: all 0.2s ease;
}
.skill-tag:hover {
  background: var(--color-primary) !important;
  color: var(--color-on-primary) !important;
  transform: scale(1.05);
}
```

### 减少动效降级
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Do's and Don'ts

### ✅ 执行
1. **去线化分割**：卡片之间用间距（`gap-6`）而非分割线
2. **表面层级**：搜索区用 `surface-container-low`，卡片用 `surface-container-lowest`
3. **色彩克制**：主色仅用于关键元素：职位标题、薪资、hover 指示条
4. **渐变点缀**：搜索按钮使用 `135deg` 渐变
5. **充足留白**：卡片内边距 `p-8`，元素间距 `mb-6`
6. **动效反馈**：hover 上浮 + 左侧蓝色指示条 + 技能标签变色

### ❌ 避免
1. **禁止 1px 实线边框**进行分割
2. **禁止直角**：所有卡片、按钮、输入框必须 `≥ 1rem` 圆角
3. **禁止全页渐变背景**：渐变仅用于局部装饰
4. **禁止过度动画**：L2 档位，滚动动画必须 `IntersectionObserver` 控制
5. **禁止单调卡片**：hover 必须有视觉变化

---

## 9. Responsive Behavior

| 断点 | 搜索栏布局 | 卡片布局 |
|------|------------|----------|
| Mobile <640px | 全宽垂直堆叠 | 全宽，`p-6` |
| Tablet 640-1023px | 两列 | 单列，`p-7` |
| Desktop ≥1024px | 三列 | 单列，`p-8` |

**触摸目标：** 所有可点击元素 `min-height: 44px`

---

## 签名动效清单（L2 档位）

| 类别 | 动效 | 实现方式 |
|------|------|----------|
| Hero H1 | 搜索区 fadeInUp | CSS animation + stagger |
| Section | 职位卡片滚动淡入 | IntersectionObserver |
| 元素级 | 卡片 hover 上浮 + 蓝色指示条 | CSS transform + pseudo-element |
| 标签 | 技能标签 hover 缩放 | CSS transition |
