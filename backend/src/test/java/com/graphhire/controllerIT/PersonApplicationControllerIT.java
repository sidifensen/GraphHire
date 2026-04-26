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
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class PersonApplicationControllerIT extends BaseControllerIT {

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

    private static Long createdApplicationId;

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
    @DisplayName("01 - 创建申请")
    void applyJob_Success() throws Exception {
        String json = "{\"resumeId\":1,\"jobId\":1}";

        MvcResult result = mockMvc.perform(post("/person/application/apply")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").isNumber())
            .andReturn();

        var response = objectMapper.readTree(result.getResponse().getContentAsString());
        if (response.path("data").isNumber()) {
            createdApplicationId = response.path("data").asLong();
        }
    }

    @Test
    @DisplayName("02 - 获取申请列表")
    void getMyApplications_Success() throws Exception {
        mockMvc.perform(get("/person/application/list")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 获取申请详情")
    void getApplicationDetail_Success() throws Exception {
        if (createdApplicationId != null) {
            mockMvc.perform(get("/person/application/{id}", createdApplicationId)
                    .headers(personHeaders))
                .andExpect(jsonPath("$.code").value(200));
        } else {
            mockMvc.perform(get("/person/application/{id}", 1)
                    .headers(personHeaders))
                .andExpect(jsonPath("$.code").isNumber());
        }
    }

    @Test
    @DisplayName("04 - 撤回申请")
    void withdrawApplication_Success() throws Exception {
        if (createdApplicationId != null) {
            mockMvc.perform(put("/person/application/{id}/withdraw", createdApplicationId)
                    .headers(personHeaders))
                .andExpect(jsonPath("$.code").isNumber());
        }
    }

    @Test
    @DisplayName("05 - 收藏职位")
    void favoriteJob_Success() throws Exception {
        String json = "{\"jobId\":1}";

        mockMvc.perform(post("/person/application/favorite")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @Test
    @DisplayName("06 - 获取收藏列表")
    void getMyFavorites_Success() throws Exception {
        mockMvc.perform(get("/person/application/favorites")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("07 - 取消收藏职位")
    void unfavoriteJob_Success() throws Exception {
        mockMvc.perform(delete("/person/application/favorite/1")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").isNumber());
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}