# Acceptance Criteria: 用户头像上传与 RustFS 展示联调

**Spec:** `docs/superpowers/specs/2026-04-22-173000-user-avatar-rustfs-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 用户在个人资料页上传 jpg/png/webp 且 <=2MB 的头像时，后端将文件写入 RustFS | API | 已登录个人用户；RustFS 可连接 | `POST /person/avatar` 返回 200，返回体包含可访问头像 URL，且 RustFS 中新增对象 |
| AC-002 | 非图片文件或超出大小限制时，上传被拒绝并返回错误 | API | 已登录个人用户 | 上传非法文件返回错误信息，不写入 RustFS |
| AC-003 | 头像上传后，`person_info.avatar_url` 字段被正确保存 | Logic | 数据库可访问；存在用户记录 | 查询 `person_info` 对应用户记录，`avatar_url` 为 `s3://` 路径且非空 |
| AC-004 | 获取个人资料接口返回 `avatarUrl` 字段 | API | 已登录个人用户且有头像 | `GET /person/info` 返回 JSON 中存在 `avatarUrl`，值为 `/person/avatar/public/{userId}` 形式 |
| AC-005 | Header 与 Sidebar 能展示当前用户头像 | UI interaction | 用户端登录态；该用户已上传头像 | 页面渲染后 Header 与 Sidebar 均显示头像图片而非默认占位 |
| AC-006 | 个人资料页上传成功后无需刷新即可显示新头像 | UI interaction | 用户端打开 `/profile`，选择本地图片 | 点击上传后页面头像立即切换为新图 |
| AC-007 | 刷新页面后头像仍能正常显示 | UI interaction | 用户端已上传头像 | 刷新后个人资料页/Header/Sidebar 头像仍显示同一张图 |
| AC-008 | 使用 `D:\user.jpg` 的真实联调上传成功 | UI interaction | 本机存在 `D:\user.jpg`；前后端服务运行；RustFS 可用 | 上传流程成功，页面显示新头像，且后端接口可返回该头像访问地址 |
