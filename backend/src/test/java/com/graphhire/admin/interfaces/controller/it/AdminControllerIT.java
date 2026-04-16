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