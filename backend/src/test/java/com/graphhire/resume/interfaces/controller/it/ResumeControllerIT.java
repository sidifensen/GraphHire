package com.graphhire.resume.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class ResumeControllerIT extends BaseControllerIT {

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

    private static Long uploadedResumeId;

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
    @DisplayName("01 - 上传简历")
    void uploadResume_Success() throws Exception {
        ClassPathResource resource = new ClassPathResource("resume-test.pdf");
        byte[] fileContent = resource.getInputStream().readAllBytes();
        MockMultipartFile file = new MockMultipartFile("file", "resume-test.pdf", "application/pdf", fileContent);

        MvcResult result = mockMvc.perform(multipart("/resume/my/upload")
                .file(file)
                .param("refreshAllMatches", "true")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        uploadedResumeId = node.path("data").path("id").asLong();
        assertTrue(uploadedResumeId > 0);
    }

    @Test
    @DisplayName("02 - 获取我的简历列表")
    void getMyResumes_Success() throws Exception {
        mockMvc.perform(get("/resume/my")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 获取简历详情")
    void getDetail_Success() throws Exception {
        assertNotNull(uploadedResumeId, "需要先运行 uploadResume");

        mockMvc.perform(get("/resume/{id}/detail", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(uploadedResumeId));
    }

    @Test
    @DisplayName("04 - 设置默认简历")
    void setDefaultResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);
        jdbcTemplate.update(
            "UPDATE resume SET parse_status = 2, is_default = 0, update_time = NOW() WHERE id = ?",
            uploadedResumeId
        );

        mockMvc.perform(put("/resume/{id}/default", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("05 - 重新解析简历")
    void parseResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);

        mockMvc.perform(post("/resume/{id}/parse", uploadedResumeId)
                .param("refreshAllMatches", "true")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 删除简历")
    void deleteResume_Success() throws Exception {
        assertNotNull(uploadedResumeId);

        mockMvc.perform(delete("/resume/{id}", uploadedResumeId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 获取简历列表（分页）")
    void getList_Success() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO resume (user_id, file_name, file_path, file_type, file_size, parse_status, parse_result, is_default, create_time, update_time, deleted) " +
                "VALUES (?, 'mine.pdf', 's3://resumes/mine.pdf', 'pdf', 100, 2, '{\"a\":1}', 0, NOW(), NOW(), 0)",
            personUserId
        );
        jdbcTemplate.update(
            "INSERT INTO resume (user_id, file_name, file_path, file_type, file_size, parse_status, parse_result, is_default, create_time, update_time, deleted) " +
                "VALUES (?, 'other.pdf', 's3://resumes/other.pdf', 'pdf', 100, 2, '{\"x\":2}', 0, NOW(), NOW(), 0)",
            companyUserId
        );

        mockMvc.perform(get("/resume/list")
                .headers(personHeaders)
                .param("page", "1")
                .param("size", "10"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(result -> {
                JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
                JsonNode records = root.path("data").path("records");
                assertTrue(records.isArray(), "records should be array");
                for (JsonNode record : records) {
                    assertEquals(personUserId.longValue(), record.path("userId").asLong(), "should only return current user's resume");
                    JsonNode parseResult = record.get("parseResult");
                    if (parseResult != null && !parseResult.isNull()) {
                        fail("parseResult should not be exposed in /resume/list");
                    }
                }
            });
    }
}
