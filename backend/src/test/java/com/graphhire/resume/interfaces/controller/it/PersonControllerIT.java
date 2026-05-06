package com.graphhire.resume.interfaces.controller.it;

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
class PersonControllerIT extends BaseControllerIT {

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
        jdbcTemplate.update("DELETE FROM person_info WHERE user_id = ?", personUserId);
        jdbcTemplate.execute("SELECT setval('person_info_id_seq', COALESCE((SELECT MAX(id) FROM person_info), 1))");
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取个人信息（新建）")
    void getPersonInfo_NewUser() throws Exception {
        mockMvc.perform(get("/person/info")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("02 - 更新个人信息")
    void updatePersonInfo_Success() throws Exception {
        String json = "{\"realName\":\"TestUser\",\"gender\":1,\"age\":25,\"phone\":\"13800138000\"," +
            "\"education\":\"BACHELOR\",\"city\":\"Beijing\",\"targetCity\":\"Shanghai\",\"expectedSalary\":30000}";

        mockMvc.perform(put("/person/info")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));

        // 验证更新成功
        mockMvc.perform(get("/person/info")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.realName").value("TestUser"));
    }

    @Test
    @DisplayName("03 - 获取个人能力图谱")
    void getPersonGraph_Success() throws Exception {
        mockMvc.perform(get("/person/graph")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.industryMatch").exists())
            .andExpect(jsonPath("$.data.skillCategories").exists());
    }

    @Test
    @DisplayName("04 - 获取推荐职位列表")
    void getRecommendedJobs_Success() throws Exception {
        mockMvc.perform(get("/person/recommend/jobs")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 获取综合能力评估")
    void getAbilityAssessment_Success() throws Exception {
        mockMvc.perform(get("/person/ability-assessment")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.totalScore").exists())
            .andExpect(jsonPath("$.data.dimensions.breadth").exists());
    }

    @Test
    @DisplayName("06 - 获取匹配详情")
    void getMatchDetail_NoData() throws Exception {
        mockMvc.perform(get("/person/recommend/jobs")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }
}
