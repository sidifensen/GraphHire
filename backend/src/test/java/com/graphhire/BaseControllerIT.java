package com.graphhire;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class BaseControllerIT {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

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
     * Call this from subclass @BeforeAll to login and store tokens.
     * Usage: BaseControllerIT.initTokens(mockMvc, objectMapper);
     */
    protected static void initTokens(MockMvc mockMvc, ObjectMapper objectMapper) throws Exception {
        doLogin(mockMvc, objectMapper, TEST_PERSON_USERNAME, TEST_PERSON_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_COMPANY_USERNAME, TEST_COMPANY_PASSWORD);
        doLogin(mockMvc, objectMapper, TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD);
    }

    private static void doLogin(MockMvc mockMvc, ObjectMapper objectMapper,
                               String username, String password) throws Exception {
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        String response = result.getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        String token = node.path("data").path("accessToken").asText();
        Long userId = node.path("data").path("userId").asLong();

        if (username.equals(TEST_PERSON_USERNAME)) {
            personToken = token;
            personUserId = userId;
        } else if (username.equals(TEST_COMPANY_USERNAME)) {
            companyToken = token;
            companyUserId = userId;
        } else if (username.equals(TEST_ADMIN_USERNAME)) {
            adminToken = token;
            adminUserId = userId;
        }
    }
}
