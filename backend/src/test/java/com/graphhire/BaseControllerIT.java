package com.graphhire;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import cn.hutool.crypto.digest.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class BaseControllerIT {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected AuthAppService authService;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    protected static String personToken;
    protected static String companyToken;
    protected static String adminToken;

    protected static Long personUserId;
    protected static Long companyUserId;
    protected static Long adminUserId;

    protected HttpHeaders personHeaders;
    protected HttpHeaders companyHeaders;
    protected HttpHeaders adminHeaders;

    protected static final String TEST_PERSON_USERNAME = "test_person@graphhire.com";
    protected static final String TEST_PERSON_PASSWORD = "Test123456";
    protected static final String TEST_COMPANY_USERNAME = "test_company@graphhire.com";
    protected static final String TEST_COMPANY_PASSWORD = "Test123456";
    protected static final String TEST_ADMIN_USERNAME = "test_admin@graphhire.com";
    protected static final String TEST_ADMIN_PASSWORD = "Test123456";

    protected void setupHeaders() {
        personHeaders = new HttpHeaders();
        personHeaders.set("satoken", personToken);

        companyHeaders = new HttpHeaders();
        companyHeaders.set("satoken", companyToken);

        adminHeaders = new HttpHeaders();
        adminHeaders.set("satoken", adminToken);
    }

    /**
     * Call this from subclass @BeforeAll (static context).
     * Safe to call multiple times — subsequent calls return immediately if tokens exist.
     *
     * Approach: Create users via direct JDBC (bypasses verifyCode), then call HTTP login endpoint
     * via MockMvc (goes through SaToken filter chain for valid token).
     */
    protected static void ensureTokensInitialized(AuthAppService authService,
                                                  UserRepository userRepository,
                                                  PasswordEncoder passwordEncoder,
                                                  JdbcTemplate jdbcTemplate,
                                                  MockMvc mockMvc,
                                                  ObjectMapper objectMapper) throws Exception {
        if (personToken != null && companyToken != null && adminToken != null) {
            return; // Already initialized
        }

        // Create test users via direct JDBC (avoids verifyCode requirement)
        personUserId = createUserViaJdbc(jdbcTemplate, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD, "PERSON");
        companyUserId = createUserViaJdbc(jdbcTemplate, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD, "COMPANY");
        adminUserId = createUserViaJdbc(jdbcTemplate, TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD, "ADMIN");

        // For company user, also create company and company_staff records
        createCompanyAndStaff(jdbcTemplate, companyUserId);

        // Login via HTTP (MockMvc goes through full filter chain including SaToken)
        personToken = doHttpLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        companyToken = doHttpLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        adminToken = doHttpLogin(mockMvc, objectMapper, TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);
    }

    private static Long createUserViaJdbc(JdbcTemplate jdbc, String username, String password, String userType) {
        // Check if user already exists
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM sys_user WHERE username = ?", Integer.class, username);
        if (count != null && count > 0) {
            // Return existing user ID
            return jdbc.queryForObject(
                "SELECT id FROM sys_user WHERE username = ?", Long.class, username);
        }

        String encryptedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        // user_type: 1=PERSON, 2=COMPANY, 3=ADMIN; status: 1=VERIFIED
        int ut = "PERSON".equals(userType) ? 1 : ("COMPANY".equals(userType) ? 2 : 3);
        jdbc.update(
            "INSERT INTO sys_user (username, password, user_type, status, deleted, last_login_time, create_time, update_time) " +
            "VALUES (?, ?, ?, 1, 0, NULL, NOW(), NOW())",
            username, encryptedPassword, ut
        );
        // Return the auto-generated ID
        return jdbc.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private static void createCompanyAndStaff(JdbcTemplate jdbc, Long companyUserId) {
        // Check if company already exists for this user
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM company WHERE user_id = ?", Integer.class, companyUserId);
        if (count != null && count > 0) {
            return; // Already exists
        }

        // Create company record (auth_status: 0=PENDING_VERIFY, 1=VERIFIED)
        // Column names: name, code (unified social credit code), auth_status
        jdbc.update(
            "INSERT INTO company (user_id, name, code, auth_status, create_time, update_time) " +
            "VALUES (?, ?, ?, 1, NOW(), NOW())",
            companyUserId, "Test Company", "911100000000000000"
        );
        Long companyId = jdbc.queryForObject("SELECT LASTVAL()", Long.class);

        // Create company_staff record linking user to company (post: OWNER)
        jdbc.update(
            "INSERT INTO company_staff (company_id, user_id, post, create_time, update_time) " +
            "VALUES (?, ?, 'OWNER', NOW(), NOW())",
            companyId, companyUserId
        );
    }

    private static String doHttpLogin(MockMvc mockMvc, ObjectMapper objectMapper,
                                     String username, String password) throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        String response = result.getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        return node.path("data").path("accessToken").asText();
    }

    /**
     * Cleanup test users created by ensureTokensInitialized.
     * Call this from subclass @AfterAll (static context).
     */
    protected static void cleanupTestUsers(JdbcTemplate jdbcTemplate) {
        // Delete in reverse order of creation to handle foreign key constraints
        // company_staff -> company -> sys_user
        jdbcTemplate.update("DELETE FROM company_staff WHERE user_id IN (?, ?, ?)",
            personUserId, companyUserId, adminUserId);
        jdbcTemplate.update("DELETE FROM company WHERE user_id IN (?, ?, ?)",
            personUserId, companyUserId, adminUserId);
        jdbcTemplate.update("DELETE FROM sys_user WHERE id IN (?, ?, ?)",
            personUserId, companyUserId, adminUserId);
    }
}
