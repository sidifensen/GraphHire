# 登录态隔离与角色门禁实施计划

1. 编写失败测试（RED）
- backend: 新增角色门禁集成测试，覆盖 admin/company 越权场景。
- frontend: 新增认证域选择与 store 分仓测试，覆盖 token 读取/清理不串号。

2. 实现后端角色门禁（GREEN-1）
- 修改 `SaTokenConfig`：在 `checkLogin` 后按路径强制 `UserType`。
- 新增 `AuthController` 的 `GET /auth/context`。

3. 实现前端登录态分仓（GREEN-2）
- 重构 `auth-store` 为三端 store。
- 调整登录页、注册页、管理端登录、header、logout、api client。
- 新增 `EnterpriseAuthGuard`，并增强 `AdminAuthGuard` 的后端角色校验。

4. 回归与重构（REFACTOR）
- 清理重复逻辑，提取 auth domain 选择工具函数。
- 保持现有业务行为不变，仅修复串号与越权。

5. 全量验证
- frontend: `npm run build`、`npm run test:run`
- backend: `mvn compile`、`mvn test`
- CDP 浏览器验证：三端登录互不影响 + 越权拦截。
