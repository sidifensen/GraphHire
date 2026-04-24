# 管理端完全重写（静态模板迁移）设计规格

**日期：** 2026-04-24
**范围：** `frontend/src/app/admin/**`、`frontend/src/components/admin/**`、管理端主题上下文与全局样式
**来源模板：** `docs/graphhire-图谱智聘 (5)`

---

## 1. 目标与非目标

### 1.1 目标
- 将当前管理端按模板进行完全重做，视觉与交互风格尽量贴合模板。
- 管理端仅保留静态演示数据，优先确保“可运行、可访问、可构建、可测试”。
- 路由保持现有对外路径语义（`/admin/*`），避免影响外部入口。

### 1.2 非目标
- 本轮不接入后台真实 API，不做鉴权链路改造。
- 不改造用户端与企业端页面。
- 不改造后端服务与数据库结构。

## 2. 路由与页面映射

| 模板路径 | 目标路径 |
|---|---|
| `/login` | `/admin/login` |
| `/dashboard` | `/admin/dashboard` |
| `/dashboard/companies` | `/admin/enterprise-review` |
| `/dashboard/users` | `/admin/users` |
| `/dashboard/tags` | `/admin/skill-tags` |
| `/dashboard/tasks` | `/admin/task-monitor` |

设计决策：侧边栏导航项直接指向目标路径，不保留 `/dashboard/*` 兼容层。

## 3. 架构设计

### 3.1 布局结构
- `app/admin/layout.tsx` 作为管理端统一壳层。
- 登录页 `app/admin/login/page.tsx` 不使用壳层（全屏视觉页）。
- 其他管理页通过 `AdminShell` 注入：可折叠侧边栏 + 顶栏 + 主内容区。

### 3.2 组件分层
- 页面层：每个 `page.tsx` 持有静态数据和页面编排。
- UI 复用层：`AdminDataTable`、`AdminStatCard`、`AdminSidebar`、`AdminTopbar`、`AdminShell`。
- 主题层：`ThemeContext` 统一明暗主题切换。

### 3.3 数据策略
- 全量使用页面本地 `mock` 常量数组，定义明确 `interface`。
- 不引入异步请求、副作用数据流、状态库扩展。

## 4. 样式与动效策略

- 将模板的设计 Token 与关键类迁入 `frontend/src/styles/globals.css`（仅增量覆盖，避免破坏用户端样式）。
- 动画统一采用 `framer-motion`（替代模板 `motion/react`）。
- 保留模板的暗色模式切换、玻璃拟态卡片、统计卡/表格/徽标风格。

## 5. 错误处理与可用性

- 页面静态数据渲染不依赖网络，避免 API 失败导致白屏。
- 主题上下文缺失时抛错（开发期暴露配置问题）。
- 路由未命中交给 Next 默认 404，不新增自定义 404。

## 6. 测试设计（TDD）

- 先新增管理端回归测试（RED）：
  - `/admin/login` 标题与主按钮渲染。
  - `/admin/dashboard` 关键卡片与图表标题渲染。
  - `/admin/enterprise-review` 表格列头与状态标签渲染。
  - `/admin/users`、`/admin/skill-tags`、`/admin/task-monitor` 关键文本渲染。
- 再迁移实现（GREEN），最后做小范围重构（REFACTOR）。

## 7. 验证与完成标准

必须全部通过：
1. `frontend` 构建：`npm run build`
2. `backend` 编译：`mvn compile`
3. `frontend` 测试：`npm run test:run`
4. `backend` 测试：`mvn test`
5. 浏览器验证：通过 CDP 打开 `/admin/login` 与 `/admin/dashboard`，确认页面可见且导航可用

## 8. 风险与回滚

### 8.1 主要风险
- 全局样式覆盖过强，可能影响非管理端页面样式。
- 当前工作区已有未提交改动，提交时需精准暂存本次文件。

### 8.2 缓解
- 样式变更限定为管理端必要 Token 和已存在类扩展。
- 仅 `git add` 本次重写相关文件，避免误提交无关改动。

### 8.3 回滚策略
- 通过单次功能提交回滚管理端重写。
- 若仅样式异常，可单独回滚 `globals.css` 相关改动。
