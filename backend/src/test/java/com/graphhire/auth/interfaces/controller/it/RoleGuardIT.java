package com.graphhire.auth.interfaces.controller.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class RoleGuardIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc,
                          @Autowired ObjectMapper objectMapper,
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
    @DisplayName("PERSON 访问管理接口应被拒绝")
    void personShouldNotAccessAdminApi() throws Exception {
        mockMvc.perform(get("/admin/dashboard/stats").headers(personHeaders))
            .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("ADMIN 访问企业接口应被拒绝")
    void adminShouldNotAccessCompanyApi() throws Exception {
        mockMvc.perform(get("/company/dashboard").headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("当前登录上下文应返回 userType")
    void authContextShouldContainUserType() throws Exception {
        mockMvc.perform(get("/auth/context").headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.userId").isNumber())
            .andExpect(jsonPath("$.data.userType").value("ADMIN"));
    }
}
