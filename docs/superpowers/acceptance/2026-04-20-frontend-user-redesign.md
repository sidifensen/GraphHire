# Acceptance Criteria: 前端用户端全面重构

**Spec:** `docs/superpowers/specs/2026-04-20-frontend-user-redesign-design.md`  
**Date:** 2026-04-20  
**Status:** Draft

---

## 设计系统基础（AC-001 ~ AC-005）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | tailwind.config.ts 注册了 `primary` 颜色 token | Logic | 项目已安装依赖 | `tailwind.config.ts` 中 `colors.primary` 值为 `#003DA6` |
| AC-002 | tailwind.config.ts 注册了完整的 `surface-*` 颜色梯度 | Logic | 项目已安装依赖 | `surface-container-low`、`surface-container-lowest`、`surface-container`、`surface-container-high`、`surface-container-highest` 均已定义且值正确 |
| AC-003 | tailwind.config.ts 注册了 Manrope 和 Inter 字体族 | Logic | 项目已安装依赖 | `fontFamily.headline` 包含 `Manrope`，`fontFamily.sans` 包含 `Inter` |
| AC-004 | globals.css 引入了 Google Fonts（Manrope + Inter） | Logic | 项目已安装依赖 | `globals.css` 中存在引用 Manrope 和 Inter 的 `@import` 语句 |
| AC-005 | 任意页面上不存在 1px 实线分割线 | UI interaction | 前端服务运行于 localhost:8888 | 在首页、职位列表、通知中心三页中，DevTools Elements 中无 `border: 1px solid` 样式的分割元素 |

---

## 共享组件（AC-006 ~ AC-015）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-006 | Button primary 变体渲染渐变背景 | UI interaction | 前端服务运行，登录页可访问 | 登录页主提交按钮的 `background` CSS 计算值包含 `linear-gradient`，起止色为 `#003DA6` 和 `#0052D9` |
| AC-007 | Button 圆角为 0.75rem | UI interaction | 前端服务运行，任意含主按钮的页面可访问 | 主按钮的 `border-radius` 计算值为 `12px` |
| AC-008 | Card hover 时出现环境阴影 | UI interaction | 前端服务运行，首页可访问 | 悬停职位卡片后，`box-shadow` 计算值变为 `0 12px 32px -4px rgba(14,28,44,0.06)` |
| AC-009 | Card 圆角 ≥ 1rem | UI interaction | 前端服务运行，首页可访问 | 首页职位卡片的 `border-radius` 计算值 ≥ `16px` |
| AC-010 | Chip 技能标签圆角为 full | UI interaction | 前端服务运行，职位列表页可访问 | 技能 Chip 的 `border-radius` 计算值为 `9999px` 或浏览器等效最大值 |
| AC-011 | MatchScore 进入视口时触发描边动画 | UI interaction | 前端服务运行，首页可访问，卡片滚入视口 | MatchScore SVG 的 `stroke-dashoffset` 属性在进入视口后 1s 内从周长值过渡到目标值 |
| AC-012 | MatchScore SVG 笔触使用渐变色 | UI interaction | 首页可访问 | MatchScore SVG 中存在 `<linearGradient>`，stroke 引用该渐变，起止色为 `#003DA6` 和 `#0052D9` |
| AC-013 | Input focus 时显示底部 2px primary 线条 | UI interaction | 登录页可访问 | 点击输入框后，底部出现 2px `#003DA6` 色线条，无粗边框环绕 |
| AC-014 | TopNavbar 内容容器最大宽度为 1440px | UI interaction | 前端服务运行，首页可访问 | NavBar 内容容器的 `max-width` 计算值为 `1440px` |
| AC-015 | TopNavbar 无下边框，使用 inset shadow | UI interaction | 首页可访问 | NavBar 元素无 `border-bottom` 样式，但 `box-shadow` 包含 `inset` 关键字 |

---

## 登录页 graphhire_1（AC-016 ~ AC-018）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-016 | 登录页采用左右两栏布局 | UI interaction | 前端服务运行，访问 `/login` | 页面存在左侧品牌区（含渐变背景）和右侧表单区两个独立区块 |
| AC-017 | 登录成功后跳转首页 | UI interaction | 后端服务运行，存在有效测试账号 | 填写正确凭据提交后，浏览器 URL 变为 `/home` |
| AC-018 | 登录失败显示错误提示 | UI interaction | 后端服务运行 | 填写错误密码提交后，页面显示错误文字，无跳转 |

---

## 注册页 graphhire_3（AC-019 ~ AC-020）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-019 | 注册页与登录页视觉风格一致 | UI interaction | 前端服务运行，访问 `/register` | 页面存在左侧品牌区和右侧表单区，左侧背景包含 `#003DA6` 相关渐变 |
| AC-020 | 注册成功后跳转登录或首页 | UI interaction | 后端服务运行 | 提交合法注册信息后，URL 变为 `/login` 或 `/home` |

---

## 首页 graphhire_2（AC-021 ~ AC-024）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-021 | 首页 Hero 区存在全宽搜索栏 | UI interaction | 已登录，访问 `/home` | 页面顶部存在宽度 ≥ 60% 的搜索卡片，背景为白色圆角样式 |
| AC-022 | 首页主体采用 65/35 两栏布局 | UI interaction | 已登录，访问 `/home` | 左侧内容列宽约 65%，右侧 AI 推荐栏约 35% |
| AC-023 | 首页职位卡片含 MatchScore 环形分值 | UI interaction | 已登录，后端返回职位数据 | 每张职位卡片内存在 SVG MatchScore 环形组件，显示数字百分比 |
| AC-024 | Hero 区存在径向渐变光晕装饰 | UI interaction | 已登录，访问 `/home` | Hero 区 DOM 中存在使用 `radial-gradient` 且带 `blur` 的装饰元素 |

---

## 职位列表 graphhire_7（AC-025 ~ AC-027）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-025 | 职位列表顶部存在筛选 Chip 区 | UI interaction | 已登录，访问 `/jobs` | 顶部存在 ≥ 3 个 Chip 元素，所在背景区背景色为 `#EEF0FA` |
| AC-026 | 职位卡片包含 Logo、职位名、薪资、技能 Chip、MatchScore | UI interaction | 已登录，后端返回职位数据 | 每张卡片中可识别公司 logo、职位名、薪资文字、≥1 技能 Chip、1 个 MatchScore 环 |
| AC-027 | 职位列表右侧存在 AI 分析维度面板 | UI interaction | 已登录，访问 `/jobs` | 页面右侧存在宽度约 35% 的独立面板，包含 AI 分析相关内容 |

---

## 简历管理 graphhire_4（AC-028 ~ AC-030）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-028 | 简历管理页显示简历卡片列表 | UI interaction | 已登录，访问 `/resume/manage`，账号有已上传简历 | 页面显示 ≥ 1 张简历卡片，卡片内含文件名和状态 Badge |
| AC-029 | 简历状态 Badge 颜色区分不同状态 | UI interaction | 已登录，存在不同状态的简历 | 已完成状态 Badge 背景色为蓝色系，失败状态 Badge 使用红色系 |
| AC-030 | 删除简历调用 DELETE API | UI interaction | 已登录，存在 ≥ 1 份简历 | 点击删除后，Network 面板出现对应 ID 的 DELETE 请求，返回 2xx |

---

## 上传简历 graphhire_5（AC-031 ~ AC-033）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-031 | 上传页存在拖拽上传区域 | UI interaction | 已登录，访问 `/resume/upload` | 页面存在带虚线边框样式的拖拽目标区域 |
| AC-032 | 拖拽区域 hover 时出现发光效果 | UI interaction | 已登录，访问 `/resume/upload` | 悬停拖拽区域时出现 `box-shadow` 或 `outline` 发光样式变化 |
| AC-033 | 文件上传过程显示进度条动画 | UI interaction | 已登录，后端服务运行 | 选择文件后页面出现进度条，宽度从 0 增长至 100% |

---

## 个人资料 graphhire_6（AC-034 ~ AC-036）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-034 | 个人资料页显示可触发的头像上传区 | UI interaction | 已登录，访问 `/profile` | 页面存在头像展示区域，点击后可触发文件选择对话框 |
| AC-035 | 技能 Chip 支持点击删除 | UI interaction | 已登录，账号有技能数据 | 点击技能 Chip 删除图标后，该 Chip 从 DOM 中消失 |
| AC-036 | 保存个人资料调用 PUT/PATCH API | UI interaction | 已登录，后端运行 | 修改姓名并保存后，Network 面板出现 profile 接口的 PUT 或 PATCH 请求，返回 2xx |

---

## 能力图谱 graphhire_8（AC-037 ~ AC-039）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-037 | 能力图谱页渲染 SVG 节点图 | UI interaction | 已登录，访问 `/skill-graph`，账号有技能数据 | DOM 中存在 `<svg>` 元素，内含 `<circle>` 或 `<g>` 节点和连线元素 |
| AC-038 | 点击技能节点弹出详情侧边栏 | UI interaction | 已登录，SVG 已渲染 | 点击任意节点后，右侧出现技能详情侧边栏，包含技能名称文字 |
| AC-039 | 图谱节点力导向布局动态计算位置 | UI interaction | 已登录，访问 `/skill-graph` | 加载后 1s 内节点位置发生变化，说明 force simulation 正在运行 |

---

## 匹配详情 graphhire_9（AC-040 ~ AC-042）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-040 | 匹配详情页顶部显示大号 MatchScore | UI interaction | 已登录，访问 `/match/[有效id]`，后端返回匹配数据 | MatchScore 分值数字的 font-size 计算值 ≥ `48px` |
| AC-041 | 维度分析条形图有入场动画 | UI interaction | 已登录，访问 `/match/[有效id]` | 条形图各条从宽度 0 动画至目标宽度，动画时长 > 300ms |
| AC-042 | 匹配详情页采用 65/35 两栏布局 | UI interaction | 已登录，访问 `/match/[有效id]` | 左侧岗位描述列宽约 65%，右侧 AI 分析列宽约 35% |

---

## 通知中心 graphhire_10（AC-043 ~ AC-045）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-043 | 通知中心显示通知列表 | UI interaction | 已登录，访问 `/notifications`，账号有通知数据 | 页面显示 ≥ 1 条通知，每条含通知文字和时间戳 |
| AC-044 | 已读与未读通知背景色不同 | UI interaction | 已登录，存在混合已读/未读通知 | 未读通知条目背景色深于已读通知背景色 |
| AC-045 | 通知类型 Badge 显示分类标签 | UI interaction | 已登录，存在不同类型通知 | 每条通知旁有 Badge，文字为"系统"、"匹配"或"招聘方"之一 |

---

## 原型图归档与整体质量（AC-046 ~ AC-048）

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-046 | 原型图已复制到 `docs/前端原型图/` | Logic | Git 仓库可访问 | `docs/前端原型图/graphhire_1/` 至 `graphhire_10/` 及 `nexus_intelligence/` 均存在 |
| AC-047 | 10 个页面在浏览器中无 console error | UI interaction | 前后端均运行，用测试账号登录 | 逐一访问 10 个页面，Chrome Console 中无红色 Error 级别错误 |
| AC-048 | 企业端和管理员端页面未被改动 | Logic | Git 仓库可访问 | `git diff` 输出中 `frontend/src/app/company` 和 `frontend/src/app/(admin)` 目录无任何变更 |
