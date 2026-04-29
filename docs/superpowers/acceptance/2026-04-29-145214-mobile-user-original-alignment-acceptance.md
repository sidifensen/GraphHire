# Acceptance Criteria: Mobile User Original Alignment

**Spec:** `docs/superpowers/specs/2026-04-29-145214-mobile-user-original-alignment-design.md`
**Date:** 2026-04-29
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 用户端手机版首页、职位页、公司页、我的页及其详情/子页面沿用现有 `/mobile-user/**` 路由，但页面结构与参考目录一致 | UI interaction | 前端开发服务已启动，使用移动端视口访问公开用户页面 | 关键页面展示与参考目录一致的布局块、导航位置和文案结构，无跳转到错误路径 |
| AC-002 | 我的页面包含“夜间模式”卡片与滑块式切换按钮 | Logic | 渲染 `frontend/src/app/mobile-user/profile/page.tsx` | 页面中可找到“夜间模式”文本和可点击切换按钮 |
| AC-003 | 点击夜间模式切换按钮后，移动端主题根类在 `light` 和 `dark` 之间切换 | Logic | `ThemeProvider` 已包裹移动端页面并渲染到测试 DOM | 首次默认类为 `light`，点击后变为 `dark`，再次点击后恢复 `light` |
| AC-004 | 暗色主题下，移动端页面使用主题变量而非写死的亮色背景色 | Logic | 加载 `frontend/src/app/mobile-user/_styles/mobile-user.css` 并切换到 `dark` 主题 | 移动端壳节点上的背景、卡片和文本颜色来源于暗色变量，不再固定为纯白背景 |
| AC-005 | 移动端底部导航仍基于公开用户路径高亮，不受内部 `/mobile-user/**` 前缀影响 | Logic | 运行移动端壳与 `device-routing` 相关测试 | 首页、职位、公司、我的四个入口在对应公开路径上正确高亮，登录/注册页不显示底部导航 |
| AC-006 | 参考目录中的主题上下文、共享组件和页面实现已迁入 `frontend/src/app/mobile-user/**` 私有目录，不引入新的 React Router 依赖链路 | Logic | 检查迁移后的移动端用户实现目录 | 页面通过现有 `_lib/router.tsx` 运行，`app/mobile-user` 内无对参考工程 `BrowserRouter`/`Routes` 的直接依赖 |
| AC-007 | 前端构建通过 | Logic | 在 `frontend` 目录执行构建命令 | `npm run build` 退出码为 0 |
| AC-008 | 前端测试通过 | Logic | 在 `frontend` 目录执行测试命令 | `npm run test:run` 退出码为 0 |
| AC-009 | 后端编译通过 | Logic | 在 `backend` 目录执行编译命令 | `mvn compile` 退出码为 0 |
| AC-010 | 后端测试通过 | Logic | 在 `backend` 目录执行测试命令 | `mvn test` 退出码为 0 |
| AC-011 | 使用 CDP 浏览器验证用户端手机版首页和我的页可正常访问，夜间模式切换可见且可操作 | UI interaction | Chrome CDP 可用，前端开发服务已启动 | 在移动端视口下打开目标页面，页面成功渲染，切换按钮可完成明暗主题切换 |
