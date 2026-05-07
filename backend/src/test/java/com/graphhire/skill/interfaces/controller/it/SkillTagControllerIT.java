package com.graphhire.skill.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class SkillTagControllerIT extends BaseControllerIT {

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

    private static Long createdTagId;

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
    @DisplayName("01 - 创建技能标签")
    void createSkillTag_Success() throws Exception {
        String tagName = "Java_" + UUID.randomUUID().toString().substring(0, 8);
        String json = String.format(
            "{\"name\":\"%s\",\"category\":\"技术技能\",\"description\":\"Java编程语言\"}",
            tagName);

        MvcResult result = mockMvc.perform(post("/skill-tags")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").isNumber())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        createdTagId = node.path("data").path("id").asLong();
        assertTrue(createdTagId > 0);
    }

    @Test
    @DisplayName("02 - 获取技能标签")
    void getSkillTag_Success() throws Exception {
        assertNotNull(createdTagId, "需要先运行 createSkillTag");

        mockMvc.perform(get("/skill-tags/{id}", createdTagId))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(createdTagId));
    }

    @Test
    @DisplayName("03 - 按名称查询技能标签")
    void getSkillTagByName_Success() throws Exception {
        assertNotNull(createdTagId);

        JsonNode node = objectMapper.readTree(
            mockMvc.perform(get("/skill-tags/{id}", createdTagId)).andReturn().getResponse().getContentAsString());
        String tagName = node.path("data").path("name").asText();

        mockMvc.perform(get("/skill-tags/name/{name}", tagName))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").value(tagName));
    }

    @Test
    @DisplayName("04 - 获取所有技能标签")
    void getAllSkillTags_Success() throws Exception {
        mockMvc.perform(get("/skill-tags"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("05 - 更新技能标签")
    void updateSkillTag_Success() throws Exception {
        assertNotNull(createdTagId);

        String json = "{\"name\":\"UpdatedJava\",\"category\":\"技术技能\",\"description\":\"Updated\"}";

        mockMvc.perform(put("/skill-tags/{id}", createdTagId)
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").value("UpdatedJava"));
    }

    @Test
    @DisplayName("06 - 添加同义词")
    void addSynonym_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(post("/skill-tags/{id}/synonyms", createdTagId)
                .headers(adminHeaders)
                .param("synonym", "JavaSE"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 移除同义词")
    void removeSynonym_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(delete("/skill-tags/{id}/synonyms/{synonym}", createdTagId, "JavaSE")
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 标准化技能列表")
    void normalizeSkills_Success() throws Exception {
        String json = "[\"java\",\"JavaScript\",\"python\"]";

        mockMvc.perform(post("/skill-tags/normalize")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("09 - 删除技能标签")
    void deleteSkillTag_Success() throws Exception {
        assertNotNull(createdTagId);

        mockMvc.perform(delete("/skill-tags/{id}", createdTagId)
                .headers(adminHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 非管理员创建技能标签应被拒绝")
    void createSkillTag_ForbiddenForNonAdmin() throws Exception {
        String tagName = "Forbidden_" + UUID.randomUUID().toString().substring(0, 8);
        String json = String.format(
            "{\"name\":\"%s\",\"category\":\"技术技能\",\"description\":\"forbidden\"}",
            tagName);

        mockMvc.perform(post("/skill-tags")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("11 - 非管理员更新技能标签应被拒绝")
    void updateSkillTag_ForbiddenForNonAdmin() throws Exception {
        String tagName = "NeedAdmin_" + UUID.randomUUID().toString().substring(0, 8);
        String createJson = String.format(
            "{\"name\":\"%s\",\"category\":\"技术技能\",\"description\":\"seed\"}",
            tagName);
        MvcResult createResult = mockMvc.perform(post("/skill-tags")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();
        Long tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
            .path("data").path("id").asLong();

        String updateJson = "{\"name\":\"NeedAdminUpdated\",\"category\":\"技术技能\",\"description\":\"x\"}";
        mockMvc.perform(put("/skill-tags/{id}", tagId)
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("12 - 非管理员删除技能标签应被拒绝")
    void deleteSkillTag_ForbiddenForNonAdmin() throws Exception {
        String tagName = "NeedAdminDelete_" + UUID.randomUUID().toString().substring(0, 8);
        String createJson = String.format(
            "{\"name\":\"%s\",\"category\":\"技术技能\",\"description\":\"seed\"}",
            tagName);
        MvcResult createResult = mockMvc.perform(post("/skill-tags")
                .headers(adminHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();
        Long tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
            .path("data").path("id").asLong();

        mockMvc.perform(delete("/skill-tags/{id}", tagId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(403));
    }

    @AfterAll
    static void afterAll(@Autowired JdbcTemplate jdbcTemplate) {
        cleanupTestUsers(jdbcTemplate);
    }
}
