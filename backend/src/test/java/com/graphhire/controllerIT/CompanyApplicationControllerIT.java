package com.graphhire.controllerIT;

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
class CompanyApplicationControllerIT extends BaseControllerIT {

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
    @DisplayName("01 - 获取申请列表")
    void getApplications_Success() throws Exception {
        mockMvc.perform(get("/company/applications")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("02 - 获取申请详情")
    void getApplicationDetail_Success() throws Exception {
        mockMvc.perform(get("/company/applications/{id}", 1)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("03 - 更新申请状态")
    void updateStatus_Success() throws Exception {
        mockMvc.perform(put("/company/applications/{id}/status", 1)
                .headers(companyHeaders)
                .param("status", "REJECTED"))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("04 - 发送面试邀请")
    void sendInterviewInvitation_Success() throws Exception {
        String json = "{\"interviewTime\":\"2026-05-01T10:00:00\",\"location\":\"会议室A\",\"remark\":\"请准时参加\"}";

        mockMvc.perform(post("/company/applications/{id}/interview", 1)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("05 - 拒绝申请")
    void rejectApplication_Success() throws Exception {
        mockMvc.perform(post("/company/applications/{id}/reject", 1)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("06 - 接受申请")
    void acceptApplication_Success() throws Exception {
        mockMvc.perform(post("/company/applications/{id}/accept", 1)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("07 - 加入人才库")
    void addToTalentPool_Success() throws Exception {
        String json = "{\"resumeId\":1,\"note\":\"优秀人才\"}";

        mockMvc.perform(post("/company/talent-pool")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("08 - 获取人才库")
    void getTalentPool_Success() throws Exception {
        mockMvc.perform(get("/company/talent-pool")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("09 - 从人才库移除")
    void removeFromTalentPool_Success() throws Exception {
        mockMvc.perform(delete("/company/talent-pool/1")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}