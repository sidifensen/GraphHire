# 用户端多界面 Motion 动效增强设计

## 目标

在不改业务逻辑的前提下，将 Motion 的核心能力落到三个高频页面：

1. Header 导航激活切换布局动画
2. 通知页分类切换布局动画 + 列表过渡动画
3. 技能图谱评分卡 SVG 进度环动画

## 范围

- `frontend/src/components/Header.tsx`
- `frontend/src/app/(user)/notifications/page.tsx`
- `frontend/src/app/(user)/skill-graph/page.tsx`
- 对应测试文件：
  - `frontend/tests/components/Header.test.tsx`
  - `frontend/tests/pages/notifications.test.tsx`
  - `frontend/tests/pages/skill-graph.test.tsx`

## 方案

### Header 导航

- 将激活态下划线从静态边框改为 `layoutId` 共享元素
- 页面切换时由 Motion 执行平滑位移动画
- 保持原有 `Link` 跳转与导航结构

### 通知页分类与列表

- 分类按钮使用 `layoutId` 胶囊背景，增强分类切换反馈
- 列表区域按分类切换执行淡入位移动画
- 列表项使用 `AnimatePresence` 做出入场动画
- 保持筛选与已读/未读逻辑不变

### 技能图谱评分卡

- 增加 SVG 环形评分可视化
- 使用 `motion.circle` 动画化 `strokeDashoffset`
- 环形进度由 `score` 驱动，保留原数字评分文本

## 可访问性与降级

- 使用 `useReducedMotion` 对动画进行减弱或关闭
- 动画只增强视觉反馈，不依赖动画完成业务操作

## 测试策略

- Header：断言激活导航指示器存在
- 通知页：断言分类指示器随切换迁移
- 技能图谱：断言评分环与进度环节点存在

## 风险与控制

- 风险：动画容器引入后测试时序不稳定
- 控制：测试中使用 `waitFor` 处理过渡时序
