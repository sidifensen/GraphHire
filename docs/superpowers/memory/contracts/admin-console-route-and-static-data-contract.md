# 契约：管理端路由与静态数据契约

## 路由契约
- `/admin/login`：管理端登录页（静态交互，不发起鉴权请求）。
- `/admin/dashboard`：管理端总览页（公告、统计卡、图表、待办、动态）。
- `/admin/enterprise-review`：企业审核页（静态表格与状态徽标）。
- `/admin/users`：用户管理页（静态用户列表）。
- `/admin/skill-tags`：标签管理页（静态标签表格）。
- `/admin/task-monitor`：任务监控页（静态任务状态表格）。

## 导航契约
- 侧边栏导航项必须与上述路由一一对应。
- 当前激活路由高亮规则：以 `pathname` 与导航项 `path` 完整匹配为准。

## 静态数据契约
- 所有表格使用页面内部 `mock*` 常量数组，字段类型由页面内 `interface` 定义。
- 静态数据允许前端展示格式化文本（如 `138****4567`、`2023-10-24 14:30`），不要求可逆解析。
- 本阶段禁止新增 API 调用副作用（`fetch/axios/useQuery`）进入管理端页面。

## 主题契约
- 主题状态仅允许 `light | dark`。
- `ThemeProvider` 挂载后从 `localStorage.theme` 读取并写回，且通过 `document.documentElement.classList` 切换 `dark` 类。
