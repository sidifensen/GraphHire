# Acceptance Criteria: 管理端完全重写（静态模板迁移）

**Spec:** `docs/superpowers/specs/2026-04-24-163640-admin-console-rebuild-design.md`
**Date:** 2026-04-24
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 管理端登录页可通过 `/admin/login` 访问并渲染“欢迎回来”与“登 录”按钮 | UI interaction | 前端服务启动，浏览器可访问 `http://localhost:8888` | 页面显示标题“欢迎回来”及按钮“登 录”，无运行时报错弹窗 |
| AC-002 | 管理端总览页可通过 `/admin/dashboard` 访问并显示“概览数据”与“近30天平台活跃趋势”模块 | UI interaction | 前端服务启动，浏览器可访问 `http://localhost:8888` | 页面可见上述两个文本模块，页面结构完整无白屏 |
| AC-003 | 管理端路由 `/admin/enterprise-review`、`/admin/users`、`/admin/skill-tags`、`/admin/task-monitor` 均可访问 | UI interaction | 前端服务启动，浏览器可访问 `http://localhost:8888` | 四个路由均返回 200 页面并展示各自标题文本 |
| AC-004 | 侧边栏导航项与管理端目标路由保持一致，点击后可完成页面跳转 | UI interaction | 进入任一管理端壳层页面（非登录页） | 点击侧边栏对应项后，URL 与页面标题同步切换为目标路由内容 |
| AC-005 | 管理端页面全部使用静态演示数据，不触发 API 拉取逻辑 | Logic | 代码完成迁移 | 管理端相关页面代码中不出现 `fetch(`、`axios`、`useQuery` 等数据请求调用 |
| AC-006 | 构建验证通过 | Logic | 安装依赖完成 | 前端 `npm run build` 与后端 `mvn compile` 均返回 exit code 0 |
| AC-007 | 测试验证通过 | Logic | 代码与测试已更新 | 前端 `npm run test:run` 与后端 `mvn test` 均返回 exit code 0 |
| AC-008 | 管理端关键页面渲染测试存在且通过 | Logic | 新增管理端页面测试文件 | 测试运行输出包含管理端页面关键文本断言并全部通过 |

