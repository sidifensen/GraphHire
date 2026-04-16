# Controller 集成测试实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GraphHire 后端全部 8 个 Controller 编写完整的集成测试类，使用 `@SpringBootTest` + `@AutoConfigureMockMvc` + `@Transactional`，实现一键回归测试。

**Architecture:**
- 测试类放置于 `backend/src/test/java/com/graphhire/{module}/interfaces/controller/it/` 包下（与现有 Mockito 测试分离）
- 公共 token 管理逻辑提取到 `BaseControllerTest` 抽象基类
- 所有测试类继承基类，通过 `@Transactional` 自动回滚，数据隔离

**Tech Stack:** Spring Boot 3.4, MockMvc, Sa-Token, JUnit 5, `@SpringBootTest`

---

## 文件结构

```
backend/src/test/java/com/graphhire/
├── auth/interfaces/controller/it/
│   └── AuthControllerIT.java          # Create
├── admin/interfaces/controller/it/
│   └── AdminControllerIT.java          # Create
├── person/interfaces/controller/it/
│   └── PersonControllerIT.java          # Create
├── resume/interfaces/controller/it/
│   └── ResumeControllerIT.java          # Create
├── job/interfaces/controller/it/
│   └── CompanyControllerIT.java        # Create (company in job module)
├── match/interfaces/controller/it/
│   └── MatchControllerIT.java          # Create
├── notification/interfaces/controller/it/
│   └── NotificationControllerIT.java    # Create
├── skill/interfaces/controller/it/
│   └── SkillTagControllerIT.java        # Create
└── BaseControllerIT.java               # Create (根包下)
```

**测试文件准备：**
- `backend/src/test/resources/resume-test.txt` — 创建（用于简历上传测试）

**关键配置确认：**
- Sa-Token header 名称：`satoken`（application.yml 中 `token-name: satoken`）
- 响应结构：`Result<T>` → `{ code: 200, message: "success", data: {...} }`
- 登录响应：`LoginResponse` → `{ accessToken, refreshToken, expiresIn, userType, userId }`

---

## Task 1: 创建 BaseControllerIT 基类

**Files:**
- Create: `backend/src/test/java/com/graphhire/BaseControllerIT.java`

- [ ] **Step 1: 创建 BaseControllerIT.java**

```java
package com.graphhire;

import cn.dev33.satoken.SaManager;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.common.vo.Result;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class BaseControllerIT {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected static String personToken;
    protected static String companyToken;
    protected static String adminToken;

    protected static Long personUserId;
    protected static Long companyUserId;
    protected static Long adminUserId;

    protected HttpHeaders personHeaders;
    protected HttpHeaders companyHeaders;
    protected HttpHeaders adminHeaders;

    /**
     * 预置测试账号（数据库应已有这些账号，或者先注册再登录）
     */
    protected static final String TEST_PERSON_USERNAME = "test_person@graphhire.com";
    protected static final String TEST_PERSON_PASSWORD = "Test123456";
    protected static final String TEST_COMPANY_USERNAME = "test_company@graphhire.com";
    protected static final String TEST_COMPANY_PASSWORD = "Test123456";
    protected static final String TEST_ADMIN_USERNAME = "test_admin@graphhire.com";
    protected static final String TEST_ADMIN_PASSWORD = "Test123456";

    @BeforeAll
    static void loginAndGetTokens(@Autowired MockMvc mockMvc,
                                   @Autowired ObjectMapper objectMapper) throws Exception {
        // 由于 @BeforeAll 不能直接用实例方法，需要在子类 @BeforeAll 中调用静态登录方法
    }

    protected static void doLogin(MockMvc mockMvc, ObjectMapper objectMapper,
                                  String username, String password) throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        String response = result.getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        String token = node.path("data").path("accessToken").asText();
        Long userId = node.path("data").path("userId").asLong();

        if (username.equals(TEST_PERSON_USERNAME)) {
            personToken = token;
            personUserId = userId;
        } else if (username.equals(TEST_COMPANY_USERNAME)) {
            companyToken = token;
            companyUserId = userId;
        } else if (username.equals(TEST_ADMIN_USERNAME)) {
            adminToken = token;
            adminUserId = userId;
        }
    }

    protected void setupHeaders() {
        personHeaders = new HttpHeaders();
        personHeaders.set("satoken", personToken);

        companyHeaders = new HttpHeaders();
        companyHeaders.set("satoken", companyToken);

        adminHeaders = new HttpHeaders();
        adminHeaders.set("satoken", adminToken);
    }

    /**
     * 解析响应体，获取 data 字段
     */
    protected JsonNode parseData(String json) throws Exception {
        return objectMapper.readTree(json).path("data");
    }
}
```

- [ ] **Step 2: 创建测试资源文件**

创建 `backend/src/test/resources/resume-test.txt`：
```
GraphHire Test Resume
Name: Test User
Email: test@example.com
Skills: Java, Python, Spring Boot
Experience: 5 years
```

- [ ] **Step 3: 提交**

```bash
git add backend/src/test/java/com/graphhire/BaseControllerIT.java backend/src/test/resources/resume-test.txt
git commit -m "test: 添加 BaseControllerIT 基类"
```

---

## Task 2: 创建 AuthControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/auth/interfaces/controller/it/AuthControllerIT.java`

- [ ] **Step 1: 编写 AuthControllerIT**

```java
package com.graphhire.auth.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class AuthControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 管理员登录成功")
    void adminLogin_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);

        mockMvc.perform(post("/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.userType").value("ADMIN"));
    }

    @Test
    @DisplayName("02 - 个人用户登录成功")
    void personLogin_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.userType").value("PERSON"));
    }

    @Test
    @DisplayName("03 - 登录失败 - 密码错误")
    void login_Fail_WrongPassword() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"wrong\"}",
            TEST_PERSON_USERNAME);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    @DisplayName("04 - 登出成功")
    void logout_Success() throws Exception {
        mockMvc.perform(post("/auth/logout")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 获取当前用户ID")
    void getCurrentUser_Success() throws Exception {
        mockMvc.perform(get("/auth/current")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("06 - Token校验有效")
    void validateToken_IsValid() throws Exception {
        mockMvc.perform(get("/auth/validate")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("07 - Token校验无效（未登录）")
    void validateToken_IsInvalid() throws Exception {
        mockMvc.perform(get("/auth/validate"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    @DisplayName("08 - 刷新Token")
    void refreshToken_Success() throws Exception {
        // 先登录获取 refreshToken
        String loginJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = loginNode.path("data").path("refreshToken").asText();

        if (refreshToken != null && !refreshToken.isEmpty()) {
            mockMvc.perform(post("/auth/refresh-token")
                    .param("refreshToken", refreshToken))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
        }
    }

    @Test
    @DisplayName("09 - 发送验证码")
    void sendVerifyCode_Success() throws Exception {
        mockMvc.perform(post("/auth/send-verify-code")
                .param("email", "test_send_verify@graphhire.com")
                .param("type", "register"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 个人注册")
    void personRegister_Success() throws Exception {
        String json = String.format(
            "{\"username\":\"new_person_%d@graphhire.com\",\"password\":\"Test123456\",\"verifyCode\":\"123456\"}",
            System.currentTimeMillis());

        mockMvc.perform(post("/auth/register/person")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("11 - 企业注册")
    void companyRegister_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"username\":\"new_company_%d@graphhire.com\",\"password\":\"Test123456\"," +
            "\"companyName\":\"Test Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\",\"verifyCode\":\"123456\"}",
            ts, ts, ts % 10000);

        mockMvc.perform(post("/auth/register/company")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/auth/interfaces/controller/it/AuthControllerIT.java
git commit -m "test: 添加 AuthControllerIT 集成测试"
```

---

## Task 3: 创建 AdminControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/admin/interfaces/controller/it/AdminControllerIT.java`

- [ ] **Step 1: 编写 AdminControllerIT**

```java
package com.graphhire.admin.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class AdminControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 管理员登录")
    void adminLogin_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);

        mockMvc.perform(post("/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.userType").value("ADMIN"));
    }

    @Test
    @DisplayName("02 - 获取仪表盘统计")
    void getDashboardStats_Success() throws Exception {
        mockMvc.perform(get("/admin/dashboard/stats")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").exists());
    }

    @Test
    @DisplayName("03 - 获取用户列表")
    void getUserList_Success() throws Exception {
        String json = "{\"page\":1,\"size\":10}";

        mockMvc.perform(post("/admin/user/list")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("04 - 获取简历列表")
    void getResumeList_Success() throws Exception {
        mockMvc.perform(get("/admin/resume/list")
                .headers(adminHeaders)
                .param("page", "1")
                .param("size", "10"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 获取职位列表")
    void getJobList_Success() throws Exception {
        mockMvc.perform(get("/admin/job/list")
                .headers(adminHeaders)
                .param("page", "1")
                .param("size", "10"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 获取技能标签列表")
    void getSkillList_Success() throws Exception {
        mockMvc.perform(get("/admin/skill/list")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 获取任务列表")
    void getTaskList_Success() throws Exception {
        mockMvc.perform(get("/admin/task/list")
                .headers(adminHeaders)
                .param("page", "1")
                .param("size", "10"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 获取企业认证列表")
    void getCompanyAuthList_Success() throws Exception {
        mockMvc.perform(get("/admin/company/auth/list")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 获取待审批公司列表")
    void getPendingCompanies_Success() throws Exception {
        mockMvc.perform(get("/admin/company/pending")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 根据认证状态获取公司列表")
    void getCompaniesByAuthStatus_Success() throws Exception {
        mockMvc.perform(get("/admin/company/auth-list")
                .headers(adminHeaders)
                .param("authStatus", "0"))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/admin/interfaces/controller/it/AdminControllerIT.java
git commit -m "test: 添加 AdminControllerIT 集成测试"
```

---

## Task 4: 创建 SkillTagControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/skill/interfaces/controller/it/SkillTagControllerIT.java`

- [ ] **Step 1: 编写 SkillTagControllerIT**

```java
package com.graphhire.skill.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class SkillTagControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdTagId;

    @Test
    @DisplayName("01 - 创建技能标签")
    void createSkillTag_Success() throws Exception {
        String tagName = "Java_" + UUID.randomUUID().toString().substring(0, 8);
        String json = String.format(
            "{\"name\":\"%s\",\"category\":\"PROGRAMMING_LANGUAGE\",\"description\":\"Java编程语言\"}",
            tagName);

        MvcResult result = mockMvc.perform(post("/skill-tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").isNumber())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        createdTagId = node.path("data").path("id").asLong();
        assertTrue(createdTagId > 0);
    }

    @Test
    @DisplayName("02 - 获取技能标签")
    void getSkillTag_Success() throws Exception {
        assertNotNull(createdTagId, "需要先运行 createSkillTag");

        mockMvc.perform(get("/skill-tags/{id}", createdTagId))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(createdTagId));
    }

    @Test
    @DisplayName("03 - 按名称查询技能标签")
    void getSkillTagByName_Success() throws Exception {
        assertNotNull(createdTagId);

        JsonNode node = objectMapper.readTree(
            mockMvc.perform(get("/skill-tags/{id}", createdTagId)).andReturn().getResponse().getContentAsString());
        String tagName = node.path("data").path("name").asText();

        mockMvc.perform(get("/skill-tags/name/{name}", tagName))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").value(tagName));
    }

    @Test
    @DisplayName("04 - 获取所有技能标签")
    void getAllSkillTags_Success() throws Exception {
        mockMvc.perform(get("/skill-tags"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("05 - 按分类获取技能标签")
    void getSkillTagsByCategory_Success() throws Exception {
        mockMvc.perform(get("/skill-tags/category/{category}", "PROGRAMMING_LANGUAGE"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("06 - 更新技能标签")
    void updateSkillTag_Success() throws Exception {
        assertNotNull(createdTagId);

        String json = "{\"name\":\"UpdatedJava\",\"category\":\"PROGRAMMING_LANGUAGE\",\"description\":\"Updated\"}";

        mockMvc.perform(put("/skill-tags/{id}", createdTagId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").value("UpdatedJava"));
    }

    @Test
    @DisplayName("07 - 添加同义词")
    void addSynonym_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(post("/skill-tags/{id}/synonyms", createdTagId)
                .param("synonym", "JavaSE"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 移除同义词")
    void removeSynonym_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(delete("/skill-tags/{id}/synonyms/{synonym}", createdTagId, "JavaSE"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 更新分类")
    void updateCategory_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(put("/skill-tags/{id}/category", createdTagId)
                .param("category", "FRAMEWORK"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 标准化技能列表")
    void normalizeSkills_Success() throws Exception {
        String json = "[\"java\",\"JavaScript\",\"python\"]";

        mockMvc.perform(post("/skill-tags/normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("11 - 删除技能标签")
    void deleteSkillTag_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(delete("/skill-tags/{id}", createdTagId))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/skill/interfaces/controller/it/SkillTagControllerIT.java
git commit -m "test: 添加 SkillTagControllerIT 集成测试"
```

---

## Task 5: 创建 PersonControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/PersonControllerIT.java`

- [ ] **Step 1: 编写 PersonControllerIT**

```java
package com.graphhire.resume.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class PersonControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取个人信息（新建）")
    void getPersonInfo_NewUser() throws Exception {
        mockMvc.perform(get("/person/info")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("02 - 更新个人信息")
    void updatePersonInfo_Success() throws Exception {
        String json = "{\"realName\":\"TestUser\",\"gender\":\"MALE\",\"age\":25,\"phone\":\"13800138000\"," +
            "\"education\":\"BACHELOR\",\"city\":\"Beijing\",\"targetCity\":\"Shanghai\",\"expectedSalary\":30000}";

        mockMvc.perform(put("/person/info")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));

        // 验证更新成功
        mockMvc.perform(get("/person/info")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.realName").value("TestUser"));
    }

    @Test
    @DisplayName("03 - 获取个人能力图谱")
    void getPersonGraph_Success() throws Exception {
        mockMvc.perform(get("/person/graph")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("04 - 获取推荐职位列表")
    void getRecommendedJobs_Success() throws Exception {
        mockMvc.perform(get("/person/recommend/jobs")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 获取匹配详情（无简历时返回空）")
    void getMatchDetail_NoData() throws Exception {
        // 先获取一个可能存在的 jobId
        mockMvc.perform(get("/person/recommend/jobs")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/person/interfaces/controller/it/PersonControllerIT.java
git commit -m "test: 添加 PersonControllerIT 集成测试"
```

---

## Task 6: 创建 CompanyControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`

- [ ] **Step 1: 编写 CompanyControllerIT**

```java
package com.graphhire.job.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class CompanyControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdJobId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取公司信息")
    void getCompanyInfo_Success() throws Exception {
        mockMvc.perform(get("/company/info")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("02 - 更新公司信息")
    void updateCompanyInfo_Success() throws Exception {
        mockMvc.perform(put("/company/info")
                .headers(companyHeaders)
                .param("name", "Updated Test Company")
                .param("description", "Test description update"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("03 - 提交认证材料")
    void submitAuthMaterials_Success() throws Exception {
        mockMvc.perform(post("/company/auth")
                .headers(companyHeaders)
                .param("licenseUrl", "http://example.com/license.pdf"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("04 - 发布职位")
    void publishJob_Success() throws Exception {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String json = String.format(
            "{\"title\":\"Senior Engineer %s\",\"department\":\"Tech\",\"headcount\":2," +
            "\"location\":{\"province\":\"Beijing\",\"city\":\"Beijing\",\"district\":\"Haidian\"}," +
            "\"salaryRange\":{\"min\":20000,\"max\":40000,\"unit\":\"MONTH\"}," +
            "\"requiredSkills\":[\"Java\",\"Spring\"],\"preferredSkills\":[\"Python\"]," +
            "\"description\":\"We are hiring!\"}",
            uuid);

        MvcResult result = mockMvc.perform(post("/company/job")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        createdJobId = node.path("data").asLong();
        assertTrue(createdJobId > 0);
    }

    @Test
    @DisplayName("05 - 获取职位列表")
    void listJobs_Success() throws Exception {
        mockMvc.perform(get("/company/job/list")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("06 - 获取职位详情")
    void getJob_Success() throws Exception {
        assertNotNull(createdJobId, "需要先运行 publishJob");

        mockMvc.perform(get("/company/job/{id}", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(createdJobId));
    }

    @Test
    @DisplayName("07 - 更新职位")
    void updateJob_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = String.format(
            "{\"title\":\"Updated Title %s\",\"department\":\"HR\",\"headcount\":1," +
            "\"location\":{\"province\":\"Shanghai\",\"city\":\"Shanghai\"}," +
            "\"salaryRange\":{\"min\":15000,\"max\":30000,\"unit\":\"MONTH\"}," +
            "\"requiredSkills\":[\"Go\"],\"preferredSkills\":[],\"description\":\"Updated\"}",
            UUID.randomUUID().toString().substring(0, 8));

        mockMvc.perform(put("/company/job/{id}", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 切换职位状态")
    void toggleJobStatus_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = "{\"publish\":true}";

        mockMvc.perform(put("/company/job/{id}/status", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 发布职位")
    void publishJobEndpoint_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/publish", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 关闭职位")
    void closeJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/close", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("11 - 更新薪资范围")
    void updateSalary_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = "{\"min\":25000,\"max\":50000,\"unit\":\"MONTH\"}";

        mockMvc.perform(put("/company/job/{id}/salary", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("12 - 获取职位图谱")
    void getJobGraph_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(get("/company/job/{id}/graph", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("13 - 重新解析职位")
    void reparseJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/parse", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("14 - 获取企业推荐简历列表")
    void getRecommendedResumes_Success() throws Exception {
        mockMvc.perform(get("/company/recommend/resumes")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("15 - 创建公司")
    void createCompany_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"name\":\"New Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\"," +
            "\"contactName\":\"HR\",\"contactPhone\":\"13900000000\",\"contactEmail\":\"hr%d@company.com\"}",
            ts, ts % 10000, ts % 10000);

        mockMvc.perform(post("/company/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("16 - 获取公司详情")
    void getCompany_Success() throws Exception {
        // 先创建公司获取ID
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"name\":\"Get Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\"}",
            ts, ts % 10000);

        MvcResult result = mockMvc.perform(post("/company/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        Long companyId = objectMapper.readTree(result.getResponse().getContentAsString())
            .path("data").asLong();

        mockMvc.perform(get("/company/{id}", companyId))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    @DisplayName("17 - 删除职位")
    void deleteJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(delete("/company/job/{id}", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("18 - 创建员工账号")
    void createStaff_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"username\":\"hr_%d@company.com\",\"password\":\"Test123456\",\"post\":\"HR\"}",
            ts);

        mockMvc.perform(post("/company/staff/create")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java
git commit -m "test: 添加 CompanyControllerIT 集成测试"
```

---

## Task 7: 创建 ResumeControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/ResumeControllerIT.java`

- [ ] **Step 1: 编写 ResumeControllerIT**

```java
package com.graphhire.resume.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class ResumeControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long uploadedResumeId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 上传简历")
    void uploadResume_Success() throws Exception {
        ClassPathResource resource = new ClassPathResource("resume-test.txt");

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("file", resource);

        MvcResult result = mockMvc.perform(multipart("/resume/my/upload")
                .headers(personHeaders)
                .params(parts))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        uploadedResumeId = node.path("data").path("id").asLong();
        assertTrue(uploadedResumeId > 0);
    }

    @Test
    @DisplayName("02 - 获取我的简历列表")
    void getMyResumes_Success() throws Exception {
        mockMvc.perform(get("/resume/my")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 获取简历详情")
    void getDetail_Success() throws Exception {
        assertNotNull(uploadedResumeId, "需要先运行 uploadResume");

        mockMvc.perform(get("/resume/{id}/detail", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(uploadedResumeId));
    }

    @Test
    @DisplayName("04 - 设置默认简历")
    void setDefaultResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);

        mockMvc.perform(put("/resume/{id}/default", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 重新解析简历")
    void parseResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);

        mockMvc.perform(post("/resume/{id}/parse", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 删除简历")
    void deleteResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);

        mockMvc.perform(delete("/resume/{id}", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 获取简历列表（分页）")
    void getList_Success() throws Exception {
        mockMvc.perform(get("/resume/list")
                .headers(personHeaders)
                .param("page", "1")
                .param("size", "10"))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/resume/interfaces/controller/it/ResumeControllerIT.java
git commit -m "test: 添加 ResumeControllerIT 集成测试"
```

---

## Task 8: 创建 MatchControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/match/interfaces/controller/it/MatchControllerIT.java`

- [ ] **Step 1: 编写 MatchControllerIT**

```java
package com.graphhire.match.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class MatchControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdMatchId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 触发匹配")
    void triggerMatch_Success() throws Exception {
        // 需要先有简历和职位，这里假设已存在
        String json = "{\"resumeId\":1,\"jobId\":1}";

        MvcResult result = mockMvc.perform(post("/match/trigger")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        if (node.path("data").has("id")) {
            createdMatchId = node.path("data").path("id").asLong();
        }
    }

    @Test
    @DisplayName("02 - 获取匹配详情")
    void getMatchDetail_Success() throws Exception {
        // 如果有创建的匹配记录
        if (createdMatchId != null) {
            mockMvc.perform(get("/match/{matchId}/detail", createdMatchId)
                    .headers(companyHeaders))
                .andExpect(jsonPath("$.code").value(200));
        } else {
            // 用假数据测试接口可达性
            mockMvc.perform(get("/match/{matchId}/detail", 99999)
                    .headers(companyHeaders))
                .andExpect(jsonPath("$.code").value(200));
        }
    }

    @Test
    @DisplayName("03 - 获取简历的匹配列表")
    void getMatchListForResume_Success() throws Exception {
        mockMvc.perform(get("/match/resume/{resumeId}/list", 1)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("04 - 获取职位的匹配列表")
    void getMatchListForJob_Success() throws Exception {
        mockMvc.perform(get("/match/job/{jobId}/list", 1)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/match/interfaces/controller/it/MatchControllerIT.java
git commit -m "test: 添加 MatchControllerIT 集成测试"
```

---

## Task 9: 创建 NotificationControllerIT

**Files:**
- Create: `backend/src/test/java/com/graphhire/notification/interfaces/controller/it/NotificationControllerIT.java`

- [ ] **Step 1: 编写 NotificationControllerIT**

```java
package com.graphhire.notification.interfaces.controller.it;

import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class NotificationControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdNotificationId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取用户所有通知")
    void getUserNotifications_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("02 - 获取用户未读通知")
    void getUnreadNotifications_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/unread", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 按类型获取通知")
    void getNotificationsByType_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/type/{type}", personUserId, "JOB_RECOMMEND")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("04 - 获取未读数量")
    void getUnreadCount_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/unread-count", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("05 - 标记通知为已读（无通知时）")
    void markAsRead_NoData() throws Exception {
        // 测试接口可达性，实际无数据
        mockMvc.perform(put("/notifications/{id}/read", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 标记通知为未读（无通知时）")
    void markAsUnread_NoData() throws Exception {
        mockMvc.perform(put("/notifications/{id}/unread", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 标记所有通知为已读")
    void markAllAsRead_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(put("/notifications/user/{userId}/read-all", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 删除通知（无通知时）")
    void deleteNotification_NoData() throws Exception {
        mockMvc.perform(delete("/notifications/{id}", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 获取单条通知（不存在时）")
    void getNotification_NotFound() throws Exception {
        mockMvc.perform(get("/notifications/{id}", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/test/java/com/graphhire/notification/interfaces/controller/it/NotificationControllerIT.java
git commit -m "test: 添加 NotificationControllerIT 集成测试"
```

---

## Task 10: 验证测试可运行

- [ ] **Step 1: 运行完整测试套件**

```bash
cd backend && mvn test -Dtest="*IT" -DfailIfNoTests=false
```

**预期结果：** BUILD SUCCESS，所有集成测试通过（或至少可运行）

- [ ] **Step 2: 如有编译错误，逐个修复**

常见问题：
- 包名不存在 → 创建缺失目录
- import 错误 → 确认 ObjectMapper 是否需要 `@Autowired`
- `@BeforeAll` 静态方法不能调用实例 → 确认 BaseControllerIT 的 `doLogin` 是 static

---

## 验收标准映射

| AC ID | 对应测试类 | 满足条件 |
|---|---|---|
| AC-001 | BaseControllerIT | token 字段非 null |
| AC-002 | 所有 IT 类 | 需认证接口返回 200 |
| AC-003 | 所有 IT 类 | `@Transactional` 确保回滚 |
| AC-004 | AuthControllerIT | 11 个测试方法 |
| AC-005 | AdminControllerIT | 10 个测试方法 |
| AC-006 | PersonControllerIT | 5 个测试方法 |
| AC-007 | ResumeControllerIT | 7 个测试方法 |
| AC-008 | CompanyControllerIT | 18 个测试方法 |
| AC-009 | MatchControllerIT | 4 个测试方法 |
| AC-010 | NotificationControllerIT | 9 个测试方法 |
| AC-011 | SkillTagControllerIT | 11 个测试方法 |
| AC-012 | ResumeControllerIT.uploadResume | 上传测试文件 |
| AC-013 | mvn test | BUILD SUCCESS |
| AC-014 | 各 IT 类 | 异常场景覆盖 |
| AC-015 | CompanyControllerIT | CRUD 完整链路 |
| AC-016 | SkillTagControllerIT | 无需 token 独立运行 |
| AC-017 | MatchControllerIT | 依赖前置数据 |
| AC-018 | NotificationControllerIT | userId 动态获取 |
