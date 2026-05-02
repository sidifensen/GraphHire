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

    private Long graphMatchJobId;

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
        graphMatchJobId = ensureGraphMatchJobExists();
    }

    @Test
    @DisplayName("01 - 获取技能图谱匹配分数")
    void getGraphMatchScore_Success() throws Exception {
        mockMvc.perform(get("/match/person/{personId}/job/{jobId}/graph-score", personUserId, graphMatchJobId)
                .headers(personHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.totalScore").isNumber())
            .andExpect(jsonPath("$.data.matchLevel").isString());
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

    private Long ensureGraphMatchJobExists() {
        Long companyId = jdbcTemplate.queryForObject("SELECT id FROM company WHERE user_id = ?", Long.class, companyUserId);
        Long existingId = jdbcTemplate.query(
            "SELECT id FROM job WHERE company_id = ? AND title = ? AND deleted = 0 ORDER BY id LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null,
            companyId,
            "匹配图谱测试岗位"
        );
        if (existingId != null) {
            return existingId;
        }

        jdbcTemplate.update(
            "INSERT INTO job (company_id, title, city, salary_min, salary_max, salary_unit, skills, status, description, create_time, update_time, deleted, education) " +
                "VALUES (?, ?, ?, ?, ?, ?, ARRAY['Java','Spring Boot']::varchar[], ?, ?, NOW(), NOW(), 0, ?)",
            companyId,
            "匹配图谱测试岗位",
            "北京",
            18000,
            30000,
            "MONTH",
            1,
            "匹配图谱测试职位",
            3
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }
}
