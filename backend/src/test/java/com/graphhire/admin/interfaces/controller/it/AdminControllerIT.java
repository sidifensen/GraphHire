package com.graphhire.admin.interfaces.controller.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class AdminControllerIT extends BaseControllerIT {

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

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper,
                          @Autowired AuthAppService authService,
                          @Autowired UserRepository userRepository,
                          @Autowired PasswordEncoder passwordEncoder,
                          @Autowired JdbcTemplate jdbcTemplate) throws Exception {
        ensureTokensInitialized(authService, userRepository, passwordEncoder, jdbcTemplate, mockMvc, objectMapper);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 管理员登录")
    void adminLoginSuccess() throws Exception {
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
    @DisplayName("02 - 仪表盘统计")
    void dashboardStatsSuccess() throws Exception {
        mockMvc.perform(get("/admin/dashboard/stats").headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.totalUsers").exists())
            .andExpect(jsonPath("$.data.pendingCompanyAudit").exists())
            .andExpect(jsonPath("$.data.trend").isArray());
    }

    @Test
    @DisplayName("03 - 企业审核列表")
    void companyAuthListSuccess() throws Exception {
        mockMvc.perform(get("/admin/company/auth-list")
                .headers(adminHeaders)
                .param("status", "PENDING")
                .param("page", "1")
                .param("pageSize", "10"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.list").isArray())
            .andExpect(jsonPath("$.data.total").exists());
    }

    @Test
    @DisplayName("04 - 更新企业审核状态")
    void updateCompanyAuthSuccess() throws Exception {
        Long pendingCompanyId = findPendingCompanyId();
        assumeTrue(pendingCompanyId != null, "无可审批企业，跳过用例");

        String body = "{\"status\":\"APPROVED\"}";
        mockMvc.perform(put("/admin/company/auth/" + pendingCompanyId)
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("05 - 用户列表")
    void userListSuccess() throws Exception {
        mockMvc.perform(get("/admin/user/list")
                .headers(adminHeaders)
                .param("type", "PERSON")
                .param("status", "ACTIVE")
                .param("page", "1")
                .param("pageSize", "10"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.list").isArray())
            .andExpect(jsonPath("$.data.total").exists());
    }

    @Test
    @DisplayName("06 - 更新用户状态")
    void updateUserStatusSuccess() throws Exception {
        String body = "{\"status\":\"DISABLED\"}";
        mockMvc.perform(put("/admin/user/1/status")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 技能标签列表")
    void skillListSuccess() throws Exception {
        mockMvc.perform(get("/admin/skill/list")
                .headers(adminHeaders)
                .param("category", "技术技能")
                .param("keyword", "Java")
                .param("page", "1")
                .param("pageSize", "10"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    @DisplayName("08 - 任务列表")
    void taskListSuccess() throws Exception {
        mockMvc.perform(get("/admin/task/list")
                .headers(adminHeaders)
                .param("type", "RESUME_PARSE")
                .param("status", "FAILED")
                .param("page", "1")
                .param("pageSize", "10"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.summary").exists())
            .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    @DisplayName("09 - 单任务重试")
    void retryTaskSuccess() throws Exception {
        Long failedTaskId = findFailedTaskId();
        assumeTrue(failedTaskId != null, "无失败任务，跳过用例");

        mockMvc.perform(post("/admin/task/" + failedTaskId + "/retry")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 批量通过企业")
    void batchApproveCompanySuccess() throws Exception {
        Long pendingCompanyId = findPendingCompanyId();
        assumeTrue(pendingCompanyId != null, "无可审批企业，跳过用例");

        String body = "{\"ids\":[" + pendingCompanyId + "]}";
        mockMvc.perform(post("/admin/company/batch/approve")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("11 - 批量拒绝企业")
    void batchRejectCompanySuccess() throws Exception {
        Long pendingCompanyId = findPendingCompanyId();
        assumeTrue(pendingCompanyId != null, "无可审批企业，跳过用例");

        String body = "{\"ids\":[" + pendingCompanyId + "],\"reason\":\"材料不完整\"}";
        mockMvc.perform(post("/admin/company/batch/reject")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("12 - 批量禁用用户")
    void batchDisableUserSuccess() throws Exception {
        String body = "{\"userIds\":[1]}";
        mockMvc.perform(post("/admin/user/batch/disable")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("13 - 批量重试任务")
    void batchRetryTaskSuccess() throws Exception {
        Long failedTaskId = findFailedTaskId();
        assumeTrue(failedTaskId != null, "无失败任务，跳过用例");

        String body = "{\"taskIds\":[" + failedTaskId + "]}";
        mockMvc.perform(post("/admin/task/batch/retry")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200));
    }

    private Long findPendingCompanyId() {
        return jdbcTemplate.query("SELECT id FROM company WHERE auth_status = 0 ORDER BY id LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null);
    }

    private Long findFailedTaskId() {
        return jdbcTemplate.query("SELECT id FROM parse_task WHERE status = 3 ORDER BY id LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null);
    }
}
