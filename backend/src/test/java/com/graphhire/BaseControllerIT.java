package com.graphhire;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import cn.hutool.crypto.digest.BCrypt;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;
import java.io.InputStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;

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

    @MockBean
    protected JavaMailSender javaMailSender;

    @MockBean
    protected RustFSClient rustFSClient;

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

    @BeforeEach
    protected void setupExternalMocks() {
        ensureCompanyAvatarPathColumn(jdbcTemplate);
        ensureCompanyWebsiteColumn(jdbcTemplate);
        ensureResumeFileSizeColumn(jdbcTemplate);
        ensureJobEducationAndPositionTypeColumns(jdbcTemplate);
        Mockito.lenient().when(rustFSClient.upload(any(byte[].class), anyString()))
            .thenAnswer(invocation -> "s3://resumes/mock/" + invocation.getArgument(1, String.class));
        Mockito.lenient().when(rustFSClient.upload(any(InputStream.class), anyLong(), anyString()))
            .thenAnswer(invocation -> "s3://resumes/mock/" + invocation.getArgument(2, String.class));
        Mockito.lenient().when(rustFSClient.download(anyString()))
            .thenReturn("mock-file-content".getBytes(StandardCharsets.UTF_8));
        Mockito.lenient().when(rustFSClient.exists(anyString())).thenReturn(true);
        Mockito.lenient().doNothing().when(rustFSClient).delete(anyString());
    }

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
        ensureCompanyStaffStatusColumn(jdbcTemplate);
        ensureCompanyWebsiteColumn(jdbcTemplate);

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
        String encryptedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        int ut = "PERSON".equals(userType) ? 1 : ("COMPANY".equals(userType) ? 2 : 3);

        // Check if user already exists
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM sys_user WHERE username = ?", Integer.class, username);
        if (count != null && count > 0) {
            Long existingUserId = jdbc.queryForObject(
                "SELECT id FROM sys_user WHERE username = ?", Long.class, username);
            jdbc.update(
                "UPDATE sys_user SET password = ?, user_type = ?, status = 1, deleted = 0, update_time = NOW() WHERE id = ?",
                encryptedPassword, ut, existingUserId
            );
            return existingUserId;
        }

        // user_type: 1=PERSON, 2=COMPANY, 3=ADMIN; status: 1=VERIFIED
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
            "INSERT INTO company_staff (company_id, user_id, post, status, create_time, update_time) " +
            "VALUES (?, ?, 'OWNER', 'ACTIVE', NOW(), NOW())",
            companyId, companyUserId
        );
    }

    private static void ensureCompanyStaffStatusColumn(JdbcTemplate jdbc) {
        jdbc.execute("ALTER TABLE company_staff ADD COLUMN IF NOT EXISTS status VARCHAR(20)");
        jdbc.execute("UPDATE company_staff SET status = 'ACTIVE' WHERE status IS NULL");
    }

    private static void ensureCompanyAvatarPathColumn(JdbcTemplate jdbc) {
        jdbc.execute("ALTER TABLE company ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500)");
    }

    private static void ensureCompanyWebsiteColumn(JdbcTemplate jdbc) {
        jdbc.execute("ALTER TABLE company ADD COLUMN IF NOT EXISTS website VARCHAR(500)");
        jdbc.execute("ALTER TABLE company DROP COLUMN IF EXISTS contact_email");
    }

    private static void ensureResumeFileSizeColumn(JdbcTemplate jdbc) {
        jdbc.execute("ALTER TABLE resume ADD COLUMN IF NOT EXISTS file_size BIGINT NOT NULL DEFAULT 0");
    }

    private static void ensureJobEducationAndPositionTypeColumns(JdbcTemplate jdbc) {
        jdbc.execute("ALTER TABLE job ADD COLUMN IF NOT EXISTS position_type_id BIGINT");
        jdbc.execute("DO $$ " +
                "DECLARE edu_type text; " +
                "BEGIN " +
                "SELECT data_type INTO edu_type FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='job' AND column_name='education'; " +
                "IF edu_type IS NULL THEN " +
                "ALTER TABLE job ADD COLUMN education SMALLINT; " +
                "ELSIF edu_type <> 'smallint' THEN " +
                "ALTER TABLE job ADD COLUMN IF NOT EXISTS education_code SMALLINT; " +
                "UPDATE job SET education_code = CASE " +
                "WHEN education IN ('中专', '中专/中技') THEN 1 " +
                "WHEN education = '大专' THEN 2 " +
                "WHEN education = '本科' THEN 3 " +
                "WHEN education = '硕士' THEN 4 " +
                "WHEN education = '博士' THEN 5 " +
                "ELSE NULL END " +
                "WHERE education_code IS NULL; " +
                "ALTER TABLE job DROP COLUMN education; " +
                "ALTER TABLE job RENAME COLUMN education_code TO education; " +
                "END IF; " +
                "END $$;");
        jdbc.execute("ALTER TABLE job DROP CONSTRAINT IF EXISTS chk_job_education");
        jdbc.execute("ALTER TABLE job ADD CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5))");
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
