# User Company Page Real API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让用户端公司列表页与详情页完全对接真实后端，并支持地点/行业/规模筛选及本地持久化。

**Architecture:** 后端扩展 `/public/companies` 筛选与返回字段，前端复用职位页筛选能力抽取共享组件，列表与详情页统一走 `publicApi`。通过后端 IT + 前端 Vitest 覆盖主要契约与交互。

**Tech Stack:** Spring Boot + MyBatis（后端）、Next.js + React + Vitest + RTL（前端）

---

### Task 1: 后端公开公司接口筛选契约测试（RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicCompanyControllerIT.java`

- [ ] **Step 1: 增加行业/规模/城市筛选失败测试用例**
```java
@Test
@DisplayName("公开企业列表支持行业、规模、城市筛选并返回新增字段")
void searchCompanies_supportsIndustryScaleCityFilters() throws Exception {
    // Arrange: 准备两家认证企业，不同行业/规模/城市
    // Act: 调用 /public/companies?industryLeafIds=...&companyScaleCode=...&cityList=...
    // Assert: 只命中目标公司，且返回 industryId/industryName/scale
}
```

- [ ] **Step 2: 运行单测确认失败**
Run: `mvn -Dtest=PublicCompanyControllerIT test`
Expected: FAIL（接口尚未支持新增参数/字段）

### Task 2: 后端实现公开公司筛选与字段扩展（GREEN）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicCompanyCardResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`

- [ ] **Step 1: 扩展 DTO 字段**
```java
public record PublicCompanyCardResponse(
    Long id,
    String name,
    String city,
    Integer jobCount,
    String summary,
    String authStatus,
    String avatarUrl,
    Long industryId,
    String industryName,
    String scale
) {}
```

- [ ] **Step 2: Controller 新增筛选参数并实现过滤**
```java
@GetMapping
public Result<PageResult<PublicCompanyCardResponse>> searchCompanies(
    @RequestParam(required = false) String keyword,
    @RequestParam(required = false) List<Long> industryLeafIds,
    @RequestParam(required = false) String companyScaleCode,
    @RequestParam(required = false) List<String> cityList,
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "10") Integer size) {
   // 过滤 keyword/industry/scale/city
}
```

- [ ] **Step 3: 补 industryName 映射与 scale 透传**
```java
Map<Long, String> industryNameMap = industryAppService.listIndustries(1)...;
// toCard(...) 填充 industryId/industryName/scale
```

- [ ] **Step 4: 运行后端测试验证通过**
Run: `mvn -Dtest=PublicCompanyControllerIT test`
Expected: PASS

### Task 3: 前端 API 契约测试与类型扩展（RED→GREEN）

**Files:**
- Modify: `frontend/tests/lib/api/public.test.ts`
- Modify: `frontend/src/lib/api/public.ts`

- [ ] **Step 1: 新增 companies.search 参数透传测试（失败）**
```ts
it('passes industryLeafIds/companyScaleCode/cityList to public companies search', async () => {
  // 断言 apiClient.get 调用 params 包含新增筛选字段
});
```

- [ ] **Step 2: 扩展 public.ts 中 Company 类型与 search 参数**
```ts
export interface Company {
  id: number;
  name: string;
  city?: string | null;
  jobCount?: number;
  summary?: string;
  authStatus?: string;
  avatarUrl?: string | null;
  industryId?: number | null;
  industryName?: string | null;
  scale?: string | null;
}
```

- [ ] **Step 3: 运行前端 API 测试验证通过**
Run: `npm run test:run -- tests/lib/api/public.test.ts`
Expected: PASS

### Task 4: 抽取用户筛选共享模块（地点/行业弹窗）

**Files:**
- Create: `frontend/src/features/user-filters/constants.ts`
- Create: `frontend/src/features/user-filters/tree.ts`
- Create: `frontend/src/features/user-filters/location.ts`
- Create: `frontend/src/features/user-filters/LocationFilterModal.tsx`
- Create: `frontend/src/features/user-filters/IndustryFilterModal.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`

- [ ] **Step 1: 抽出热门城市、规模选项、城市标准化工具**
- [ ] **Step 2: 抽出行业树与通用弹窗组件**
- [ ] **Step 3: 职位页替换为共享组件，保持现有行为不变**
- [ ] **Step 4: 运行职位页测试确保无回归**
Run: `npm run test:run -- frontend/tests/pages/user-jobs-page.test.tsx`
Expected: PASS

### Task 5: 公司列表页改造（RED→GREEN）

**Files:**
- Create: `frontend/tests/pages/user-companies-page.test.tsx`
- Modify: `frontend/src/app/(user)/companies/page.tsx`

- [ ] **Step 1: 新增列表页失败测试**
```ts
it('loads companies via public api and sends location/industry/scale filters', ...)
it('persists filters to localStorage and restores on reload', ...)
```

- [ ] **Step 2: 重构公司列表页为真实接口驱动**
- 移除 `MOCK_COMPANIES`
- 加载行业树与省市
- 接入热门地点、更多地点弹窗
- 接入热门行业、更多行业弹窗
- 接入公司规模筛选（编码）
- 发起 `publicApi.companies.search`

- [ ] **Step 3: 增加本地持久化**
```ts
const STORAGE_KEY = 'graphhire.user.companies.filters.v1';
// 初始化恢复 + 筛选变化写入
```

- [ ] **Step 4: 运行公司列表页测试**
Run: `npm run test:run -- frontend/tests/pages/user-companies-page.test.tsx`
Expected: PASS

### Task 6: 公司详情页改造（RED→GREEN）

**Files:**
- Create: `frontend/tests/pages/user-company-detail-page.test.tsx`
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`

- [ ] **Step 1: 新增详情页失败测试**
```ts
it('loads company detail and open jobs from public api', ...)
```

- [ ] **Step 2: 详情页接入真实接口并去除 mock 字段区域**
- 调 `publicApi.companies.getById(id)`
- 调 `publicApi.jobs.search({ companyId: id, page: 1, size: 10 })`
- 渲染真实字段与在招职位

- [ ] **Step 3: 运行详情页测试**
Run: `npm run test:run -- frontend/tests/pages/user-company-detail-page.test.tsx`
Expected: PASS

### Task 7: 全量改动验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 前端验证（公司页改动）**
Run: `npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: 前端测试**
Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: 后端验证（涉及后端改动）**
Run: `mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 4: 后端测试**
Run: `mvn test`
Expected: PASS

- [ ] **Step 5: 更新发布说明**
- 在 `RELEASE-NOTES.md` 追加本次“用户端公司页真实接口 + 筛选能力对齐”条目。
