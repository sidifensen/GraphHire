# API 接口层补全设计

## 目标

将后端 118 个 REST API 全部补全到 `frontend/src/lib/api/`，同时修正现有路径错误并重组文件结构。

## 文件重组结构

| 文件 | 对应后端 Controller | 接口数量 |
|------|---------------------|---------|
| `auth.ts` | AuthController + PasswordController | 13 |
| `admin.ts` | AdminController + BatchOperationController | 25 |
| `category.ts` | CategoryController | 4 |
| `person.ts` | PersonController + PersonAvatarController + PersonApplicationController | 19 |
| `resume.ts` | ResumeController | 7 |
| `company.ts` | CompanyController + CompanyApplicationController | 26 |
| `match.ts` | MatchController + MatchGraphController | 6 |
| `notification.ts` | NotificationController | 9 |
| `skillTag.ts` | SkillTagController | 11 |
| `public.ts` | PublicCompanyController + PublicJobController | 4 |

**删除文件：** `recommendation.ts`、`skill-graph.ts`、`homeApi.ts`（接口拆分合并入上述 10 个文件）

## 路径修正原则

1. **Person 模块**：后端使用 `/person/info`（当前用户，SESSION 获取），前端现有 `/person/{userId}` 全部替换
2. **Resume 模块**：后端使用 `/resume/my/*`，前端现有 `/resume/user/{userId}` 全部替换
3. **Notification 模块**：后端使用 `/notifications/user/{userId}/*`，修正前端错误路径
4. **Company 模块**：内部接口 `/company/info`（当前公司，SESSION 获取），不依赖 companyId 路径参数

## 待删除文件接口去向

- `recommendation.ts` → `company.ts`（人才池、推荐候选人相关）
- `skill-graph.ts` → `match.ts`（图谱匹配评分）
- `homeApi.ts` → `public.ts` + `person.ts`（首页数据分散到对应模块）

## 不涉及范围

- 不修改任何前端页面组件的 `import` 语句
- 不修改 `vite.config.ts` 等构建配置
- 不涉及后端接口变更

## 验收标准

1. 后端 118 个接口全部存在于前端 API 层
2. 路径与后端完全一致（路径参数、HTTP 方法一致）
3. 文件数量为 10 个（删除 3 个混合文件）
4. 无新增错误路径
5. TypeScript 类型安全（请求/响应类型正确）
