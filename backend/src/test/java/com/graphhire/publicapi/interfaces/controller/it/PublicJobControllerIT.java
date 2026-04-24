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
        jdbcTemplate.update("DELETE FROM company WHERE name LIKE 'PUBLIC_JOB_IT_%'");
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
        jdbcTemplate.update(
            "INSERT INTO job (company_id, title, city, salary_min, salary_max, salary_unit, status, experience, education, create_time, update_time, deleted) VALUES (?, ?, ?, ?, ?, 'MONTH', ?, '3-5年', '本科', NOW(), NOW(), 0)",
            companyId, title, city, salaryMin, salaryMax, status
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }
}
