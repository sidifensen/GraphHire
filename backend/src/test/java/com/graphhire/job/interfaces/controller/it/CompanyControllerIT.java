package com.graphhire.job.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
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

    @Autowired
    private AuthAppService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static Long createdJobId;
    private Long graphCompanyId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper,
                          @Autowired AuthAppService authService,
                          @Autowired UserRepository userRepository,
                          @Autowired PasswordEncoder passwordEncoder,
                          @Autowired JdbcTemplate jdbcTemplate) throws Exception {
        ensureTokensInitialized(authService, userRepository, passwordEncoder, jdbcTemplate, mockMvc, objectMapper);
    }

    @BeforeEach
    void setUp() throws Exception {
        setupHeaders();
        // 避免测试间状态污染：提交认证材料后会变为待审核，影响后续职位发布相关用例
        jdbcTemplate.update("UPDATE company SET auth_status = 1 WHERE user_id = ?", companyUserId);
        companyHeaders = loginHeaders(TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        graphCompanyId = jdbcTemplate.queryForObject("SELECT id FROM company WHERE user_id = ?", Long.class, companyUserId);
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
            "\"requiredSkills\":[\"Java\",\"Spring Boot\"],\"preferredSkills\":[\"Python\"]," +
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
            "\"requiredSkills\":[\"Python\"],\"preferredSkills\":[],\"description\":\"Updated\"}",
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
    @DisplayName("12 - 获取企业图谱")
    void getCompanyGraph_Success() throws Exception {
        ensureCompanyGraphJobExists();

        mockMvc.perform(get("/company/graph")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.companyId").value(graphCompanyId))
            .andExpect(jsonPath("$.data.nodes").isArray())
            .andExpect(jsonPath("$.data.edges").isArray());
    }

    @Test
    @DisplayName("13 - 获取企业推荐简历列表")
    void getRecommendedResumes_Success() throws Exception {
        mockMvc.perform(get("/company/recommend/resumes")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Disabled("不属于本次企业端页面真实数据接入范围")
    @DisplayName("15 - 创建公司")
    void createCompany_Success() throws Exception {
        long ts = System.currentTimeMillis();

        mockMvc.perform(post("/company/create")
                .headers(companyHeaders)
                .param("name", "New Company " + ts)
                .param("unifiedSocialCreditCode", "91110000000000" + (ts % 10000) + "X"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @Disabled("不属于本次企业端页面真实数据接入范围")
    @DisplayName("16 - 获取公司详情")
    void getCompany_Success() throws Exception {
        long ts = System.currentTimeMillis();

        MvcResult result = mockMvc.perform(post("/company/create")
                .headers(companyHeaders)
                .param("name", "Get Company " + ts)
                .param("unifiedSocialCreditCode", "91110000000000" + (ts % 10000) + "X"))
            .andReturn();

        Long companyId = objectMapper.readTree(result.getResponse().getContentAsString())
            .path("data").asLong();

        mockMvc.perform(get("/company/{id}", companyId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    @DisplayName("16 - 删除职位")
    void deleteJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(delete("/company/job/{id}", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("17 - 创建员工账号")
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

    @Test
    @DisplayName("18 - 获取企业首页聚合数据")
    void getDashboard_Success() throws Exception {
        mockMvc.perform(get("/company/dashboard")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.pendingApplicationCount").isNumber())
            .andExpect(jsonPath("$.data.newMatchCandidateCount").isNumber())
            .andExpect(jsonPath("$.data.activeJobCount").isNumber())
            .andExpect(jsonPath("$.data.recentJobs").isArray());
    }

    @Test
    @DisplayName("19 - 根据状态和关键字筛选职位列表")
    void listJobs_WithFilters() throws Exception {
        mockMvc.perform(get("/company/job/list")
                .headers(companyHeaders)
                .param("status", "PUBLISHED")
                .param("keyword", "Engineer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("20 - 获取员工列表")
    void getStaffList_Success() throws Exception {
        ensureExtraStaffExists();

        mockMvc.perform(get("/company/staff/list")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data[0].username").exists())
            .andExpect(jsonPath("$.data[0].post").exists());
    }

    @Test
    @DisplayName("21 - 获取员工统计")
    void getStaffStats_Success() throws Exception {
        ensureExtraStaffExists();

        mockMvc.perform(get("/company/staff/stats")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.totalCount").isNumber())
            .andExpect(jsonPath("$.data.ownerCount").isNumber())
            .andExpect(jsonPath("$.data.hrCount").isNumber());
    }

    @Test
    @DisplayName("22 - 重置员工密码")
    void resetStaffPassword_Success() throws Exception {
        Long staffId = ensureExtraStaffExists();

        mockMvc.perform(post("/company/staff/{staffId}/reset-password", staffId)
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.newPassword").isString());
    }

    @Test
    @DisplayName("23 - 传入其他 companyId 时拒绝访问企业图谱")
    void getCompanyGraph_WithOtherCompanyId_Forbidden() throws Exception {
        mockMvc.perform(get("/company/graph")
                .headers(companyHeaders)
                .param("companyId", String.valueOf(graphCompanyId + 9999)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(403));
    }

    private HttpHeaders loginHeaders(String username, String password) throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();
        String token = objectMapper.readTree(result.getResponse().getContentAsString()).path("data").path("accessToken").asText();
        HttpHeaders headers = new HttpHeaders();
        headers.set("satoken", token);
        return headers;
    }

    private Long ensureExtraStaffExists() {
        Long companyId = jdbcTemplate.queryForObject("SELECT id FROM company WHERE user_id = ?", Long.class, companyUserId);
        Long existing = jdbcTemplate.query(
            "SELECT cs.id FROM company_staff cs JOIN sys_user su ON su.id = cs.user_id WHERE cs.company_id = ? AND cs.post = 'HR' ORDER BY cs.id LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null,
            companyId
        );
        if (existing != null) {
            return existing;
        }

        long ts = System.currentTimeMillis();
        String username = "enterprise_hr_" + ts + "@graphhire.com";
        String json = String.format("{\"username\":\"%s\",\"password\":\"Test123456\",\"post\":\"HR\"}", username);
        try {
            mockMvc.perform(post("/company/staff/create")
                    .headers(companyHeaders)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(jsonPath("$.code").value(200));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return jdbcTemplate.queryForObject(
            "SELECT cs.id FROM company_staff cs JOIN sys_user su ON su.id = cs.user_id WHERE su.username = ?",
            Long.class,
            username
        );
    }

    private void ensureCompanyGraphJobExists() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM job WHERE company_id = ? AND title = ? AND deleted = 0",
            Integer.class,
            graphCompanyId,
            "企业图谱测试岗位"
        );
        if (count != null && count > 0) {
            return;
        }

        jdbcTemplate.update(
            "INSERT INTO job (company_id, title, city, salary_min, salary_max, salary_unit, skills, status, description, create_time, update_time, deleted) " +
                "VALUES (?, ?, ?, ?, ?, ?, ARRAY['Java','Spring Boot']::varchar[], ?, ?, NOW(), NOW(), 0)",
            graphCompanyId,
            "企业图谱测试岗位",
            "北京",
            20000,
            35000,
            "MONTH",
            1,
            "企业图谱测试职位"
        );
    }
}
