# Acceptance Criteria: 用户职位详情页内联智能匹配

**Spec:** `docs/superpowers/specs/2026-04-25-112146-user-job-detail-inline-match-design.md`  
**Date:** 2026-04-25  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 用户从公司详情页点击原“查看职位匹配”入口后进入职位详情页而非匹配页 | UI interaction | 已打开企业详情并存在职位卡片 | 点击入口后 URL 为 `/jobs/{jobId}`，页面展示该职位标题 |
| AC-002 | 用户从通知中心点击职位推荐入口后进入职位详情页而非匹配页 | UI interaction | 登录用户存在 JOB_RECOMMENDATION 通知且包含 referenceId | 点击“查看匹配”后 URL 为 `/jobs/{referenceId}` |
| AC-003 | 职位详情页初始展示“开始智能匹配”按钮 | UI interaction | 打开 `/jobs/{jobId}` 且职位详情加载成功 | 页面可见“开始智能匹配”按钮，且未展示匹配结果区 |
| AC-004 | 点击“开始智能匹配”后成功加载匹配数据并展示匹配程度 | UI interaction | 用户已登录，匹配接口返回成功 | 页面显示匹配度百分比和匹配等级，按钮文案变为“立即投递” |
| AC-005 | 点击“开始智能匹配”后匹配失败时仅卡片区报错并可重试 | UI interaction | 用户已登录，匹配接口返回失败 | 卡片区显示错误信息与重试入口，职位描述与职位要求区域仍可见 |
| AC-006 | 匹配成功后点击“立即投递”会自动使用默认简历投递 | UI interaction | 用户已登录，已存在 `isDefault=true` 的简历，投递接口可用 | 调用投递接口时入参 resumeId 为默认简历 id，页面显示投递成功反馈 |
| AC-007 | 无默认简历时点击“立即投递”不发起投递并提示设置默认简历 | UI interaction | 用户已登录，简历列表无 `isDefault=true` | 不调用投递接口，页面出现“请先设置默认简历”类提示 |
| AC-008 | 代码库中不再存在用户端匹配详情页面入口和页面测试 | Logic | 完成前端改造并运行测试 | `frontend/src/app/(user)/match/[id]/page.tsx` 与对应测试文件被删除，相关路由引用改为 `/jobs/{id}` |
| AC-009 | 用户布局在职位详情路由仍隐藏 footer 且不依赖 `/match` 明细路由 | Logic | 运行组件单测 | `/jobs/{id}` 下 footer 隐藏；移除 `/match/{id}` 依赖后测试仍通过 |
