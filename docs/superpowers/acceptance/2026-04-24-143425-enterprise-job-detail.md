# Acceptance Criteria: 企业端职位详情入口与详情页

**Spec:** docs/superpowers/specs/2026-04-24-143410-enterprise-job-detail-design.md
**Date:** 2026-04-24
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业端职位管理列表每个职位项展示“详情”入口 | UI interaction | 企业端职位列表接口返回至少 1 条职位 | 每个职位卡片右侧出现文本为“详情”的可点击链接 |
| AC-002 | 点击“详情”入口可跳转到职位详情页路由 | UI interaction | 列表页已有职位 id=1 | 详情链接 href 为 /enterprise/jobs/1 |
| AC-003 | 职位详情页加载成功时展示职位核心字段 | UI interaction | GET /company/job/{id} 返回有效职位对象 | 页面显示职位标题、状态、部门/城市、薪资、描述、技能信息 |
| AC-004 | 职位详情页提供“查看匹配候选人”入口 | UI interaction | 职位详情页已成功加载职位 id=1 | 页面存在链接且 href 为 /enterprise/recommendations?jobId=1 |
| AC-005 | 职位详情页在路由参数非法时展示错误提示 | Logic | 进入详情页时参数无法转为数字 | 页面展示“无效的职位参数”并不发起详情接口请求 |
| AC-006 | 职位详情接口失败时展示错误态并支持重试 | UI interaction | 首次调用 getJobDetail 抛错，二次调用成功 | 页面先展示错误信息和“重试”按钮；点击重试后成功渲染详情 |
