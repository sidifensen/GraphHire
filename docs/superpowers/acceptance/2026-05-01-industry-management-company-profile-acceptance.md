# Acceptance Criteria: 行业管理与企业资料编辑改造

**Spec:** `docs/superpowers/specs/2026-05-01-174710-industry-management-company-profile-design.md`
**Date:** 2026-05-01
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 数据库新增 `industry` 表并具备 `id/name/enabled/sort_order/create_time/update_time/deleted` 字段与 `name` 唯一约束 | Logic | 执行最新 migration 到测试库 | `information_schema.columns` 可查到上述字段，`pg_indexes` 可查到 `name` 唯一索引 |
| AC-002 | 数据库为 `company` 表新增 `industry_id` 字段并移除旧 `industry` 字段 | Logic | 执行行业迁移脚本后 | `company` 表存在 `industry_id`，且不存在 `industry` |
| AC-003 | 迁移脚本会将历史公司行业文本映射到 `company.industry_id`，且原4个现网行业均可被映射 | Logic | 测试库存在历史数据（互联网/人工智能、互联网服务、人力资源服务、软件服务） | 迁移后上述公司记录 `industry_id` 均非空，且关联 `industry.name` 正确 |
| AC-004 | 行业初始化包含历史去重行业及额外假数据（总数不少于20） | Logic | 运行迁移后 | `SELECT COUNT(*) FROM industry WHERE deleted=0` 返回值 >= 20，且包含4个历史行业名称 |
| AC-005 | 管理端可分页查询行业列表并支持按状态过滤 | API | 管理员登录态可访问 `/admin/*` | `GET /admin/industry/list` 返回200，包含 `list/total/page/pageSize`，传 `enabled` 过滤后结果状态一致 |
| AC-006 | 管理端可新增行业且名称唯一 | API | 管理员登录态，待新增名称在库中不存在 | `POST /admin/industry` 返回200并创建成功；重复名称再次提交返回业务错误 |
| AC-007 | 管理端可编辑行业名称与排序 | API | 已存在行业记录 | `PUT /admin/industry/{id}` 返回200，随后查询列表可见名称与排序更新 |
| AC-008 | 管理端可启用/停用行业，且不存在删除行业接口 | API | 已存在行业记录 | `PUT /admin/industry/{id}/status` 返回200并更新状态；不存在 `DELETE /admin/industry/{id}` 路由 |
| AC-009 | 企业端新增公司资料更新接口且仅企业主可调用 | API | 存在同企业 OWNER 与 HR 两类账号，均为已登录 | OWNER 调用 `PUT /company/profile` 返回200；HR 调用返回403 |
| AC-010 | 企业资料更新时行业ID必须存在且处于启用状态 | API | 至少有一个停用行业ID与一个不存在ID | 传停用ID或不存在ID调用 `PUT /company/profile` 返回参数/业务错误，不更新公司数据 |
| AC-011 | `GET /company/info` 返回 `industryId` 与 `industryName` 字段 | API | 企业用户登录且其公司已绑定行业 | 返回体 `data.industryId` 为数字，`data.industryName` 为对应行业名称 |
| AC-012 | 管理端侧边栏新增“行业管理”菜单并可进入页面 | UI interaction | 前端启动并以管理员访问 `/admin/dashboard` | 侧边栏存在“行业管理”菜单，点击后跳转 `/admin/industry` 且页面正常渲染 |
| AC-013 | 管理端行业管理页面支持列表展示、新增、编辑、启停操作 | UI interaction | 管理端行业页可访问，后端行业接口可用 | 页面可看到行业列表；完成新增/编辑/启停后页面数据即时更新并显示成功反馈 |
| AC-014 | 企业端新增公司资料编辑页面，行业字段为下拉选择且仅显示启用行业 | UI interaction | 企业端登录访问新页面，库中存在启用与停用行业 | 页面行业控件为下拉框；列表中仅出现启用行业；保存后详情展示更新后的行业名称 |
| AC-015 | 公司行业跳转筛选使用 `industryId` 参数而非行业名称文本 | UI interaction | 公司列表/详情存在可点击行业入口 | 点击行业后跳转URL包含 `industryId=<number>` 参数，不依赖中文行业名参数 |
| AC-016 | 全量验证命令通过 | Logic | 完成代码实现 | 前端 `npm run build` 与 `npm run test:run` 通过；后端 `mvn compile` 与 `mvn test` 通过 |
| AC-017 | 浏览器CDP验证通过：管理端行业页与企业端资料编辑页主流程可用 | UI interaction | 本地前后端服务可启动 | 通过 CDP 完成页面打开、数据加载、行业编辑保存流程且无阻断性报错 |
