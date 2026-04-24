# Acceptance Criteria: 管理端全页面重构

**Spec:** `docs/superpowers/specs/2026-04-24-083216-admin-console-redesign-design.md`  
**Date:** 2026-04-24  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 访问 `/admin/login` 时展示新的重构版登录界面结构（左右分栏） | UI interaction | 前端服务已启动，未登录 | 页面出现品牌区与登录卡片两个主区域 |
| AC-002 | 登录页提交有效账号密码后跳转到 `/admin/dashboard` | UI interaction | `adminApi.login` 返回成功 | 浏览器地址变更为 `/admin/dashboard`，且不会显示错误提示 |
| AC-003 | 登录页接口失败时展示后端错误文本 | Logic | `adminApi.login` mock reject | 页面显示错误信息且登录按钮从 loading 状态恢复 |
| AC-004 | 仪表盘页面展示“概览数据”主标题与至少 4 个指标卡 | UI interaction | 管理员已登录 | 页面可见“概览数据”文本与指标卡网格 |
| AC-005 | 仪表盘成功加载后能渲染趋势图容器 | Logic | `getDashboardStats` 返回 trend 数据 | DOM 中存在趋势图区域容器，且无加载文案 |
| AC-006 | 企业审核页可按状态筛选并重新拉取列表 | Logic | `getCompanyAuthList` mock，状态下拉可操作 | 切换状态后 API 被以新 status 参数再次调用 |
| AC-007 | 企业审核页在有选中项时显示批量操作栏 | UI interaction | 列表有至少 1 行数据 | 勾选行后出现“已选择 N 项”与批量按钮 |
| AC-008 | 企业审核页单条“通过/拒绝”操作后触发列表刷新 | Logic | `updateCompanyAuth` mock 成功 | 相关操作调用后 `getCompanyAuthList` 至少再调用 1 次 |
| AC-009 | 用户管理页展示“用户管理”标题和筛选控件 | UI interaction | 管理员已登录 | 页面存在标题、关键词输入、类型与状态筛选框 |
| AC-010 | 用户管理页点击“详情”会拉取并打开用户详情弹窗 | UI interaction | `getUserDetail` mock 成功 | 弹窗出现，展示用户基础信息区域 |
| AC-011 | 用户管理页批量禁用调用 `batchDisableUsers` | Logic | 至少选择 1 个用户 | 点击批量禁用后触发 API 调用且参数包含选中的 id |
| AC-012 | 标签治理页展示“标签管理”主标题与标签列表行 | UI interaction | `getSkillList` 返回至少 1 行 | 页面能看到标题与列表中的标签名称 |
| AC-013 | 标签治理页切换分类后重置到第 1 页并重新请求 | Logic | 初始页码非 1 或已加载 | 切换分类时请求参数中 `page=1` |
| AC-014 | 任务监控页展示 4 个状态摘要卡（待处理/处理中/成功/失败） | UI interaction | `getTaskList` 返回 summary | 页面可见四类状态文本和值 |
| AC-015 | 任务监控页点击单条“重试”触发 `retryTask` 并刷新列表 | Logic | 列表含 FAILED 任务 | 点击后调用 `retryTask(id)`，随后再次调用 `getTaskList` |
| AC-016 | 任务监控页批量重试仅在有选中项时可执行 | UI interaction | 有任务列表 | 未选中时按钮禁用或无效；选中后可触发 `batchRetryTasks` |
| AC-017 | 前端构建命令 `npm run build` 执行成功 | Logic | 依赖安装完整 | 命令退出码为 0 |
| AC-018 | 前端测试命令 `npm run test:run` 执行成功 | Logic | 测试环境可用 | 命令退出码为 0，失败用例数为 0 |
| AC-019 | 后端编译命令 `mvn compile` 执行成功 | Logic | 后端依赖可解析 | 命令退出码为 0 |
| AC-020 | 后端测试命令 `mvn test` 执行成功 | Logic | 后端测试环境可用 | 命令退出码为 0 |
| AC-021 | 通过 CDP 浏览器验证 6 个管理端页面可正常打开 | UI interaction | 前端已启动，使用 web-access/CDP | `/admin/login` 与 5 个业务页均可访问并呈现关键页面标题 |

