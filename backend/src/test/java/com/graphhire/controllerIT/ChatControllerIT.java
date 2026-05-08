package com.graphhire.controllerIT;

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
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChatControllerIT extends BaseControllerIT {

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
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

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
    @DisplayName("用户可发起会话并查看列表")
    void userCanStartConversationAndList() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.conversationId").isNumber());

        mockMvc.perform(get("/chat/conversations").headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("企业负责人可查看会话并发送消息")
    void recruiterCanListAndSendMessage() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.conversationId").isNumber());

        mockMvc.perform(get("/chat/conversations").headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());

        String body = "{\"conversationId\":3,\"content\":\"你好，欢迎沟通\"}";
        mockMvc.perform(post("/chat/messages/text")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.messageId").isNumber());
    }

    @Test
    @DisplayName("会话成员可以下载会话中的简历文件")
    void conversationMemberCanDownloadResumeFile() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.conversationId").isNumber());

        byte[] resumeBytes = "test-resume-content".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        MockMultipartFile resumeFile = new MockMultipartFile(
            "file",
            "resume-test.pdf",
            MediaType.APPLICATION_PDF_VALUE,
            resumeBytes
        );
        mockMvc.perform(multipart("/resume/my/upload")
                .file(resumeFile)
                .header("satoken", personToken))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").isNumber());

        Long resumeId = jdbcTemplate.queryForObject(
            "SELECT id FROM resume WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            Long.class,
            personUserId
        );

        String sendResumeBody = String.format("{\"conversationId\":3,\"resumeId\":%d}", resumeId);
        mockMvc.perform(post("/chat/messages/resume")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(sendResumeBody))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.messageId").isNumber());

        mockMvc.perform(get("/chat/conversations/3/resume/" + resumeId + "/download")
                .headers(companyHeaders))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("会话成员可以预览会话中的图片文件")
    void conversationMemberCanPreviewImageFile() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.conversationId").isNumber());

        MockMultipartFile imageFile = new MockMultipartFile(
            "file",
            "avatar.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "mock-image".getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );
        mockMvc.perform(multipart("/chat/messages/image")
                .file(imageFile)
                .param("conversationId", "3")
                .header("satoken", personToken))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.messageId").isNumber());

        Long imageMessageId = jdbcTemplate.queryForObject(
            "SELECT id FROM chat_message WHERE conversation_id = ? AND message_type = 2 ORDER BY id DESC LIMIT 1",
            Long.class,
            3L
        );

        mockMvc.perform(get("/chat/conversations/3/images/" + imageMessageId + "/preview")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(result -> {
                String contentType = result.getResponse().getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new AssertionError("expected image content type but was: " + contentType);
                }
            });
    }

    @Test
    @DisplayName("聊天图片上传应拒绝非图片类型")
    void imageUploadShouldRejectInvalidMime() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200));

        MockMultipartFile invalid = new MockMultipartFile(
            "file",
            "bad.txt",
            MediaType.TEXT_PLAIN_VALUE,
            "not-image".getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );
        mockMvc.perform(multipart("/chat/messages/image")
                .file(invalid)
                .param("conversationId", "3")
                .header("satoken", personToken))
            .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("聊天图片上传应拒绝超大文件")
    void imageUploadShouldRejectTooLargeFile() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200));

        byte[] largeBytes = new byte[6 * 1024 * 1024];
        MockMultipartFile tooLarge = new MockMultipartFile(
            "file",
            "large.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            largeBytes
        );
        mockMvc.perform(multipart("/chat/messages/image")
                .file(tooLarge)
                .param("conversationId", "3")
                .header("satoken", personToken))
            .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("聊天图片上传命中限流时返回429")
    void imageUploadShouldReturn429WhenRateLimited() throws Exception {
        String startBody = "{\"jobId\":1}";
        mockMvc.perform(post("/chat/conversations/start")
                .headers(personHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(startBody))
            .andExpect(jsonPath("$.code").value(200));

        // 清理当前用户聊天图片限流key，避免受其他测试污染
        stringRedisTemplate.delete("upload:rate-limit:chat-image:user:" + personUserId + ":tokens");
        stringRedisTemplate.delete("upload:rate-limit:chat-image:user:" + personUserId + ":ts");
        stringRedisTemplate.delete("upload:rate-limit:chat-image:global:tokens");
        stringRedisTemplate.delete("upload:rate-limit:chat-image:global:ts");

        byte[] imageBytes = "img".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        for (int i = 0; i < 22; i++) {
            MockMultipartFile image = new MockMultipartFile(
                "file",
                "avatar.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                imageBytes
            );
            var result = mockMvc.perform(multipart("/chat/messages/image")
                    .file(image)
                    .param("conversationId", "3")
                    .header("satoken", personToken))
                .andReturn();
            if (i == 21) {
                String content = result.getResponse().getContentAsString();
                if (!content.contains("\"code\":429")) {
                    throw new AssertionError("第22次上传应返回429，实际: " + content);
                }
            }
        }
    }
}
