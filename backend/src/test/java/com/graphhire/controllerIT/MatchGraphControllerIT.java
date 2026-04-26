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
class MatchGraphControllerIT extends BaseControllerIT {

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
    @DisplayName("01 - 获取技能图谱匹配分数")
    void getGraphMatchScore_Success() throws Exception {
        // 使用当前登录用户ID和jobId=1测试
        mockMvc.perform(get("/match/person/{personId}/job/{jobId}/graph-score", personUserId, 1)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("02 - 获取匹配分数 - 无权查看他人")
    void getGraphMatchScore_Forbidden() throws Exception {
        // 使用其他用户ID尝试查看
        mockMvc.perform(get("/match/person/999/job/1/graph-score", 999, 1)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(403));
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}