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
class PasswordControllerIT extends BaseControllerIT {

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
    @DisplayName("01 - 发送重置码")
    void sendResetCode_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\"}", TEST_PERSON_USERNAME);

        mockMvc.perform(post("/auth/send-reset-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("02 - 发送重置码 - 用户不存在")
    void sendResetCode_UserNotFound() throws Exception {
        String json = "{\"username\":\"nonexistent@graphhire.com\"}";

        mockMvc.perform(post("/auth/send-reset-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}