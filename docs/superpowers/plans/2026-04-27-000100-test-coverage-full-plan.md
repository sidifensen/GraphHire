# 测试全覆盖实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 GraphHire 所有后端接口和前端页面补齐测试，达到 100% 覆盖率

**Architecture:** 后端采用 Controller IT (MockMvc) + Service 单元测试 (Mockito)；前端采用 Vitest + React Testing Library + msw Mock

**Tech Stack:** JUnit 5, Mockito, Spring Boot Test, Vitest, React Testing Library, msw

---

## 文件结构

### 后端待创建 Controller IT

| 文件 | 对应 Controller | 接口数 |
|------|----------------|--------|
| `backend/src/test/java/com/graphhire/controllerIT/PasswordControllerIT.java` | PasswordController | 2 |
| `backend/src/test/java/com/graphhire/controllerIT/MatchGraphControllerIT.java` | MatchGraphController | 1 |
| `backend/src/test/java/com/graphhire/controllerIT/PersonApplicationControllerIT.java` | PersonApplicationController | 7 |
| `backend/src/test/java/com/graphhire/controllerIT/CompanyApplicationControllerIT.java` | CompanyApplicationController | 10 |
| `backend/src/test/java/com/graphhire/controllerIT/AdminUserControllerIT.java` | AdminUserController | 1 |
| `backend/src/test/java/com/graphhire/controllerIT/AdminSettingsControllerIT.java` | AdminSettingsController | 2 |

### 前端待创建页面测试

#### 管理后台页面 (6个)
- `frontend/tests/pages/admin/login.test.tsx`
- `frontend/tests/pages/admin/users.test.tsx`
- `frontend/tests/pages/admin/skill-tags.test.tsx`
- `frontend/tests/pages/admin/enterprise-review.test.tsx`
- `frontend/tests/pages/admin/task-monitor.test.tsx`
- `frontend/tests/pages/admin/settings.test.tsx`

#### 企业端页面 (6个)
- `frontend/tests/pages/enterprise/dashboard.test.tsx`
- `frontend/tests/pages/enterprise/jobs.test.tsx`
- `frontend/tests/pages/enterprise/jobs-new.test.tsx`
- `frontend/tests/pages/enterprise/jobs-id.test.tsx`
- `frontend/tests/pages/enterprise/jobs-id-edit.test.tsx`
- `frontend/tests/pages/enterprise/employees.test.tsx`

#### 用户端页面 (14个)
- `frontend/tests/pages/user/jobs.test.tsx`
- `frontend/tests/pages/user/jobs-id.test.tsx`
- `frontend/tests/pages/user/companies.test.tsx`
- `frontend/tests/pages/user/companies-id.test.tsx`
- `frontend/tests/pages/user/resume-manage.test.tsx`
- `frontend/tests/pages/user/applications.test.tsx`
- `frontend/tests/pages/user/notifications.test.tsx`
- `frontend/tests/pages/user/skill-graph.test.tsx`

---

## Task 1: PasswordControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/PasswordControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/auth/interfaces/controller/PasswordController.java`

- [ ] **Step 1: 创建 PasswordControllerIT.java**

```java
package com.graphhire.controllerIT;

import com.graphhire.auth.domain.PasswordResetRequest;
import com.graphhire.config.EmbeddedRedisConfig;
import com.graphhire.config.SecurityConfig;
import com.graphhire.auth.application.PasswordAppService;
import com.graphhire.auth.domain.port.PasswordResetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PasswordController.class)
@Import({SecurityConfig.class, EmbeddedRedisConfig.class})
class PasswordControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PasswordAppService passwordAppService;

    @MockBean
    private PasswordResetRepository passwordResetRepository;

    @Test
    @WithMockUser
    void sendResetCode_shouldReturnOk() throws Exception {
        when(passwordAppService.sendResetCode(any())).thenReturn(true);

        mockMvc.perform(post("/api/password/send-code")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void resetPassword_shouldReturnOk() throws Exception {
        when(passwordAppService.resetPassword(any())).thenReturn(true);

        mockMvc.perform(post("/api/password/reset")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"code\":\"123456\",\"newPassword\":\"NewPass123!\"}"))
                .andExpect(status().isOk());
    }
}
```

---

## Task 2: MatchGraphControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/MatchGraphControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/match/interfaces/controller/MatchGraphController.java`

- [ ] **Step 1: 创建 MatchGraphControllerIT.java**

```java
package com.graphhire.controllerIT;

import com.graphhire.config.SecurityConfig;
import com.graphhire.config.EmbeddedRedisConfig;
import com.graphhire.match.application.MatchGraphAppService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MatchGraphController.class)
@Import({SecurityConfig.class, EmbeddedRedisConfig.class})
class MatchGraphControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchGraphAppService matchGraphAppService;

    @Test
    @WithMockUser
    void buildMatchGraph_shouldReturnOk() throws Exception {
        when(matchGraphAppService.buildMatchGraph(anyLong(), anyString())).thenReturn("graph-id-123");

        mockMvc.perform(post("/api/match/graph/build")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"personId\":1,\"jobId\":100}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getMatchGraph_shouldReturnOk() throws Exception {
        when(matchGraphAppService.getMatchGraph(anyLong())).thenReturn("{}");

        mockMvc.perform(get("/api/match/graph/1"))
                .andExpect(status().isOk());
    }
}
```

---

## Task 3: PersonApplicationControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/PersonApplicationControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/application/interfaces/controller/PersonApplicationController.java`

- [ ] **Step 1: 创建 PersonApplicationControllerIT.java** (7 接口)

测试接口：
- POST /api/person/applications - 创建申请
- GET /api/person/applications - 获取我的申请列表
- GET /api/person/applications/{id} - 获取申请详情
- PUT /api/person/applications/{id}/withdraw - 撤回申请
- GET /api/person/applications/stats - 获取申请统计
- GET /api/person/applications/check/{jobId} - 检查是否已申请
- DELETE /api/person/applications/{id} - 删除申请

---

## Task 4: CompanyApplicationControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/CompanyApplicationControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`

- [ ] **Step 1: 创建 CompanyApplicationControllerIT.java** (10 接口)

测试接口：
- GET /api/company/applications - 获取收到的申请列表
- GET /api/company/applications/{id} - 获取申请详情
- PUT /api/company/applications/{id}/process - 处理申请（通过/拒绝）
- PUT /api/company/applications/{id}/interview - 安排面试
- POST /api/company/applications/batch-process - 批量处理
- GET /api/company/applications/stats - 申请统计
- GET /api/company/applications/export - 导出申请
- GET /api/company/jobs/{jobId}/applications - 某职位的所有申请
- PUT /api/company/applications/{id}/archive - 归档申请
- GET /api/company/applications/analytics - 申请分析

---

## Task 5: AdminUserControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/AdminUserControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminUserController.java`

- [ ] **Step 1: 创建 AdminUserControllerIT.java** (1 接口)

测试接口：
- GET /api/admin/users/me - 获取当前管理员信息

---

## Task 6: AdminSettingsControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/controllerIT/AdminSettingsControllerIT.java`
- Ref: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminSettingsController.java`

- [ ] **Step 1: 创建 AdminSettingsControllerIT.java** (2 接口)

测试接口：
- GET /api/admin/settings - 获取系统设置
- PUT /api/admin/settings - 更新系统设置

---

## Task 7-30: 前端页面测试

按组分配给子代理：
- **Group A**: 管理后台页面 (6个)
- **Group B**: 企业端页面 (6个)
- **Group C**: 用户端页面 (8个)

每个测试文件需包含：
1. Mock msw handlers
2. 页面渲染测试
3. 关键交互测试
4. 路由守卫测试（如有）

---

## 验收标准

1. 后端: `mvn test` 全部通过
2. 前端: `npm run test:run` 全部通过
3. `npm run build` 和 `mvn compile` 成功
4. 浏览器验证关键页面加载正常

---

## 执行方式

使用 superpowers:subagent-driven-development 并行分配任务给多个子代理：
- 后端 6 个 Controller IT → 1 个子代理
- 前端 20 个页面测试 → 3 个子代理（管理/企业/用户）
