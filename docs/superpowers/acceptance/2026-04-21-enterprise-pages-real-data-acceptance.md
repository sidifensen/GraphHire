# Acceptance Criteria: 企业端真实数据接入与关键操作补齐

**Spec:** `docs/superpowers/specs/2026-04-21-enterprise-pages-real-data-design.md`
**Date:** 2026-04-21
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业首页通过正式接口返回统计卡片与近期职位列表数据。 | API | 后端已启动，存在企业账号、职位、投递/匹配相关数据。 | 请求 `GET /company/dashboard` 返回 200，包含待处理投递数、新匹配候选人数、在招职位数、近期职位列表等字段；空数据时返回合法空结构。 |
| AC-002 | 企业首页不再使用硬编码统计数字和硬编码职位行作为主渲染源。 | UI interaction | 前端已接入 dashboard 接口。 | 打开 `/enterprise/dashboard` 时统计卡片与近期职位列表展示真实接口数据；源码中不再以固定数值 24/156/8 和静态职位表格作为主渲染源。 |
| AC-003 | 企业职位列表接口支持状态筛选与关键词搜索。 | API | 后端已启动，企业下存在多条不同状态职位。 | 请求 `GET /company/job/list` 时传入 `status` 或 `keyword` 能稳定过滤，返回页面所需字段。 |
| AC-004 | 职位管理页使用正式接口渲染列表并支持筛选/搜索。 | UI interaction | 前端已接入职位列表接口。 | 打开 `/enterprise/jobs` 后页面显示真实职位；切换状态或输入关键词后会重新请求接口并刷新结果。 |
| AC-005 | 职位管理页支持正式的职位状态关键操作。 | UI interaction | 企业账号具备可操作职位。 | 在 `/enterprise/jobs` 中执行发布、关闭/下架、重新解析时，会调用正式接口；成功后列表状态同步更新，失败时显示错误提示。 |
| AC-006 | 推荐简历接口支持按职位获取真实候选人推荐。 | API | 后端已启动，企业存在至少 1 个职位和关联推荐结果。 | 请求 `GET /company/recommend/resumes?jobId=...` 返回 200；结果包含候选人姓名、技能标签、工作年限、匹配分、推荐分析等字段。 |
| AC-007 | 推荐简历页使用真实职位列表和真实推荐结果。 | UI interaction | 前端已接入职位列表与推荐接口。 | 打开 `/enterprise/recommendations` 后左侧职位列表来自正式接口；切换职位后右侧推荐列表刷新为真实数据。 |
| AC-008 | 员工列表接口返回当前企业员工页所需字段。 | API | 后端已启动，企业下存在多个员工账号。 | 请求 `GET /company/staff/list` 返回 200；包含员工标识、用户名/姓名、岗位、角色、状态、最近登录时间等页面所需字段。 |
| AC-009 | 员工统计接口返回员工页顶部统计。 | API | 后端已启动，企业下存在不同角色员工。 | 请求 `GET /company/staff/stats` 返回 200；至少包含总人数、管理员数、招聘角色人数。 |
| AC-010 | 员工管理页使用真实数据渲染统计和员工列表。 | UI interaction | 前端已接入员工列表和统计接口。 | 打开 `/enterprise/employees` 后页面展示真实统计与员工记录；无数据时展示空态而非假数据。 |
| AC-011 | 员工管理页支持正式创建员工。 | UI interaction | 当前登录账号为企业主；后端创建员工接口可用。 | 在员工页提交创建员工表单后，正式接口返回成功，列表刷新可看到新员工。 |
| AC-012 | 员工管理页支持正式重置员工密码。 | UI interaction | 当前登录账号为企业主；目标员工属于当前企业且非企业主。 | 点击重置密码后调用正式接口；接口返回成功并将新密码反馈给前端展示。 |
| AC-013 | 通知接口提供当前登录用户视角的安全查询能力。 | API | 后端已启动，当前用户存在多条通知。 | 请求 `GET /notifications/me`、`/notifications/me/unread-count`、`/notifications/me/type/{type}` 时返回当前登录用户通知数据，而不是要求前端传任意 userId。 |
| AC-014 | 企业通知中心使用真实通知数据渲染列表与分类。 | UI interaction | 前端已接入通知 me 视角接口。 | 打开 `/enterprise/notifications` 后列表来自真实通知接口；分类切换会按正式类型过滤结果。 |
| AC-015 | 通知中心支持单条已读与全部已读。 | UI interaction | 当前用户至少存在 1 条未读通知。 | 点击单条通知或“全部标记已读”后会调用正式接口；未读样式和未读数量同步更新。 |
| AC-016 | 企业端五个页面均具备 loading、empty、error 三种明确状态。 | UI interaction | 前端页面已接入真实接口；可模拟空数据和失败请求。 | 在成功、空数据、失败三种情况下，页面均有可见反馈，不出现空白页或崩溃。 |
| AC-017 | 企业端真实数据相关后端接口具备自动化测试覆盖。 | Logic | 后端测试工程可运行。 | 企业 dashboard、职位列表与关键操作、推荐、员工、通知相关测试全部通过。 |
| AC-018 | 企业端真实数据相关前端页面与 API 逻辑具备自动化测试覆盖。 | Logic | 前端测试工程可运行。 | 企业 dashboard、jobs、recommendations、employees、notifications 相关测试通过，并覆盖成功态/空态/异常态及关键操作。 |
| AC-019 | 企业端页面源码中不再保留同类业务 mock 主数据源。 | Logic | 完成前端改造后。 | 搜索企业端页面源码时，不再存在静态职位列表、员工列表、推荐候选人列表、通知列表示例作为主渲染源。 |
| AC-020 | 开发完成后通过浏览器联调验证企业端目标页面均正常工作。 | UI interaction | 前后端服务已启动，可使用 `/web-access`。 | 通过浏览器访问 `/enterprise/dashboard`、`/enterprise/jobs`、`/enterprise/recommendations`、`/enterprise/employees`、`/enterprise/notifications`，页面可打开并显示真实接口数据，关键操作无明显异常。 |
