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

class PublicHomeControllerIT extends BaseControllerIT {

    @AfterEach
    void cleanup() {
        jdbcTemplate.update("DELETE FROM job WHERE title LIKE 'PUBLIC_HOME_IT_%'");
        jdbcTemplate.update("DELETE FROM company WHERE name LIKE 'PUBLIC_HOME_IT_%'");
        jdbcTemplate.update("DELETE FROM sys_user WHERE username LIKE 'public_home_it_%@graphhire.com'");
    }

    @Test
    @DisplayName("首页聚合接口返回精选职位、热门企业与热门城市")
    void getHomeOverview_returnsFeaturedJobsAndCompanies() throws Exception {
        Long companyUserId = createUser("public_home_it_company@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_HOME_IT_星海科技");
        createJob(companyId, "PUBLIC_HOME_IT_高级后端工程师", "杭州", 32000, 48000, 1);
        createJob(companyId, "PUBLIC_HOME_IT_AI 产品经理", "上海", 28000, 42000, 1);

        MvcResult result = mockMvc.perform(get("/public/home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.featuredJobs").isArray())
            .andExpect(jsonPath("$.data.popularCompanies").isArray())
            .andExpect(jsonPath("$.data.hotCities").isArray())
            .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).contains("PUBLIC_HOME_IT_高级后端工程师");
        assertThat(body).contains("PUBLIC_HOME_IT_星海科技");
        assertThat(body).contains("杭州");
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
            userId, name, "911100000000000001"
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createJob(Long companyId, String title, String city, int salaryMin, int salaryMax, int status) {
        jdbcTemplate.update(
            "INSERT INTO job (company_id, title, city, salary_min, salary_max, salary_unit, status, experience, education, create_time, update_time, deleted) VALUES (?, ?, ?, ?, ?, 'MONTH', ?, '3-5年', 3, NOW(), NOW(), 0)",
            companyId, title, city, salaryMin, salaryMax, status
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }
}
