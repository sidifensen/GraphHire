# Acceptance Criteria: 企业端推荐页后端真实对接

**Spec:** `docs/superpowers/specs/2026-05-03-201559-enterprise-recommendations-api-integration-design.md`
**Date:** 2026-05-03
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 推荐页加载时应拉取企业职位列表并显示在左侧职位区域 | UI interaction | 企业账号已登录，`/company/job/list` 返回至少1条职位 | 页面渲染后左侧出现真实职位名称，且不再读取 mockJobs |
| AC-002 | 有 `jobId` 查询参数时，应优先选中对应职位并拉取该职位推荐候选人 | UI interaction | URL 含 `jobId`，且该职位属于当前企业 | 页面初始化后当前职位标题与 `jobId` 对应，调用 `/company/recommend/resumes?jobId=<id>` |
| AC-003 | 无 `jobId` 查询参数时，应默认选中首个可推荐岗位并加载候选人 | UI interaction | 企业存在至少一个可推荐岗位 | 页面加载后自动选中首个岗位，并请求对应推荐列表 |
| AC-004 | 点击左侧其他职位应刷新右侧候选人列表 | UI interaction | 左侧存在多个岗位 | 点击后 `selectedJobId` 更新，并重新请求对应 `jobId` 的推荐数据 |
| AC-005 | 顶部主按钮文案应为“一键匹配所有候选人” | UI interaction | 推荐页可见 | 主按钮文本精确显示为“一键匹配所有候选人” |
| AC-006 | 点击“一键匹配所有候选人”应调用岗位匹配触发接口并在成功后刷新推荐列表 | UI interaction | 已选中有效岗位，接口可用 | 触发 `POST /company/job/{id}/match/trigger`，随后再次调用推荐查询接口 |
| AC-007 | 点击“刷新”按钮应重新拉取职位与当前岗位候选人数据 | UI interaction | 推荐页已完成首次加载 | 点击后显示刷新中状态，完成后数据按最新接口响应更新 |
| AC-008 | 候选人卡片应展示综合匹配度、技能匹配度、岗位要求匹配度 | UI interaction | 推荐接口返回 `score.total/skillScore/requirementScore` | 卡片可见三类分值且取整展示为百分比 |
| AC-009 | 候选人卡片应展示候选人技能标签 | UI interaction | 推荐接口返回 `resume.skills` | 卡片中显示技能标签列表，空值时不报错 |
| AC-010 | 推荐接口返回应支持候选人学历与经验摘要字段 | API | 匹配记录存在且 `resume.parseResult` 含学历/经历信息 | `GET /company/recommend/resumes` 返回的 `resume` 节点中包含 `education` 与 `experience` 字段（可为空字符串/null） |
| AC-011 | `resume.parseResult` 缺失或非标准 JSON 时，推荐接口仍可正常返回 | Logic | 构造 `parseResult` 为空或异常格式的简历记录 | 接口返回 200，`resume.skills/education/experience` 回退为空，不抛异常 |
| AC-012 | 推荐页空数据场景应保持页面结构稳定并给出空态提示 | UI interaction | 企业无可推荐岗位或当前岗位无候选人 | 左右结构不崩溃，出现明确空态文案且无运行时报错 |
