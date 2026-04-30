# 用户端个人资料/简历管理/投递记录真实后端对接设计

**日期**: 2026-04-30  
**范围**: `frontend/src/app/(user)/personal-info/page.tsx`、`frontend/src/app/(user)/resume/manage/page.tsx`、`frontend/src/app/(user)/resume/upload/page.tsx`、`frontend/src/app/(user)/applications/page.tsx`、`frontend/src/lib/api/person.ts`、`frontend/src/lib/api/resume.ts`、`frontend/src/tests/**`

---

## 目标

将用户端“个人资料”“简历管理”“投递记录”从 mock 数据切换为真实后端，并确保页面字段、状态、动作均与后端接口契约一致：

- 个人资料：按 `/person/info` 字段读取并保存更新，支持头像上传。
- 简历管理：按 `/resume/my` 展示列表，支持“设为默认”“重新解析”“删除”“预览”“上传简历”。
- 投递记录：按 `/person/application/list` 展示并支持状态筛选，`PENDING` 支持撤回。

## 后端契约对齐

### 个人资料

- 读取：`GET /person/info`
- 更新：`PUT /person/info`
- 头像上传：`POST /person/avatar`
- 字段：`realName`、`gender`、`age`、`phone`、`email`、`education`、`school`、`city`、`targetCity`、`expectedSalary`、`avatarUrl`

### 简历管理

- 列表：`GET /resume/my`
- 上传：`POST /resume/my/upload`（multipart: `file`）
- 设默认：`PUT /resume/{id}/default`
- 重新解析：`POST /resume/{id}/parse`
- 删除：`DELETE /resume/{id}`
- 预览：`GET /resume/{id}/preview`
- 进度：`GET /resume/{id}/progress`
- 状态来源：`status`（`PENDING|PARSING|SUCCESS|FAILED`）

### 投递记录

- 列表：`GET /person/application/list`
- 撤回：`PUT /person/application/{id}/withdraw`
- 状态来源：`PENDING|VIEWED|INTERVIEW_INVITED|REJECTED|ACCEPTED|WITHDRAWN`

## 方案设计

### 1) 页面数据模型

在前端页面层建立轻量映射，不修改后端契约：

- 个人资料页面表单字段直接使用 `PersonProfile`。
- 简历页面将 `Resume` 映射为 UI 状态：
  - `PENDING/PROCESSING -> 解析中`
  - `COMPLETED -> 解析成功`
  - `FAILED -> 解析失败`
- 投递记录页面将后端状态映射为中文标签和筛选分组。

### 2) 交互与动作

- 个人资料：
  - 初次加载拉取 `personApi.getProfile()` 填充表单。
  - 点击“保存修改”调用 `personApi.updateProfile()`。
  - 点击“更换头像”触发文件选择并调用 `personApi.uploadAvatar()`，成功后本地预览并同步 store。
- 简历管理：
  - 页面加载调用 `resumeApi.getMyResumes()`。
  - “设为默认”调用 `resumeApi.setDefault(id)`，成功后刷新列表。
  - “重新解析”调用 `resumeApi.parse(id)`，触发后进入轮询 `resumeApi.getParseProgress(id)` 直到完成/失败。
  - “上传新简历文件”调用 `resumeApi.uploadWithProgress()`，完成后刷新列表。
  - “预览解析”打开 `resumeApi.preview(id)` 返回的 blob URL。
  - “删除”调用 `resumeApi.delete(id)` 并刷新列表。
- 投递记录：
  - 页面加载调用 `personApi.getApplications()`。
  - 按 tab 在前端做状态过滤；`全部` 显示全量。
  - `PENDING` 状态提供“撤回”按钮，调用 `personApi.withdrawApplication(id)` 并刷新列表。

### 3) 错误处理

- 统一沿用 `apiClient` 的错误拦截。
- 页面内补充用户可见错误文案（例如“加载失败”“上传失败”“撤回失败”）。
- 关键动作增加进行中态，避免重复提交。

### 4) 路由与一致性修正

- `profile` 菜单中：
  - “简历管理”跳转修正为 `/resume/manage`
  - “我的图谱”跳转修正为 `/skill-graph`

### 5) 测试策略（TDD）

先写失败测试，再实现：

- `personal-info`：
  - 加载时渲染后端字段。
  - 提交时调用 `updateProfile` 且 payload 对齐后端字段。
  - 上传头像时调用 `uploadAvatar` 并刷新头像。
- `resume/manage`：
  - 初始加载调用 `getMyResumes` 并渲染列表。
  - 点击“设为默认”调用 `setDefault`。
  - 点击“重新解析”调用 `parse`。
  - 上传按钮触发 `uploadWithProgress`。
- `applications`：
  - 加载调用 `getApplications`。
  - 状态 tab 过滤准确。
  - `PENDING` 项点击撤回触发 `withdrawApplication`。

## 风险与控制

- 风险：后端返回状态字段与前端假设不一致。
- 控制：把状态映射集中在页面内函数，使用显式分支和兜底标签。

- 风险：上传/解析动作异步时间长导致体验不稳定。
- 控制：增加进行中态和轮询超时保护，动作后统一刷新列表。

- 风险：现有未跟踪文件影响提交。
- 控制：仅 `git add` 本次目标文件，避免混入无关变更。
