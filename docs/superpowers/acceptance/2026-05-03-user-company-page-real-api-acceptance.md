# Acceptance Criteria: User Company Page Real API Integration

**Spec:** `docs/superpowers/specs/2026-05-03-user-company-page-real-api-design.md`
**Date:** 2026-05-03
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `GET /public/companies` 支持 `industryLeafIds` 参数并按公司真实行业过滤 | API | 准备至少两家已认证公司，行业不同 | 传入某叶子行业 ID 时，仅返回匹配该行业的公司 |
| AC-002 | `GET /public/companies` 支持 `companyScaleCode` 参数并按 `company.scale` 过滤 | API | 准备不同 `scale` 的已认证公司 | 传入 `companyScaleCode=5` 仅返回 `scale=5` 的公司 |
| AC-003 | `GET /public/companies` 支持 `cityList` 多选过滤 | API | 准备公司在招职位覆盖不同城市 | 传入多个城市时，仅返回城市命中列表的公司 |
| AC-004 | 公开公司卡片响应包含 `industryId`、`industryName`、`scale` 字段 | API | 任意已认证公司有行业和规模信息 | `/public/companies` 与 `/public/companies/{id}` 返回新增字段且值正确 |
| AC-005 | 用户端公司列表页使用真实接口加载并渲染公司数据 | Logic | mock `publicApi.companies.search` 返回数据 | 页面渲染返回的公司名称、城市、在招数量、行业、规模 |
| AC-006 | 用户端公司列表页地点筛选使用热门地点+更多地点弹窗并映射到 `cityList` 请求参数 | UI interaction | mock 省市接口和公司查询接口 | 选择多个地点后查询参数包含标准化后的 `cityList` |
| AC-007 | 用户端公司列表页行业筛选支持热门行业与更多行业弹窗并映射 `industryLeafIds` | UI interaction | mock 行业树与公司查询接口 | 选择行业叶子后查询参数包含对应 `industryLeafIds` |
| AC-008 | 用户端公司列表页公司规模筛选映射 `companyScaleCode` | Logic | mock 公司查询接口 | 选择规模后查询参数包含规模编码（1-6） |
| AC-009 | 用户端公司列表页筛选条件支持本地持久化与恢复 | Logic | 预置 localStorage 筛选值 | 页面初始化自动恢复筛选并触发对应查询参数 |
| AC-010 | 用户端公司详情页使用真实接口加载公司详情与在招职位 | Logic | mock `publicApi.companies.getById` 与 `publicApi.jobs.search` | 页面渲染真实公司信息并展示对应公司职位列表 |
| AC-011 | 用户端公司详情页不再依赖 `MOCK_COMPANIES`/`MOCK_JOBS` | Logic | 静态检查与测试运行 | 页面逻辑中无 mock 数据导入且测试通过 |
| AC-012 | 共享筛选组件在职位页与公司页均可正常使用 | Logic | 职位页与公司页相关测试运行 | 两页面测试均通过，无功能回归 |
