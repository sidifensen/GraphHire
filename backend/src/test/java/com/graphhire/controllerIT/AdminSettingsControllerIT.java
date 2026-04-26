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
class AdminSettingsControllerIT extends BaseControllerIT {

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
    @DisplayName("01 - 获取设置")
    void getSettings_Success() throws Exception {
        mockMvc.perform(get("/admin/settings")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").exists());
    }

    @Test
    @DisplayName("02 - 更新设置")
    void updateSettings_Success() throws Exception {
        String json = "{\"maintenanceMode\":true,\"maxUploadSizeMb\":30}";

        mockMvc.perform(put("/admin/settings")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.maintenanceMode").value(true));
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}