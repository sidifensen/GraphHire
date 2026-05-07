package com.graphhire.match.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
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

    @Autowired
    private AuthAppService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static Long createdMatchId;

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
    @DisplayName("01 - 触发匹配")
    void triggerMatch_Success() throws Exception {
        Long resumeId = jdbcTemplate.queryForObject(
            "SELECT id FROM resume WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            Long.class,
            personUserId
        );
        Long jobId = jdbcTemplate.queryForObject(
            "SELECT id FROM job WHERE company_id = (SELECT company_id FROM company_staff WHERE user_id = ? LIMIT 1) ORDER BY id DESC LIMIT 1",
            Long.class,
            companyUserId
        );
        String json = String.format("{\"resumeId\":%d,\"jobId\":%d}", resumeId, jobId);

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
        assertNotNull(createdMatchId);
        mockMvc.perform(get("/match/{matchId}/detail", createdMatchId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("03 - 获取简历的匹配列表")
    void getMatchListForResume_Success() throws Exception {
        Long resumeId = jdbcTemplate.queryForObject(
            "SELECT id FROM resume WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            Long.class,
            personUserId
        );
        mockMvc.perform(get("/match/resume/{resumeId}/list", resumeId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("04 - 获取职位的匹配列表")
    void getMatchListForJob_Success() throws Exception {
        Long jobId = jdbcTemplate.queryForObject(
            "SELECT id FROM job WHERE company_id = (SELECT company_id FROM company_staff WHERE user_id = ? LIMIT 1) ORDER BY id DESC LIMIT 1",
            Long.class,
            companyUserId
        );
        mockMvc.perform(get("/match/job/{jobId}/list", jobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/match/job/{jobId}/list", jobId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(403));
    }
}
