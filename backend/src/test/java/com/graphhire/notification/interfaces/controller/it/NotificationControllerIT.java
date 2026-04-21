package com.graphhire.notification.interfaces.controller.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.BaseControllerIT;
import com.graphhire.notification.domain.vo.NotificationType;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class NotificationControllerIT extends BaseControllerIT {

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

    private Long unreadNotificationId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper,
                          @Autowired AuthAppService authService,
                          @Autowired UserRepository userRepository,
                          @Autowired PasswordEncoder passwordEncoder,
                          @Autowired JdbcTemplate jdbcTemplate) throws Exception {
        ensureTokensInitialized(authService, userRepository, passwordEncoder, jdbcTemplate, mockMvc, objectMapper);
    }

    @BeforeEach
    void setUp() throws Exception {
        setupHeaders();
        companyHeaders = loginHeaders(TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        unreadNotificationId = ensureNotificationExists();
    }

    @Test
    @DisplayName("01 - 获取当前用户通知列表")
    void getMyNotifications_Success() throws Exception {
        mockMvc.perform(get("/notifications/me")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data[0].title").exists())
            .andExpect(jsonPath("$.data[0].type").exists());
    }

    @Test
    @DisplayName("02 - 获取当前用户未读通知")
    void getMyUnreadNotifications_Success() throws Exception {
        mockMvc.perform(get("/notifications/me/unread")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 按类型获取当前用户通知")
    void getMyNotificationsByType_Success() throws Exception {
        mockMvc.perform(get("/notifications/me/type/{type}", NotificationType.CANDIDATE_RECOMMENDATION.name())
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("04 - 获取当前用户未读数量")
    void getMyUnreadCount_Success() throws Exception {
        mockMvc.perform(get("/notifications/me/unread-count")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("05 - 标记单条通知为已读")
    void markAsRead_Success() throws Exception {
        mockMvc.perform(put("/notifications/{id}/read", unreadNotificationId)
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 标记当前用户全部通知为已读")
    void markAllAsRead_Success() throws Exception {
        mockMvc.perform(put("/notifications/me/read-all")
                .headers(companyHeaders))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    private HttpHeaders loginHeaders(String username, String password) throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        String token = objectMapper.readTree(mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn().getResponse().getContentAsString()).path("data").path("accessToken").asText();
        HttpHeaders headers = new HttpHeaders();
        headers.set("satoken", token);
        return headers;
    }

    private Long ensureNotificationExists() {
        Long existing = jdbcTemplate.query(
            "SELECT id FROM notification WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            rs -> rs.next() ? rs.getLong(1) : null,
            companyUserId
        );
        if (existing != null) {
            jdbcTemplate.update("UPDATE notification SET is_read = 0, update_time = NOW() WHERE id = ?", existing);
            return existing;
        }

        jdbcTemplate.update(
            "INSERT INTO notification (user_id, type, title, content, related_id, is_read, create_time, update_time) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())",
            companyUserId,
            NotificationType.CANDIDATE_RECOMMENDATION.getValue(),
            "收到候选人推荐",
            "有新的高匹配候选人可查看",
            1L
        );
        Long created = jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
        assertNotNull(created);
        return created;
    }
}
