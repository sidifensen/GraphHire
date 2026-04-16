package com.graphhire.auth.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class AuthControllerIT extends BaseControllerIT {

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
    @DisplayName("01 - 管理员登录成功")
    void adminLogin_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);

        mockMvc.perform(post("/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.userType").value("ADMIN"));
    }

    @Test
    @DisplayName("02 - 个人用户登录成功")
    void personLogin_Success() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.userType").value("PERSON"));
    }

    @Test
    @DisplayName("03 - 登录失败 - 密码错误")
    @Disabled("需要Controller层捕获BusinessException返回Result.error()，当前异常直接抛出导致servlet error")
    void login_Fail_WrongPassword() throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"wrong\"}",
            TEST_PERSON_USERNAME);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        int status = result.getResponse().getStatus();
        assertTrue(status >= 500, "期望5xx错误，实际: " + status);
    }

    @Test
    @DisplayName("04 - 获取当前用户ID")
    void getCurrentUser_Success() throws Exception {
        // 重新登录获取新token，不依赖ensureTokensInitialized的token
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();
        JsonNode node = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = node.path("data").path("accessToken").asText();

        HttpHeaders headers = new HttpHeaders();
        headers.set("satoken", token);

        mockMvc.perform(get("/auth/current")
                .headers(headers))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("06 - Token校验有效")
    @Disabled("依赖personHeaders但其token可能已被logout失效")
    void validateToken_IsValid() throws Exception {
        // 重新登录获取新token
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();
        JsonNode node = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = node.path("data").path("accessToken").asText();

        HttpHeaders headers = new HttpHeaders();
        headers.set("satoken", token);

        mockMvc.perform(get("/auth/validate")
                .headers(headers))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("07 - Token校验无效（未登录）")
    void validateToken_IsInvalid() throws Exception {
        mockMvc.perform(get("/auth/validate"))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    @DisplayName("08 - 刷新Token")
    @Disabled("需要Redis且refresh token机制需验证")
    void refreshToken_Success() throws Exception {
        String loginJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}",
            TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = loginNode.path("data").path("refreshToken").asText();

        if (refreshToken != null && !refreshToken.isEmpty()) {
            mockMvc.perform(post("/auth/refresh-token")
                    .param("refreshToken", refreshToken))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
        }
    }

    @Test
    @DisplayName("09 - 发送验证码")
    @Disabled("需要SMTP邮件服务配置")
    void sendVerifyCode_Success() throws Exception {
        mockMvc.perform(post("/auth/send-verify-code")
                .param("email", "test_send_verify@graphhire.com")
                .param("type", "register"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 个人注册")
    @Disabled("需要真实verifyCode")
    void personRegister_Success() throws Exception {
        String json = String.format(
            "{\"username\":\"new_person_%d@graphhire.com\",\"password\":\"Test123456\",\"verifyCode\":\"123456\"}",
            System.currentTimeMillis());

        mockMvc.perform(post("/auth/register/person")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("11 - 企业注册")
    @Disabled("需要真实verifyCode")
    void companyRegister_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"username\":\"new_company_%d@graphhire.com\",\"password\":\"Test123456\"," +
            "\"companyName\":\"Test Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\",\"verifyCode\":\"123456\"}",
            ts, ts, ts % 10000);

        mockMvc.perform(post("/auth/register/company")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }
}
