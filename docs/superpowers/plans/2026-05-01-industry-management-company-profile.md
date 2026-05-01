# 行业管理与企业资料编辑改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立行业主数据管理能力，将公司行业从自由文本升级为行业ID引用，并新增企业主可用的公司资料编辑页面与接口。

**Architecture:** 采用“先迁移再改造”策略：数据库新增 `industry` 与 `company.industry_id`，执行历史数据回填后删除 `company.industry`。后端新增行业领域链路并改造公司资料读写聚合返回 `industryId/industryName`。前端增加管理端行业页和企业端资料编辑页，行业输入改为启用行业下拉。

**Tech Stack:** Spring Boot + MyBatis-Plus + PostgreSQL + Next.js + TypeScript + 现有 Admin/Enterprise 组件体系 + MCP(PostgreSQL/CDP)

---

### Task 1: 数据库迁移与初始化脚本

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_01_015__industry_table_and_company_industry_id.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Modify: `backend/src/main/resources/db/init.sql`
- Test: `backend/src/test/java/com/graphhire/BaseControllerIT.java`

- [ ] **Step 1: 写失败验证SQL思路（迁移前校验）**

```sql
-- 预期：旧列存在，新列不存在（迁移前）
SELECT column_name FROM information_schema.columns
WHERE table_name = 'company' AND column_name IN ('industry', 'industry_id');
```

- [ ] **Step 2: 运行校验并确认失败点是“industry_id不存在”**

Run: `mvn -q -DskipTests compile`（确保可执行迁移）
Expected: 编译通过，但迁移前数据库查询仅含 `industry`

- [ ] **Step 3: 编写迁移脚本（新增表/回填/删列）**

```sql
CREATE TABLE IF NOT EXISTS industry (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  enabled SMALLINT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted SMALLINT NOT NULL DEFAULT 0
);

ALTER TABLE company ADD COLUMN IF NOT EXISTS industry_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_company_industry_id ON company(industry_id);

INSERT INTO industry(name, enabled, sort_order)
SELECT DISTINCT c.industry, 1, 0
FROM company c
WHERE c.industry IS NOT NULL AND btrim(c.industry) <> ''
ON CONFLICT (name) DO NOTHING;

-- 追加假数据（至少20）
INSERT INTO industry(name, enabled, sort_order) VALUES
('金融科技',1,10),('电子商务',1,20),('医疗健康',1,30),('教育培训',1,40),('游戏',1,50),
('企业服务',1,60),('消费品',1,70),('智能制造',1,80),('新能源',1,90),('物流供应链',1,100),
('文娱传媒',1,110),('房地产服务',1,120),('汽车出行',1,130),('农业科技',1,140),('政务服务',1,150),
('通信设备',1,160),('半导体',1,170),('人工智能平台',1,180),('本地生活',1,190),('跨境贸易',1,200)
ON CONFLICT (name) DO NOTHING;

UPDATE company c
SET industry_id = i.id
FROM industry i
WHERE c.industry = i.name AND c.industry_id IS NULL;

DO $$
DECLARE unmapped_count INT;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM company
  WHERE industry IS NOT NULL AND btrim(industry) <> '' AND industry_id IS NULL;

  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'Industry mapping failed, unmapped count: %', unmapped_count;
  END IF;
END $$;

ALTER TABLE company DROP COLUMN IF EXISTS industry;
```

- [ ] **Step 4: 运行迁移后校验（应通过）**

Run: `mvn test -Dtest=BaseControllerIT -DfailIfNoTests=false`
Expected: 启动测试上下文成功，schema可用且不因字段缺失失败

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/resources/db/migration/V2026_05_01_015__industry_table_and_company_industry_id.sql backend/src/main/resources/db/schema.sql backend/src/main/resources/db/init.sql backend/src/test/java/com/graphhire/BaseControllerIT.java
git commit -m "feat: 新增行业表并完成公司行业字段迁移"
```

### Task 2: 后端新增行业领域链路（TDD）

**Files:**
- Create: `backend/src/main/java/com/graphhire/industry/domain/model/Industry.java`
- Create: `backend/src/main/java/com/graphhire/industry/domain/repository/IndustryRepository.java`
- Create: `backend/src/main/java/com/graphhire/industry/infrastructure/persistence/po/IndustryPO.java`
- Create: `backend/src/main/java/com/graphhire/industry/infrastructure/persistence/mapper/IndustryMapper.java`
- Create: `backend/src/main/java/com/graphhire/industry/infrastructure/persistence/repository/IndustryRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/industry/application/service/IndustryAppService.java`
- Create: `backend/src/test/java/com/graphhire/industry/application/service/IndustryAppServiceTest.java`

- [ ] **Step 1: 先写失败测试（服务层）**

```java
@Test
void createIndustry_duplicateName_shouldThrow() {
    when(repository.findByName("互联网服务")).thenReturn(Optional.of(new Industry()));
    assertThrows(Exceptions.BusinessException.class, () -> service.create("互联网服务", 1, 10));
}
```

- [ ] **Step 2: 运行单测确认失败**

Run: `mvn -Dtest=IndustryAppServiceTest test`
Expected: FAIL，提示类/方法不存在

- [ ] **Step 3: 写最小实现使测试通过**

```java
@Transactional
public Industry create(String name, Integer enabled, Integer sortOrder) {
  repository.findByName(name).ifPresent(i -> { throw Exceptions.BusinessException.of("行业名称已存在"); });
  Industry industry = new Industry();
  industry.setName(name);
  industry.setEnabled(enabled == null ? 1 : enabled);
  industry.setSortOrder(sortOrder == null ? 0 : sortOrder);
  return repository.save(industry);
}
```

- [ ] **Step 4: 运行单测确认通过**

Run: `mvn -Dtest=IndustryAppServiceTest test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/graphhire/industry backend/src/test/java/com/graphhire/industry/application/service/IndustryAppServiceTest.java
git commit -m "feat: 新增行业领域与应用服务"
```

### Task 3: 管理端行业管理API（TDD）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminIndustryCreateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminIndustryUpdateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminIndustryStatusUpdateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminIndustryItemResponse.java`
- Create: `backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminIndustryControllerIT.java`

- [ ] **Step 1: 写失败接口测试**

```java
mockMvc.perform(get("/admin/industry/list").headers(adminHeaders))
  .andExpect(status().isOk())
  .andExpect(jsonPath("$.code").value(200));
```

- [ ] **Step 2: 运行测试确认失败（404）**

Run: `mvn -Dtest=AdminIndustryControllerIT test`
Expected: FAIL，接口不存在

- [ ] **Step 3: 实现控制器与服务最小逻辑**

```java
@GetMapping("/industry/list")
public Result<AdminPageResponse<AdminIndustryItemResponse>> getIndustryList(...) {
  return Result.success(adminAppService.getIndustryList(enabled, keyword, page, pageSize));
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `mvn -Dtest=AdminIndustryControllerIT test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/graphhire/admin backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminIndustryControllerIT.java
git commit -m "feat: 新增管理端行业管理接口"
```

### Task 4: 公司模型与接口改造为 industryId/industryName（TDD）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Company.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyPO.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyProfileResponse.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminCompanyAuthItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Test: `backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java`
- Test: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`

- [ ] **Step 1: 写失败测试：`/company/info` 返回新字段**

```java
assertNotNull(result.getData().industryId());
assertNotNull(result.getData().industryName());
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=CompanyControllerTest test`
Expected: FAIL，record字段不存在

- [ ] **Step 3: 最小实现通过测试**

```java
public record CompanyProfileResponse(..., Long industryId, String industryName, String scale, String address, String avatarUrl) {}
```

- [ ] **Step 4: 再补集成测试并通过**

Run: `mvn -Dtest=CompanyControllerIT test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/graphhire/job backend/src/main/java/com/graphhire/admin backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java
git commit -m "feat: 公司资料接口返回行业ID与行业名称"
```

### Task 5: 企业主公司资料更新接口（TDD）

**Files:**
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/request/CompanyProfileUpdateRequest.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`

- [ ] **Step 1: 写失败测试（OWNER成功/HR403/停用行业失败）**

```java
assertThrows(Exceptions.ForbiddenException.class, () -> companyController.updateCompanyProfile(request));
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=CompanyControllerTest test`
Expected: FAIL，接口/校验缺失

- [ ] **Step 3: 最小实现**

```java
@PutMapping("/profile")
public Result<Void> updateCompanyProfile(@RequestBody CompanyProfileUpdateRequest request) {
  CompanyStaff staff = currentStaffActive();
  assertOwner(staff);
  companyAppService.updateCompanyProfile(staff.getCompanyId(), request);
  return Result.success();
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `mvn -Dtest=CompanyControllerTest,CompanyControllerIT test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/graphhire/job backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java
git commit -m "feat: 新增企业主公司资料编辑接口与行业校验"
```

### Task 6: 前端管理端行业管理页面与菜单（TDD）

**Files:**
- Create: `frontend/src/app/admin/industry/page.tsx`
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`
- Modify: `frontend/src/lib/api/admin.ts`
- Create: `frontend/src/tests/pages/admin-industry.test.tsx`

- [ ] **Step 1: 写失败前端测试**

```tsx
expect(screen.getByText('行业管理')).toBeInTheDocument();
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend && npm run test:run -- admin-industry`
Expected: FAIL，页面/菜单不存在

- [ ] **Step 3: 实现页面与API封装**

```ts
getIndustryList: async (...) => {
  const response = await apiClient.get('/admin/industry/list', { params });
  return response.data;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd frontend && npm run test:run -- admin-industry`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/admin/industry/page.tsx frontend/src/components/admin/AdminSidebar.tsx frontend/src/lib/api/admin.ts frontend/src/tests/pages/admin-industry.test.tsx
git commit -m "feat: 管理端新增行业管理页面与菜单"
```

### Task 7: 前端企业端公司资料编辑页（TDD）

**Files:**
- Create: `frontend/src/app/enterprise/company/profile/page.tsx`
- Modify: `frontend/src/app/enterprise/_mock/constants.ts`
- Modify: `frontend/src/app/enterprise/_mock/components/TopNav.tsx`（若需新增入口）
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/lib/types/enterprise.ts`
- Create: `frontend/src/tests/pages/enterprise-company-profile.test.tsx`

- [ ] **Step 1: 写失败测试（下拉行业、保存提交industryId）**

```tsx
expect(screen.getByLabelText('所属行业')).toBeInTheDocument();
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend && npm run test:run -- enterprise-company-profile`
Expected: FAIL，页面不存在

- [ ] **Step 3: 实现页面与API交互**

```ts
updateProfile: async (data) => {
  await apiClient.put('/company/profile', data);
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd frontend && npm run test:run -- enterprise-company-profile`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/enterprise/company/profile/page.tsx frontend/src/app/enterprise/_mock/constants.ts frontend/src/app/enterprise/_mock/components/TopNav.tsx frontend/src/lib/api/company.ts frontend/src/lib/types/enterprise.ts frontend/src/tests/pages/enterprise-company-profile.test.tsx
git commit -m "feat: 企业端新增公司资料编辑页面"
```

### Task 8: 全量验证与浏览器CDP验收

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行后端编译与测试**

Run: `cd backend && mvn compile && mvn test`
Expected: 全部通过

- [ ] **Step 2: 运行前端构建与测试**

Run: `cd frontend && npm run build && npm run test:run`
Expected: 全部通过

- [ ] **Step 3: 使用CDP进行浏览器验收**

Run: 启动前后端后，通过 CDP 检查：
1. `/admin/industry` 页面可新增/编辑/停用行业
2. `/enterprise/company/profile` 仅下拉可选行业，保存成功

Expected: 两条主流程无阻断错误

- [ ] **Step 4: 更新发布说明**

```markdown
## [Unreleased]
### Added
- 管理端新增行业管理页面与行业接口
- 企业端新增公司资料编辑页面与企业主专属修改接口
### Changed
- 公司行业字段由文本迁移为行业ID引用
```

- [ ] **Step 5: 提交**

```bash
git add RELEASE-NOTES.md
git commit -m "docs: 更新行业管理与企业资料编辑发布说明"
```
