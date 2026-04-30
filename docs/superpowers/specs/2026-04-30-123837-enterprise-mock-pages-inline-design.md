# 企业端 Mock 页面内联迁移设计

**日期**: 2026-04-30  
**范围**: `frontend/src/app/enterprise/*/page.tsx` 与 `frontend/src/app/enterprise/_mock/pages/*`

---

## 背景与目标

当前企业端 9 个路由页面采用“路由页仅转发、真实实现位于 `_mock/pages`”的方式。目标是把页面实现直接放入对应的 Next.js `page.tsx`，不再依赖 `_mock/pages` 转发导入，并将路由能力统一到 Next.js 体系（`next/link`、`next/navigation`）。

## 方案比较

### 方案 A（推荐）：逐页内联 + 路由 API 替换 + 删除 `_mock/pages`
- 做法：把 `_mock/pages/*.tsx` 内容迁移到各自 `page.tsx`，替换 `react-router-dom` 为 Next API，修正企业端路由前缀，删除 `_mock/pages` 目录。
- 优点：结构与 Next App Router 对齐；后续维护路径单一；可消除“壳文件”层。
- 风险：一次性改动文件较多，需要测试兜底。

### 方案 B：保留 `_mock/pages`，仅改名为 `components` 并继续 import
- 优点：改动最小。
- 缺点：仍不是“页面实现在 `page.tsx`”；不满足本次诉求。

### 方案 C：`page.tsx` 中内联薄包装函数，真实 JSX 放同目录子文件
- 优点：避免超大 `page.tsx`。
- 缺点：仍存在“额外引用层”，与“不要再引用”冲突。

## 设计决策

采用方案 A。迁移后每个企业端 `page.tsx` 直接导出页面实现，不再引用 `_mock/pages/*`。

## 组件与文件边界

- 修改：
  - `frontend/src/app/enterprise/candidates/[id]/page.tsx`
  - `frontend/src/app/enterprise/dashboard/page.tsx`
  - `frontend/src/app/enterprise/employees/page.tsx`
  - `frontend/src/app/enterprise/jobs/page.tsx`
  - `frontend/src/app/enterprise/jobs/new/page.tsx`
  - `frontend/src/app/enterprise/jobs/[id]/page.tsx`
  - `frontend/src/app/enterprise/jobs/[id]/edit/page.tsx`
  - `frontend/src/app/enterprise/notifications/page.tsx`
  - `frontend/src/app/enterprise/recommendations/page.tsx`
- 删除：
  - `frontend/src/app/enterprise/_mock/pages/*.tsx`
- 新增测试：
  - `frontend/tests/pages/enterprise/mock-pages-inline-migration.test.ts`

## 路由与数据流

- `Link`：`react-router-dom` 的 `to` 改为 `next/link` 的 `href`。
- 参数读取：`useParams` 改为 `next/navigation` 的 `useParams`。
- 查询参数：`useSearchParams` 改为 `next/navigation` 的 `useSearchParams`。
- 编程式跳转：`useNavigate` 改为 `useRouter`（`push`/`back`）。
- 企业端内部跳转统一使用 `/enterprise/*` 前缀。
- 业务数据仍使用 `@/app/enterprise/_mock/lib/mockData`，本次不改数据层。

## 错误处理与回归控制

- 通过静态回归测试保证：
  - 9 个企业端 `page.tsx` 不再导入 `_mock/pages`。
  - 9 个页面不再依赖 `react-router-dom`。
  - `_mock/pages` 目录被移除。
- 编译与测试按仓库要求执行：
  - `frontend`: `npm run build`、`npm run test:run`
  - `backend`: `mvn compile`、`mvn test`
- 浏览器验证使用 CDP 打开企业端页面检查可加载。
