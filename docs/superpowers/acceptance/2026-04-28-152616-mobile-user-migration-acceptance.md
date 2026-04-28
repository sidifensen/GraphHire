# Acceptance Criteria: 移动端用户页面整体迁移

**Spec:** `docs/superpowers/specs/2026-04-28-152616-mobile-user-migration-design.md`
**Date:** 2026-04-28
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `frontend/src/app/mobile-user/**` 中不再存在 `@/mobile-user-page/...` 或 `@/app/mobile-user/_pages/...` 导入 | Logic | 仓库代码已完成迁移 | 结构测试通过，且扫描结果中无遗留转发目录依赖 |
| AC-002 | 旧目录 `frontend/src/mobile-user-page` 与临时目录 `frontend/src/app/mobile-user/_pages` 在迁移完成后都已被删除 | Logic | 仓库代码已完成迁移 | 结构测试通过，文件系统中不存在这两个目录 |
| AC-003 | 移动端壳在公开首页路径对应的内部页中显示底部导航 | UI interaction | 前端开发服务器启动，浏览器打开移动端首页 | 页面底部可见“首页/职位/公司/我的”四个导航项 |
| AC-004 | 移动端壳在登录页对应的内部页中隐藏底部导航 | UI interaction | 前端开发服务器启动，浏览器打开移动端登录页 | 页面底部不存在底部导航栏 |
| AC-005 | 公开用户路径与 `/mobile-user/**` 内部路径的映射规则在迁移后保持不变 | Logic | 前端单元测试可运行 | `frontend/src/tests/lib/device-routing.test.ts` 全部通过 |
| AC-006 | 前端迁移后的移动端页面可以通过 Next 构建 | Logic | 前端依赖已安装 | `npm run build` 成功退出且无移动端导入错误 |
| AC-007 | 整个前端测试集在迁移后保持通过 | Logic | 前端依赖已安装 | `npm run test:run` 成功退出 |
| AC-008 | 后端编译与测试在本次前端结构迁移后不受影响 | Logic | 后端依赖可用 | `mvn compile` 与 `mvn test` 成功退出 |
