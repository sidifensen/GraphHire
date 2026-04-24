# Acceptance Criteria: 企业端新增岗位直发

**Spec:** `docs/superpowers/specs/2026-04-24-092334-enterprise-job-create-design.md`  
**Date:** 2026-04-24  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 职位管理页“发布新职位”入口指向新增岗位页 | UI interaction | 企业端已登录并进入 `/enterprise/jobs` | 页面中存在链接，`href=/enterprise/jobs/new` |
| AC-002 | 新增岗位页校验必填字段与薪资区间 | UI interaction | 打开 `/enterprise/jobs/new`，输入空值或 `salaryMin > salaryMax` | 点击提交后阻止请求并显示校验错误文案 |
| AC-003 | 新增岗位提交成功时按顺序调用创建与发布接口 | Logic | Mock `createJob` 返回 `jobId`，`publishJob` 成功 | `createJob` 调用 1 次，`publishJob(jobId)` 调用 1 次，页面显示成功并跳转 `/enterprise/jobs?created=1` |
| AC-004 | 创建失败时不调用发布接口并展示错误 | Logic | Mock `createJob` 抛错 | `publishJob` 不被调用，页面显示错误提示 |
| AC-005 | 发布失败时展示错误并保留当前页 | Logic | Mock `createJob` 成功，`publishJob` 抛错 | 页面显示错误提示，不发生成功跳转 |
