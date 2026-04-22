# 用户头像上传到 RustFS 设计说明

**日期：** 2026-04-22  
**主题：** user-avatar-rustfs

## 背景与目标

用户端个人资料页面需要支持上传头像，头像文件必须存储在 RustFS（S3 兼容存储）中。上传后，用户端所有展示头像的位置（个人资料页、顶部 Header、侧栏 Sidebar）都应显示新头像，并可在刷新后继续显示。

## 范围

- 后端：头像上传存储从本地磁盘改为 RustFS；补齐头像字段持久化；提供可直接用于 `<img src>` 的头像访问地址。
- 前端：个人资料页增加头像上传交互；统一用户态头像数据来源；头像展示位置全部改为动态读取。
- 联调验证：使用本机 `D:\user.jpg` 完成真实上传与页面展示验证。

## 现状问题

1. `PersonAvatarController` 当前将文件写入 `/data/avatars`，未接入 RustFS。
2. `person_info.avatar_url` 虽有领域字段，但持久化对象与更新 SQL 未覆盖，头像值可能丢失。
3. 前端 Header/Sidebar 使用硬编码头像 URL，与用户实际头像无关。
4. 个人资料页仅显示首字母占位，缺少上传入口。

## 设计方案

### 1) 后端头像存储与访问

- `POST /person/avatar`：
  - 验证图片类型与大小（<=2MB）。
  - 调用 `RustFSClient.upload(bytes, fileName)` 上传到 RustFS。
  - 在 `person_info.avatar_url` 存储 RustFS 路径（`s3://bucket/key`）。
  - 返回当前用户头像访问 URL（`/person/avatar/public/{userId}?v=timestamp`）。

- `GET /person/avatar`（鉴权）：
  - 返回当前登录用户头像访问 URL；若无头像返回 `null`。

- `GET /person/avatar/public/{userId}`（公开读取）：
  - 根据 `userId` 查询头像存储路径。
  - 从 RustFS 下载二进制并按文件扩展名推断 `Content-Type`。
  - 以 `ResponseEntity<byte[]>` 返回，供浏览器 `<img>` 直接访问。

- 鉴权放行：
  - 在 `SaTokenConfig` 中放行 `/person/avatar/public/**`。

### 2) 个人资料接口扩展

- `GET /person/info` 返回 `avatarUrl` 字段（可直接展示的 URL）。
- `PersonInfoResponse` 增加 `avatarUrl`。

### 3) 持久化修复

- `PersonInfoPO` 增加 `avatarUrl` -> `avatar_url` 映射。
- `PersonInfoRepositoryImpl.save` 更新分支增加 `avatar_url` 写入。

### 4) 前端展示与状态同步

- `personApi` 与 `PersonProfile` 增加 `avatarUrl` 字段。
- 个人资料页：
  - 增加文件选择与上传按钮；调用 `personApi.uploadAvatar`。
  - 上传成功后更新页面 `profile.avatarUrl`。
  - 同步更新 `userAuthStore.user.avatarUrl`，确保 Header/Sidebar 立刻刷新。

- `auth-store`：用户对象扩展 `avatarUrl?: string | null`，新增 `updateUser` 局部更新方法。
- Header / Sidebar：
  - 使用 `user.avatarUrl` 展示；无头像回退到默认 icon/首字母。
  - 移除硬编码头像地址。

## 错误处理

- 上传类型/大小非法返回明确错误文案。
- RustFS 上传失败返回“上传头像失败”。
- 公共头像读取失败返回 404，不影响页面其它内容。
- 前端上传失败保留旧头像并提示错误。

## 测试策略

### 后端

- `PersonAvatarControllerTest`：
  - 上传时调用 RustFSClient 且保存 avatar_url。
  - `GET /person/info` 包含 `avatarUrl`。
- `PersonInfoRepositoryImplTest`：
  - 更新个人资料时不丢失 avatar_url 写入能力。

### 前端

- `profile.test.tsx`：
  - 头像上传调用 API 并更新页面头像。
- `Header.test.tsx` / `Sidebar.test.tsx`：
  - 当 store 存在 `avatarUrl` 时渲染用户头像。

## 验收口径

- 使用 `D:\user.jpg` 在个人资料页成功上传。
- RustFS 中存在对应对象。
- 个人资料页、Header、Sidebar 均显示上传头像。
- 页面刷新后仍可正常显示头像。
