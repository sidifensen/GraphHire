# Acceptance Criteria: Resume Manage Time/Status Fix

**Spec:** `docs/superpowers/specs/2026-04-22-142456-resume-manage-time-status-fix-design.md`
**Date:** 2026-04-22
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 前端在接收后端 `createTime` 字段时，能够映射并渲染为简历展示时间 | Logic | `resumeApi.getMyResumes` 接收到包含 `createTime` 的简历项 | 返回数据中 `createdAt` 为同一时间值，页面不出现 `Invalid Date` |
| AC-002 | 前端在接收后端 `SUCCESS/PARSING` 状态时，能够映射为页面状态模型 | Logic | `resumeApi.getMyResumes` 接收到 `status=SUCCESS` 或 `status=PARSING` | 返回数据中状态分别为 `COMPLETED` 与 `PROCESSING` |
| AC-003 | 页面对非法或缺失时间值进行容错显示 | UI interaction | 打开 `/resume/manage`，接口返回 `createdAt` 为空/非法 | 页面时间位置显示 `-`，不显示 `Invalid Date` |
| AC-004 | 后端 `/resume/my` 返回数据包含 `createTime/updateTime` | API | 用户已上传至少一份简历并调用 `/resume/my` | 返回 JSON 项含 `createTime` 与 `updateTime` 字段 |
| AC-005 | 简历管理页状态文案为“待解析/解析中/解析成功/解析失败” | UI interaction | 打开 `/resume/manage`，存在不同状态简历 | 页面文案与状态对应准确，不再把成功态显示为待解析 |
