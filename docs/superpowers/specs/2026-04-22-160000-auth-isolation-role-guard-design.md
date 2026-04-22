# 登录态隔离与服务端角色校验设计

## 背景
当前管理端、用户端、企业端共用前端持久化键 `auth-storage`，导致同一浏览器内登录态互相覆盖；同时后端仅做登录校验，`/admin/**` 与 `/company/**` 缺少统一角色门禁。

## 目标
1. 三端登录态独立存储、互不覆盖。
2. 前端路由守卫必须调用后端接口校验角色，不仅依赖本地状态。
3. 后端统一对管理端与企业端接口做角色拦截。

## 方案
### 前端
- 将认证 store 拆分为：`auth-storage-user`、`auth-storage-enterprise`、`auth-storage-admin`。
- `apiClient` 按当前路由前缀选择 token 来源：
  - `/admin/*` -> admin store
  - `/enterprise/*` -> enterprise store
  - 其他 -> user store
- 401 仅清理当前端 store，避免影响其他端。
- `AdminAuthGuard` 和新增 `EnterpriseAuthGuard` 在渲染前调用后端 `GET /auth/context`，核验 `userType` 是否匹配。

### 后端
- 在 Sa-Token 拦截器中增加路径角色校验：
  - `/admin/**` -> `ADMIN`
  - `/company/**` -> `COMPANY`
- 新增 `GET /auth/context`，返回当前登录用户 `userId + userType`。

## 风险与兼容
- 路由守卫增加一次轻量请求，首次进入页面会多一次鉴权 RTT。
- 若历史 localStorage 遗留旧键，按新键不读取旧值，可避免再次串号。

## 验收
1. 同浏览器下 admin 与 user 可同时登录且互不影响。
2. person/company 账号访问 `/admin/**` 返回 403。
3. admin 账号访问 `/company/**` 返回 403。
4. 前端守卫在后端返回角色不匹配时自动登出当前端并跳登录页。
