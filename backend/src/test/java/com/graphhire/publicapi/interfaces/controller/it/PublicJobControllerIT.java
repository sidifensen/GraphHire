package com.graphhire.publicapi.interfaces.controller.it;

import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicJobControllerIT extends BaseControllerIT {

    @AfterEach
    void cleanup() {
        jdbcTemplate.update("DELETE FROM job WHERE title LIKE 'PUBLIC_JOB_IT_%'");
        jdbcTemplate.update("DELETE FROM company WHERE name LIKE 'PUBLIC_JOB_IT_FILTER_%'");
        jdbcTemplate.update("DELETE FROM company WHERE name LIKE 'PUBLIC_JOB_IT_%'");
        jdbcTemplate.update("DELETE FROM position_type WHERE name LIKE 'PUBLIC_JOB_IT_%'");
        jdbcTemplate.update("DELETE FROM industry WHERE name LIKE 'PUBLIC_JOB_IT_%'");
        jdbcTemplate.update("DELETE FROM sys_user WHERE username LIKE 'public_job_it_%@graphhire.com' OR username LIKE 'public_job_it_page_%@graphhire.com'");
    }

    @Test
    @DisplayName("公开职位列表返回页面卡片所需字段")
    void searchJobs_returnsPublicJobCards() throws Exception {
        Long companyUserId = createUser("public_job_it_company@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_JOB_IT_星云智能");
        createJob(companyId, "PUBLIC_JOB_IT_资深 Java 工程师", "北京", 25000, 38000, 1);

        MvcResult result = mockMvc.perform(get("/public/jobs").param("keyword", "PUBLIC_JOB_IT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.records").isArray())
            .andExpect(jsonPath("$.data.records[0].title").value("PUBLIC_JOB_IT_资深 Java 工程师"))
            .andExpect(jsonPath("$.data.records[0].companyName").value("PUBLIC_JOB_IT_星云智能"))
            .andExpect(jsonPath("$.data.records[0].city").value("北京"))
            .andExpect(jsonPath("$.data.records[0].salaryMin").value(25000))
            .andExpect(jsonPath("$.data.records[0].salaryMax").value(38000))
            .andExpect(jsonPath("$.data.records[0].requiredSkills[0]").value("Java"))
            .andExpect(jsonPath("$.data.records[0].educationCode").value(3))
            .andExpect(jsonPath("$.data.records[0].positionTypeId").value(100101))
            .andReturn();

        assertThat(result.getResponse().getContentAsString()).contains("PUBLIC_JOB_IT_星云智能");
    }

    @Test
    @DisplayName("公开职位列表支持分页与薪资排序")
    void searchJobs_supportsPaginationAndSalarySort() throws Exception {
        Long companyUserId = createUser("public_job_it_page_company@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_JOB_IT_分页企业");
        createJob(companyId, "PUBLIC_JOB_IT_初级 Java", "上海", 18000, 22000, 1);
        createJob(companyId, "PUBLIC_JOB_IT_高级 Java", "上海", 30000, 42000, 1);
        createJob(companyId, "PUBLIC_JOB_IT_中级 Java", "上海", 22000, 30000, 1);

        mockMvc.perform(get("/public/jobs")
                .param("keyword", "PUBLIC_JOB_IT_")
                .param("city", "上海")
                .param("sortBy", "salary")
                .param("page", "1")
                .param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").value(3))
            .andExpect(jsonPath("$.data.records.length()").value(2))
            .andExpect(jsonPath("$.data.records[0].title").value("PUBLIC_JOB_IT_高级 Java"))
            .andExpect(jsonPath("$.data.records[1].title").value("PUBLIC_JOB_IT_中级 Java"));
    }

    @Test
    @DisplayName("公开职位列表支持职位类别叶子、多城市、职位类型和学历筛选")
    void searchJobs_supportsPositionTypeCityListJobTypeEducationFilter() throws Exception {
        long positionRootId = createPositionType(null, "PUBLIC_JOB_IT_职位父类", 1, 1);
        long positionMidId = createPositionType(positionRootId, "PUBLIC_JOB_IT_职位子类", 2, 1);
        long positionLeafJavaId = createPositionType(positionMidId, "PUBLIC_JOB_IT_Java叶子", 3, 1);
        long positionLeafTestId = createPositionType(positionMidId, "PUBLIC_JOB_IT_测试叶子", 3, 1);

        Long companyUserId = createUser("public_job_it_filter_a@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_JOB_IT_FILTER_星河科技");
        createJob(companyId, "PUBLIC_JOB_IT_Java实习", "北京", 18000, 22000, 1, 3, 4, positionLeafJavaId);
        createJob(companyId, "PUBLIC_JOB_IT_测试全职", "上海", 26000, 32000, 1, 1, 3, positionLeafTestId);

        mockMvc.perform(get("/public/jobs")
                .param("positionTypeLeafIds", String.valueOf(positionLeafJavaId))
                .param("cityList", "北京")
                .param("cityList", "深圳")
                .param("jobType", "3")
                .param("educationCode", "4")
                .param("keyword", "PUBLIC_JOB_IT_")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").value(1))
            .andExpect(jsonPath("$.data.records.length()").value(1))
            .andExpect(jsonPath("$.data.records[0].title").value("PUBLIC_JOB_IT_Java实习"));
    }

    @Test
    @DisplayName("公开职位列表支持公司行业叶子和公司规模筛选")
    void searchJobs_supportsIndustryAndCompanyScaleFilter() throws Exception {
        long industryRootId = createIndustry(null, "PUBLIC_JOB_IT_互联网", 1, 1);
        long industryLeafAiId = createIndustry(industryRootId, "PUBLIC_JOB_IT_AI", 2, 1);
        long industryLeafGameId = createIndustry(industryRootId, "PUBLIC_JOB_IT_游戏", 2, 1);

        Long companyAUserId = createUser("public_job_it_filter_b@graphhire.com");
        Long companyAId = createCompany(companyAUserId, "PUBLIC_JOB_IT_FILTER_AI公司", industryLeafAiId, "5");
        createJob(companyAId, "PUBLIC_JOB_IT_AI算法岗", "杭州", 38000, 50000, 1, 1, 4, 1001002L);

        Long companyBUserId = createUser("public_job_it_filter_c@graphhire.com");
        Long companyBId = createCompany(companyBUserId, "PUBLIC_JOB_IT_FILTER_游戏公司", industryLeafGameId, "3");
        createJob(companyBId, "PUBLIC_JOB_IT_游戏策划岗", "杭州", 25000, 33000, 1, 1, 3, 2001002L);

        mockMvc.perform(get("/public/jobs")
                .param("industryLeafIds", String.valueOf(industryLeafAiId))
                .param("companyScaleCode", "5")
                .param("keyword", "PUBLIC_JOB_IT_")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").value(1))
            .andExpect(jsonPath("$.data.records.length()").value(1))
            .andExpect(jsonPath("$.data.records[0].title").value("PUBLIC_JOB_IT_AI算法岗"));
    }

    private Long createUser(String username) {
        jdbcTemplate.update(
            "INSERT INTO sys_user (username, password, user_type, status, deleted, create_time, update_time) VALUES (?, 'pwd', 2, 1, 0, NOW(), NOW())",
            username
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createCompany(Long userId, String name) {
        jdbcTemplate.update(
            "INSERT INTO company (user_id, name, code, auth_status, create_time, update_time) VALUES (?, ?, ?, 1, NOW(), NOW())",
            userId, name, "911100000000000002"
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createJob(Long companyId, String title, String city, int salaryMin, int salaryMax, int status) {
        return createJob(companyId, title, city, salaryMin, salaryMax, status, 1, 3, 100101L);
    }

    private Long createCompany(Long userId, String name, Long industryId, String scaleCode) {
        String uniqueCode = "911100" + Math.abs(System.nanoTime() % 1_000_000_000L);
        jdbcTemplate.update(
            "INSERT INTO company (user_id, name, code, auth_status, industry_id, scale, create_time, update_time) VALUES (?, ?, ?, 1, ?, ?, NOW(), NOW())",
            userId, name, uniqueCode, industryId, scaleCode
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createJob(Long companyId, String title, String city, int salaryMin, int salaryMax, int status,
                           int jobType, int educationCode, long positionTypeId) {
        jdbcTemplate.update(
            "INSERT INTO job (company_id, title, city, salary_min, salary_max, salary_unit, status, experience, education, position_type_id, skills, create_time, update_time, deleted) VALUES (?, ?, ?, ?, ?, 'MONTH', ?, '3-5年', 3, 100101, ARRAY['Java','Spring Boot']::text[], NOW(), NOW(), 0)",
            companyId, title, city, salaryMin, salaryMax, status
        );
        Long jobId = jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
        jdbcTemplate.update(
            "UPDATE job SET job_type = ?, education = ?, position_type_id = ? WHERE id = ?",
            jobType, educationCode, positionTypeId, jobId
        );
        return jobId;
    }

    private long createPositionType(Long parentId, String name, int level, int status) {
        long baseCode = Math.abs(System.nanoTime() % 1_000_000_000L) + 9000000000L;
        jdbcTemplate.update(
            "INSERT INTO position_type (code, name, parent_id, level, sort_no, status, deleted, create_time, update_time) VALUES (?, ?, ?, ?, 1, ?, 0, NOW(), NOW())",
            baseCode, name, parentId, level, status
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private long createIndustry(Long parentId, String name, int level, int enabled) {
        jdbcTemplate.update(
            "INSERT INTO industry (name, parent_id, level, enabled, sort, deleted, create_time, update_time) VALUES (?, ?, ?, ?, 1, 0, NOW(), NOW())",
            name, parentId, level, enabled
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }
}
