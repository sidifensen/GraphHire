# 用户端手机版原版对齐重写设计

## 背景
- 目标目录：`frontend/src/app/mobile-user`
- 对照基准：`C:\Users\x\Downloads\graphhire-用户端-手机端页面`
- 当前问题：仓库内用户端手机版虽然已经迁入 Next.js 路由结构，但页面实现仍落后于参考目录，缺失最新夜间模式、切换按钮和对应主题样式。

## 目标
- 按参考目录的页面结构、视觉样式和交互细节重写用户端手机版页面。
- 保留当前 Next.js App Router 与 `frontend/src/lib/device-routing.ts` 路由映射。
- 将参考目录中的夜间模式上下文、切换按钮和主题变量完整迁入当前项目。
- 让现有公开用户移动入口继续可用，不引入新的公开路径。

## 设计决策
- 页面与共享实现直接对齐参考目录：将参考工程中的页面、`TopNav`、`BottomNav`、`Skeleton`、`mockData`、`types`、`useLoading`、主题上下文与样式变量迁入 `frontend/src/app/mobile-user/**` 对应私有目录。
- 保留现有 `frontend/src/app/mobile-user/_lib/router.tsx` 适配层，不回退到 React Router。
- 在 `layout.tsx` 或壳组件中注入主题 Provider，使夜间模式对整套用户端手机版页面生效。
- 统一以参考目录的视觉结果为准，覆盖当前已分叉的页面实现；除 Next 路由与导航适配外，不额外做 UI 再设计。

## 影响范围
- `frontend/src/app/mobile-user/_components/*`
- `frontend/src/app/mobile-user/_data/*`
- `frontend/src/app/mobile-user/_hooks/*`
- `frontend/src/app/mobile-user/_lib/*`
- `frontend/src/app/mobile-user/_styles/*`
- `frontend/src/app/mobile-user/**/*.tsx`
- `frontend/src/tests/app/mobile-user-*.test.*`

## 迁移策略
- 维持现有路由文件路径不变，仅替换其页面实现，使公开用户移动入口与内部 `/mobile-user/**` 路由映射保持兼容。
- 将参考目录的 `ThemeContext.tsx` 改造为 Next 客户端组件并放入 `frontend/src/app/mobile-user/_context`。
- `mobile-user.css` 扩展为同时提供亮色与暗色变量，并由主题上下文通过根节点 class 切换。
- `Profile` 页面按参考目录加入“夜间模式”卡片与滑块式切换按钮；其他页面的背景、卡片、文本、分割线等颜色从统一变量读取。

## 测试设计
- 先修改或新增移动端用户测试，断言当前实现缺失的目标行为：
  - 壳组件挂载后可承载主题根类。
  - `Profile` 页面存在“夜间模式”入口与切换按钮。
  - 切换按钮交互后根节点主题类与按钮状态发生切换。
- 生产代码完成后，继续保留并运行现有 `device-routing` 相关测试，确认路径映射没有回归。

## 验证设计
- 前端：`npm run build`
- 前端：`npm run test:run`
- 后端：`mvn compile`
- 后端：`mvn test`
- 浏览器：使用 CDP 打开用户端手机版首页、我的页等关键页面，验证夜间模式开关与整体样式。

## 风险与控制
- 风险：直接覆盖页面后可能误伤当前 Next 壳层路径适配。
- 控制：保留 `router.tsx` 和 `device-routing.ts` 契约不变，用测试覆盖导航与主题切换。

- 风险：主题 class 若挂载层级不对，暗色变量不会作用到整页。
- 控制：将主题根类收敛到移动端壳组件最外层，并增加交互测试。

- 风险：参考目录来自 Vite + React Router，直接照搬会与 Next Link/Navigation 冲突。
- 控制：只迁视觉与组件实现，导航与路由 hook 继续走现有适配层。
