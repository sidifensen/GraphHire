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
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

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
        mockMvc.perform(get("/chat/conversations").headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());

        String body = "{\"conversationId\":1,\"content\":\"你好，欢迎沟通\"}";
        mockMvc.perform(post("/chat/messages/text")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.messageId").isNumber());
    }
}
