package com.graphhire.job.interfaces.controller.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class CompanyControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdJobId;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        BaseControllerIT.initTokens(mockMvc, objectMapper);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取公司信息")
    void getCompanyInfo_Success() throws Exception {
        mockMvc.perform(get("/company/info")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("02 - 更新公司信息")
    void updateCompanyInfo_Success() throws Exception {
        mockMvc.perform(put("/company/info")
                .headers(companyHeaders)
                .param("name", "Updated Test Company")
                .param("description", "Test description update"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("03 - 提交认证材料")
    void submitAuthMaterials_Success() throws Exception {
        mockMvc.perform(post("/company/auth")
                .headers(companyHeaders)
                .param("licenseUrl", "http://example.com/license.pdf"))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("04 - 发布职位")
    void publishJob_Success() throws Exception {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String json = String.format(
            "{\"title\":\"Senior Engineer %s\",\"department\":\"Tech\",\"headcount\":2," +
            "\"location\":{\"province\":\"Beijing\",\"city\":\"Beijing\",\"district\":\"Haidian\"}," +
            "\"salaryRange\":{\"min\":20000,\"max\":40000,\"unit\":\"MONTH\"}," +
            "\"requiredSkills\":[\"Java\",\"Spring\"],\"preferredSkills\":[\"Python\"]," +
            "\"description\":\"We are hiring!\"}",
            uuid);

        MvcResult result = mockMvc.perform(post("/company/job")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        createdJobId = node.path("data").asLong();
        assertTrue(createdJobId > 0);
    }

    @Test
    @DisplayName("05 - 获取职位列表")
    void listJobs_Success() throws Exception {
        mockMvc.perform(get("/company/job/list")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("06 - 获取职位详情")
    void getJob_Success() throws Exception {
        assertNotNull(createdJobId, "需要先运行 publishJob");

        mockMvc.perform(get("/company/job/{id}", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(createdJobId));
    }

    @Test
    @DisplayName("07 - 更新职位")
    void updateJob_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = String.format(
            "{\"title\":\"Updated Title %s\",\"department\":\"HR\",\"headcount\":1," +
            "\"location\":{\"province\":\"Shanghai\",\"city\":\"Shanghai\"}," +
            "\"salaryRange\":{\"min\":15000,\"max\":30000,\"unit\":\"MONTH\"}," +
            "\"requiredSkills\":[\"Go\"],\"preferredSkills\":[],\"description\":\"Updated\"}",
            UUID.randomUUID().toString().substring(0, 8));

        mockMvc.perform(put("/company/job/{id}", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 切换职位状态")
    void toggleJobStatus_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = "{\"publish\":true}";

        mockMvc.perform(put("/company/job/{id}/status", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 发布职位")
    void publishJobEndpoint_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/publish", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("10 - 关闭职位")
    void closeJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/close", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("11 - 更新薪资范围")
    void updateSalary_Success() throws Exception {
        assertNotNull(createdJobId);

        String json = "{\"min\":25000,\"max\":50000,\"unit\":\"MONTH\"}";

        mockMvc.perform(put("/company/job/{id}/salary", createdJobId)
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("12 - 获取职位图谱")
    void getJobGraph_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(get("/company/job/{id}/graph", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("13 - 重新解析职位")
    void reparseJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(post("/company/job/{id}/parse", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("14 - 获取企业推荐简历列表")
    void getRecommendedResumes_Success() throws Exception {
        mockMvc.perform(get("/company/recommend/resumes")
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("15 - 创建公司")
    void createCompany_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"name\":\"New Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\"," +
            "\"contactName\":\"HR\",\"contactPhone\":\"13900000000\",\"contactEmail\":\"hr%d@company.com\"}",
            ts, ts % 10000, ts % 10000);

        mockMvc.perform(post("/company/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("16 - 获取公司详情")
    void getCompany_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"name\":\"Get Company %d\",\"unifiedSocialCreditCode\":\"91110000000000%04dX\"}",
            ts, ts % 10000);

        MvcResult result = mockMvc.perform(post("/company/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andReturn();

        Long companyId = objectMapper.readTree(result.getResponse().getContentAsString())
            .path("data").asLong();

        mockMvc.perform(get("/company/{id}", companyId))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    @DisplayName("17 - 删除职位")
    void deleteJob_Success() throws Exception {
        assertNotNull(createdJobId);

        mockMvc.perform(delete("/company/job/{id}", createdJobId)
                .headers(companyHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("18 - 创建员工账号")
    void createStaff_Success() throws Exception {
        long ts = System.currentTimeMillis();
        String json = String.format(
            "{\"username\":\"hr_%d@company.com\",\"password\":\"Test123456\",\"post\":\"HR\"}",
            ts);

        mockMvc.perform(post("/company/staff/create")
                .headers(companyHeaders)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(jsonPath("$.code").value(200));
    }
}