# 前端用户端全面重构设计规格

**日期：** 2026-04-20  
**状态：** 已批准  
**范围：** 仅用户端（求职者）10 个页面  

---

## 1. 背景与目标

基于用户提供的 10 份原型图（`stitch_graphhire/graphhire_1~10`）及配套设计系统文档（`nexus_intelligence/DESIGN.md`），对 GraphHire 前端用户端进行全面视觉重构。目标：完整还原"认知导视"设计风格，保留现有 API 集成逻辑，实现完整动效。

**技术栈：** Next.js 16 + TailwindCSS 3 + TypeScript（维持现有栈，不升级）

---

## 2. 设计系统规范

### 2.1 调色板 Token
| Token 名 | 值 | 用途 |
|---|---|---|
| `primary` | `#003DA6` | 关键交互、品牌 Logo |
| `primary-container` | `#0052D9` | 渐变终止色、活力蓝 |
| `surface` | `#F8F9FF` | 页面底层背景 |
| `surface-container-low` | `#EEF0FA` | 通栏内容块背景 |
| `surface-container-lowest` | `#FFFFFF` | 悬浮卡片背景 |
| `surface-container` | `#E4E6F4` | 分隔用色块 |
| `surface-container-high` | `#D9DCEF` | 次要按钮背景 |
| `surface-container-highest` | `#CDD0E9` | 最深层背景 |
| `primary-fixed` | `#D6E4FF` | AI 推荐标签背景 |
| `on-primary-fixed` | `#003DA6` | AI 推荐标签文字 |
| `on-surface` | `#1A1C27` | 主要正文 |
| `on-surface-variant` | `#44475A` | 次要文字 |
| `outline-variant` | `#C4C6D8` | 极弱分割（透明度 15%）|
| `tertiary` | `#394851` | 图谱连线、次要图形 |
| `surface-variant` | `#E1E3F5` | 技能标签背景 |
| `on-surface-variant` | `#44475A` | 技能标签文字（同 on-surface-variant）|
| `secondary-fixed` | `#E3F4FF` | 次要 AI 标签背景 |

### 2.2 字体
- **Display/Headline/Title：** Manrope（Google Fonts）
- **Body：** Inter
- **中文回退：** `Inter, "PingFang SC", "Microsoft YaHei", sans-serif`
- **行高：** Body 统一 1.6~1.8

### 2.3 设计规则
- **禁止分割线：** 区域分隔通过背景色阶梯切换实现，绝不用 1px 实线
- **圆角：** 卡片用 `xl`(1.5rem) 或 `lg`(1rem)，标签用 `full`(9999px)，按钮用 `md`(0.75rem)，禁止直角
- **阴影：** 仅 hover 状态使用 `0 12px 32px -4px rgba(14,28,44,0.06)`，禁止纯黑阴影
- **主按钮：** 渐变背景 `primary→primary-container`（135°），白色文字

---

## 3. 路由映射

| 原型文件 | 页面名 | 路由路径 |
|---|---|---|
| graphhire_1 | 登录 | `/login` → `(auth)/login/page.tsx` |
| graphhire_3 | 注册 | `/register` → `(auth)/register/page.tsx` |
| graphhire_2 | 首页 | `/home` → `(user)/home/page.tsx` |
| graphhire_7 | 职位列表 | `/jobs` → `(user)/jobs/page.tsx` |
| graphhire_4 | 简历管理 | `/resume/manage` → `(user)/resume/manage/page.tsx` |
| graphhire_5 | 上传简历 | `/resume/upload` → `(user)/resume/upload/page.tsx` |
| graphhire_6 | 个人资料 | `/profile` → `(user)/profile/page.tsx` |
| graphhire_8 | 能力图谱 | `/skill-graph` → `(user)/skill-graph/page.tsx` |
| graphhire_9 | 匹配详情 | `/match/[id]` → `(user)/match/[id]/page.tsx` |
| graphhire_10 | 通知中心 | `/notifications` → `(user)/notifications/page.tsx` |

---

## 4. 共享组件规范

### 4.1 Button
- **Primary：** 渐变背景（`primary→primary-container`），圆角 `md`，白色文字，hover 增亮
- **Secondary：** `surface-container-high` 背景，`primary` 文字，无边框
- **文件：** `src/components/ui/button.tsx`（替换现有）

### 4.2 Card
- 背景 `surface-container-lowest`，圆角 `xl`，hover 环境阴影
- 内部可嵌入径向渐变背景（节点发光感）
- 文件：`src/components/ui/card.tsx`（替换现有）

### 4.3 Chip / Badge
- 技能标签：`surface-variant` 背景，`on-surface-variant` 文字，`full` 圆角
- AI 推荐标签：`primary-fixed` 背景，`on-primary-fixed` 文字
- 文件：`src/components/ui/chip.tsx`（新建）、`badge.tsx`（替换）

### 4.4 MatchScore（环形进度条）
- SVG `stroke-dashoffset` 动画，进入视口时触发（IntersectionObserver）
- 渐变笔触色：`primary→primary-container`
- 文件：`src/components/ui/match-score.tsx`（新建）

### 4.5 Input
- `surface-container-lowest` 背景，圆角 `sm`，focus 时底部 2px `primary` 科技线条
- 文件：`src/components/ui/input.tsx`（替换现有）

### 4.6 TopNavbar / UserLayout
- 最大宽度 1440px，`surface` 背景，backdrop-blur，无下边框（用微弱 inset shadow）
- 文件：`src/components/layout/top-navbar.tsx`、`(user)/layout.tsx`

---

## 5. 页面实现要点

### 5.1 登录（graphhire_1）
- 左侧品牌图形区（渐变背景 + 图谱装饰），右侧表单区
- 保留现有 auth login API 调用
- Input 组件替换为新设计

### 5.2 注册（graphhire_3）
- 分步或单页表单，同登录风格
- 保留现有 auth register API 调用

### 5.3 首页（graphhire_2）
- Hero 区：全宽搜索栏（`surface-container-lowest` 圆角卡片），顶部右侧径向渐变光晕
- 主体：左 65% 职位卡片列表 + 右 35% AI 推荐侧栏
- 职位卡片含 MatchScore 环形分值
- 保留 jobs/recommendations API

### 5.4 职位列表（graphhire_7）
- 顶部筛选条（Chip 组，`surface-container-low` 背景区）
- 职位卡片：公司 Logo + 职位名 + 薪资 + 技能 Chip + MatchScore 环
- 右侧 AI 分析维度面板（35%）
- 保留 jobs list API

### 5.5 简历管理（graphhire_4）
- 简历文件卡片网格，状态 Badge（解析中/已完成/失败）
- 保留 resume list/delete API

### 5.6 上传简历（graphhire_5）
- 拖拽上传区（虚线边框动画，hover 发光效果）
- 上传进度条动画
- 保留 upload API

### 5.7 个人资料（graphhire_6）
- 头像上传区，个人信息编辑表单
- 技能 Chip 组可增删
- 保留 profile get/update API

### 5.8 能力图谱（graphhire_8）
- SVG force-directed layout（纯 SVG + requestAnimationFrame，不引入额外依赖）
- 节点点击弹出技能详情侧边栏
- 保留 skill-graph API

### 5.9 匹配详情（graphhire_9）
- 顶部大号 MatchScore（3.5rem display 字号）
- 维度分析：水平条形图（CSS width 动画）
- 左 65% 岗位描述，右 35% AI 分析
- 保留 match detail API

### 5.10 通知中心（graphhire_10）
- 通知列表，已读/未读状态（背景色区分）
- 类型 Badge（系统/匹配/招聘方）
- 保留 notifications API

---

## 6. 文件操作

- 原型图复制：`C:/Users/x/Downloads/stitch_graphhire/` → `docs/前端原型图/`
- 设计 token 配置：`frontend/tailwind.config.ts`（扩展 colors/fontFamily/borderRadius/boxShadow）
- 全局样式：`frontend/src/styles/globals.css`（CSS 变量 + 字体引入）

---

## 7. 不在范围内

- 企业端（`company/*`）页面：**不动**
- 管理员端（`admin/*`）页面：**不动**
- 后端 API、数据库、zustand store 结构：**不动**
- React Query hooks 内部逻辑：**不动**

---

## 8. 完成标准

1. 10 个页面全部在浏览器中正常渲染，无 console error
2. MatchScore 环形动画在进入视口时正确触发
3. 能力图谱 SVG 节点可交互
4. 所有有 API 的页面保持数据正常加载
5. Tailwind 自定义 token 全部生效，无 class 缺失警告
