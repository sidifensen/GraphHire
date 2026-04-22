# 管理端真实数据接入与后端能力补齐设计规格

**日期：** 2026-04-21  
**状态：** 待评审  
**范围：** 管理端页面（`/admin/dashboard`、`/admin/enterprise-review`、`/admin/users`、`/admin/skill-tags`、`/admin/task-monitor`）

---

## 1. 背景与目标

当前管理端五个核心页面基本仍使用硬编码假数据渲染。虽然前端已有 `frontend/src/lib/api/admin.ts`，后端也已有 `AdminController`、`AdminAppService` 等基础骨架，但存在以下问题：

1. 前端页面主业务区域仍是静态示例数据，未真正依赖后端；
2. 前后端接口路径、参数和响应结构不一致，例如企业审核列表路径、用户状态更新参数、分页结构等；
3. 后端部分接口仅返回粗糙结构，无法直接支撑页面展示，例如用户列表仅返回 `List<Long>`；
4. 页面上的关键操作按钮并未全部接通真实能力，仍存在“看起来可点、实际上是假交互”的情况。

本次目标是：

1. 管理端五个页面全部改为通过正式后端接口读取真实数据；
2. 补齐管理端页面所需的最小后端聚合与列表能力，而不是长期依赖前端拼装；
3. 页面中已展示的关键操作全部接通正式后端，不保留假成功行为；
4. 统一管理端接口结构，使前端页面可稳定消费并可覆盖自动化测试和浏览器验收。

---

## 2. 范围定义

### 2.1 在范围内页面

1. `/admin/dashboard`
2. `/admin/enterprise-review`
3. `/admin/users`
4. `/admin/skill-tags`
5. `/admin/task-monitor`

### 2.2 在范围内能力

- 仪表盘统计、趋势、待办摘要真实化
- 企业审核列表、筛选、单项审核、批量审核
- 用户列表、筛选、状态修改、批量禁用
- 技能标签列表、筛选、真实统计降级处理
- 任务监控列表、状态统计、单项重试、批量重试
- 前后端接口路径、参数和响应结构统一

### 2.3 不在范围内

- 管理端整体视觉重做
- 后端大规模领域重构或表结构重设计
- 技能图谱运营模块完整平台化建设
- 暂无正式后端支持且超出本次页面范围的高级操作（如导出、复杂治理工作流）

---

## 3. 核心原则

### 3.1 真实数据原则

- 页面主业务内容必须来自正式后端接口；
- 页面源码中不得继续保留等价业务 mock 作为主渲染源；
- 若数据库测试数据有限，可补结构化演示数据，但页面仍只能读取正式接口。

### 3.2 页面型接口优先原则

- 对 dashboard、任务监控、待办摘要这类聚合页面，优先由后端提供页面型 DTO 或聚合接口；
- 不把跨接口统计和字段推导长期留给前端。

### 3.3 关键操作真实化原则

- 页面已有的审核、状态切换、重试、批量操作必须接通真实能力；
- 若本次确实无法实现某按钮能力，前端必须显式禁用、隐藏或标识“暂未开放”，不能保留假交互。

### 3.4 最小可交付原则

- 本次只补足管理端页面当前所需的最小能力；
- 新增 DTO、查询和聚合逻辑仅围绕五个管理端页面，不做超范围平台化抽象。

### 3.5 测试驱动原则

- 所有新增或增强的后端能力先补失败测试，再写实现；
- 前端页面切换真实数据源时，同步更新 API 测试和页面测试，覆盖成功态、空态、异常态与关键操作态。

---

## 4. 页面设计

### 4.1 仪表盘 `/admin/dashboard`

目标：
- 顶部统计卡片改为真实数据；
- 趋势图绑定真实趋势数据，而不是写死 SVG 曲线含义；
- “快捷入口”“待办事项”中的数量和跳转上下文来自真实待处理数据；
- “AI 匹配总数”“任务成功率”“企业周新增数”等运营指标只显示真实可得值；
- 无法真实提供的指标降级为空态或移除，不保留硬编码数字。

页面状态要求：
- 首屏具备 loading skeleton；
- 请求失败时显示错误提示和重试入口；
- 空数据时展示空态，不伪造运营数据。

### 4.2 企业审核页 `/admin/enterprise-review`

目标：
- 表格改为真实分页数据；
- 支持状态筛选和关键词搜索；
- 支持单项通过、单项拒绝；
- 支持勾选与批量通过、批量拒绝；
- 拒绝操作补齐拒绝理由输入；
- 分页信息和总数完全使用真实返回结果。

列表项字段至少包括：
- `id`
- `companyId`
- `companyName`
- `unifiedSocialCreditCode`
- `legalPerson`
- `phone`
- `submittedAt`
- `status`
- `reviewedAt`
- `rejectReason`

### 4.3 用户管理页 `/admin/users`

目标：
- 列表改为真实用户分页数据；
- 支持关键词、用户类型、账号状态筛选；
- 勾选状态与“已选择 X 项”联动；
- 支持单个用户启用/禁用，必要时兼容锁定态展示；
- 支持批量禁用；
- “批量导出”若无真实后端能力，则显式禁用或提示暂未开放。

列表项字段至少包括：
- `id`
- `username`
- `email`
- `phone`
- `type`
- `status`
- `createdAt`
- `lastLoginAt`
- `avatarUrl`

### 4.4 技能标签页 `/admin/skill-tags`

目标：
- 主列表改为真实技能标签数据；
- 支持分类筛选和关键词搜索；
- 同义词数量、热度等由真实字段计算或映射；
- 右侧“图谱健康度”“认知引擎建议”等模块仅显示真实可用统计；
- 暂无后端支持的建议类运营模块降级为隐藏、空态或说明，不再保留硬编码大数字与伪建议。

列表项字段至少包括：
- `id`
- `name`
- `category`
- `synonyms`
- `jobCount`

### 4.5 任务监控页 `/admin/task-monitor`

目标：
- 顶部状态卡片改为真实任务 summary；
- 最近任务列表改为真实任务数据；
- 支持单项重试和批量重试；
- 失败原因展示真实 `errorMessage`；
- 处理中和成功状态显示真实数据，不再保留示例任务文案。

列表项字段至少包括：
- `id`
- `type`
- `status`
- `progress`
- `total`
- `successCount`
- `failCount`
- `createdAt`
- `startedAt`
- `completedAt`
- `errorMessage`

---

## 5. 后端设计

### 5.1 整体策略

后端不再直接返回仅供内部使用的领域对象或过于粗糙的结构，而是按管理端页面需求提供 DTO / Response：

- 聚合页提供聚合响应；
- 列表页提供分页响应；
- 操作接口返回统一成功结果，并尽量保证单项与批量接口语义一致；
- 路径、参数名、分页语义和前端 `adminApi` 统一。

### 5.2 仪表盘接口

保留并增强：
- `GET /admin/dashboard/stats`

返回至少包含：
- 用户总数
- 企业总数
- 简历总数
- 在招职位数
- 今日新增用户数
- 今日新增职位数
- 待审核企业数
- 失败或待处理任务数
- AI 匹配总数 / 任务成功率 / 企业周新增数等真实可得运营指标
- 待办摘要

必要时新增：
- `GET /admin/dashboard/trend`

用于近 7 天或 30 天趋势图，避免前端继续用静态曲线模拟业务趋势。

### 5.3 企业审核接口

统一为：
- `GET /admin/company/auth-list`
- `PUT /admin/company/auth/{id}`
- `POST /admin/company/batch/approve`
- `POST /admin/company/batch/reject`

`GET /admin/company/auth-list` 支持：
- `page`
- `pageSize`
- `status`
- `keyword`

返回分页结构：
- `list`
- `total`
- `page`
- `pageSize`

### 5.4 用户管理接口

统一为：
- `GET /admin/user/list`
- `PUT /admin/user/{id}/status`
- `POST /admin/user/batch/disable`

`GET /admin/user/list` 支持：
- `page`
- `pageSize`
- `type`
- `status`
- `keyword`

返回分页结构：
- `list`
- `total`
- `page`
- `pageSize`

`PUT /admin/user/{id}/status` 改为接收明确状态或等价命令对象，避免继续使用与前端不一致的 `enabled` 查询参数。

### 5.5 技能标签接口

统一为：
- `GET /admin/skill/list`

支持：
- `page`
- `pageSize`
- `category`
- `keyword`

返回：
- `list`
- `total`
- `page`
- `pageSize`

必要时可补：
- `GET /admin/skill/stats`

用于页面右侧可真实展示的统计模块。若当前无法稳定提供，则前端侧做降级而不强求新增接口。

### 5.6 任务监控接口

统一为：
- `GET /admin/task/list`
- `POST /admin/task/{id}/retry`
- `POST /admin/task/batch/retry`

`GET /admin/task/list` 支持：
- `page`
- `pageSize`
- `type`
- `status`

返回：
- `summary`（待处理、处理中、成功、失败）
- `list`
- `total`
- `page`
- `pageSize`

### 5.7 响应结构原则

- 管理端页面接口优先返回 DTO / Response，不直接暴露领域实体；
- 空列表返回合法空结构，不返回 `null`；
- 操作失败给出明确错误消息，方便前端 toast 反馈；
- 单项接口与批量接口的路径风格和参数结构保持一致。

---

## 6. 前端设计

### 6.1 总体策略

前端改造聚焦于：
- 用正式 API 替换页面级硬编码数组；
- 调整 `frontend/src/lib/api/admin.ts` 使其与后端能力对齐；
- 为各页面补充 loading / empty / error / action pending 状态；
- 保持现有 UI 风格，不做大规模视觉重构，只做真实数据适配。

### 6.2 页面改造要求

每个管理端页面接入真实数据后应满足：
- 首屏发起正式请求；
- 成功时展示真实数据；
- 无数据时展示明确空态；
- 失败时展示错误态和重试按钮；
- 页面源码中无同类业务 mock 主数据源残留。

### 6.3 关键交互要求

本次必须打通的操作：
- 企业审核通过
- 企业审核拒绝（含理由）
- 企业批量通过 / 批量拒绝
- 用户启用 / 禁用
- 用户批量禁用
- 单任务重试
- 批量任务重试

允许降级但必须显式处理的操作：
- 批量导出用户
- 技能标签高级治理动作（如合并、停用、AI 建议采纳）
- 仪表盘无法真实支撑的运营卡片

这些未接通能力必须隐藏、禁用或标记“暂未开放”，不能伪造成功交互。

---

## 7. 测试与验收策略

### 7.1 后端测试

必须补充或更新：
- `AdminControllerIT`
- 必要的 `AdminControllerTest`
- 必要的 `AdminAppServiceTest`

覆盖内容包括：
- 仪表盘统计接口
- 企业审核列表筛选与审核操作
- 用户列表筛选与状态修改
- 技能标签列表查询
- 任务列表查询与重试能力
- 批量操作接口

### 7.2 前端测试

必须补充或更新：
- `frontend/tests/pages/admin-dashboard.test.tsx`
- `frontend/tests/pages/admin-enterprise-review.test.tsx`
- `frontend/tests/pages/admin-users.test.tsx`
- `frontend/tests/pages/admin-skill-tags.test.tsx`
- `frontend/tests/pages/admin-task-monitor.test.tsx`
- 必要的 `frontend/tests/lib/api/*` 管理端接口测试

覆盖内容包括：
- 真实接口成功渲染
- loading / empty / error 状态
- 筛选与分页
- 审核、状态修改、任务重试等关键操作
- 未开放功能的禁用或降级展示

### 7.3 浏览器验收

按仓库要求，完成开发后必须通过 `/web-access` skill 做浏览器验收，至少覆盖：
- `/admin/dashboard`
- `/admin/enterprise-review`
- `/admin/users`
- `/admin/skill-tags`
- `/admin/task-monitor`

并确认页面数据不再来自假数据、关键操作可真实执行。

---

## 8. 完成标准

本次任务完成时，必须同时满足：

1. 管理端五个目标页面主业务数据来自正式后端接口；
2. 页面级业务假数据已移除，不再作为主渲染源；
3. 后端已补齐管理端页面所需的最小聚合、列表与关键操作能力；
4. 前后端接口路径、参数和响应结构已统一；
5. 自动化测试已更新并通过；
6. 已通过浏览器完成管理端真实联调验收。

---

## 9. 风险与控制

### 9.1 主要风险

- 现有 admin 相关接口与前端约定不一致，改造中可能出现联调断层；
- 某些 dashboard / skill 侧运营指标当前缺乏可靠真实来源；
- 任务监控底层当前主要依赖解析任务，任务类型和统计字段可能需要适配；
- 用户列表与企业审核的领域数据结构可能不足以直接映射页面所需字段。

### 9.2 控制策略

- 采用页面型 DTO 收敛字段，避免前端长期拼装；
- 先统一接口契约，再改页面消费；
- 对暂时无法真实提供的模块明确降级，拒绝继续展示假数字；
- 用集成测试和页面测试锁定接口契约，降低回归风险。
