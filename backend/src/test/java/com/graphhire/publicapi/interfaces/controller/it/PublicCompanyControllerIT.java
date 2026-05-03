package com.graphhire.publicapi.interfaces.controller.it;

import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicCompanyControllerIT extends BaseControllerIT {

    @AfterEach
    void cleanup() {
        jdbcTemplate.update("DELETE FROM job WHERE title LIKE 'PUBLIC_COMPANY_IT_%'");
        jdbcTemplate.update("DELETE FROM company WHERE name LIKE 'PUBLIC_COMPANY_IT_%'");
        jdbcTemplate.update("DELETE FROM industry WHERE name LIKE 'PUBLIC_COMPANY_IT_%'");
        jdbcTemplate.update("DELETE FROM sys_user WHERE username LIKE 'public_company_it_%@graphhire.com'");
    }

    @Test
    @DisplayName("公开企业列表返回页面卡片所需字段")
    void searchCompanies_returnsPublicCompanyCards() throws Exception {
        Long companyUserId = createUser("public_company_it_company@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_COMPANY_IT_矩阵云");
        jdbcTemplate.update("UPDATE company SET avatar_path = ? WHERE id = ?", "avatar/1987654321098767360.png", companyId);
        createJob(companyId, "PUBLIC_COMPANY_IT_全栈工程师", "深圳", 22000, 35000, 1);
        createJob(companyId, "PUBLIC_COMPANY_IT_算法工程师", "深圳", 32000, 45000, 1);

        mockMvc.perform(get("/public/companies").param("keyword", "PUBLIC_COMPANY_IT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.records").isArray())
            .andExpect(jsonPath("$.data.records[0].name").value("PUBLIC_COMPANY_IT_矩阵云"))
            .andExpect(jsonPath("$.data.records[0].jobCount").value(2))
            .andExpect(jsonPath("$.data.records[0].city").value("深圳"))
            .andExpect(jsonPath("$.data.records[0].summary").exists())
            .andExpect(jsonPath("$.data.records[0].avatarUrl").value(allOf(
                startsWith("http://localhost:9000/resumes/avatar/1987654321098767360.png"),
                containsString("X-Amz-Algorithm=AWS4-HMAC-SHA256")
            )));
    }

    @Test
    @DisplayName("公开企业详情返回头像地址")
    void getCompany_returnsAvatarUrl() throws Exception {
        Long companyUserId = createUser("public_company_it_detail@graphhire.com");
        Long companyId = createCompany(companyUserId, "PUBLIC_COMPANY_IT_详情企业");
        jdbcTemplate.update("UPDATE company SET avatar_path = ? WHERE id = ?", "avatar/1987654321098767361.jpg", companyId);

        mockMvc.perform(get("/public/companies/{id}", companyId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.name").value("PUBLIC_COMPANY_IT_详情企业"))
            .andExpect(jsonPath("$.data.avatarUrl").value(allOf(
                startsWith("http://localhost:9000/resumes/avatar/1987654321098767361.jpg"),
                containsString("X-Amz-Algorithm=AWS4-HMAC-SHA256")
            )));
    }

    @Test
    @DisplayName("公开企业列表在无头像时返回 null")
    void searchCompanies_withoutAvatar_returnsNullAvatarUrl() throws Exception {
        Long companyUserId = createUser("public_company_it_no_avatar@graphhire.com");
        createCompany(companyUserId, "PUBLIC_COMPANY_IT_无头像企业");

        mockMvc.perform(get("/public/companies").param("keyword", "PUBLIC_COMPANY_IT_无头像企业"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.records[0].avatarUrl").value(nullValue()));
    }

    @Test
    @DisplayName("公开企业列表支持行业、规模、城市筛选并返回行业规模字段")
    void searchCompanies_supportsIndustryScaleCityFilters() throws Exception {
        String suffix = String.valueOf(Math.abs(System.nanoTime() % 1_000_000_000L));
        String industryRootName = "PUBLIC_COMPANY_IT_互联网_" + suffix;
        String industryAiName = "PUBLIC_COMPANY_IT_AI_" + suffix;
        String industryGameName = "PUBLIC_COMPANY_IT_游戏_" + suffix;
        long industryRootId = createIndustry(null, industryRootName, 1, 1);
        long industryLeafAiId = createIndustry(industryRootId, industryAiName, 2, 1);
        long industryLeafGameId = createIndustry(industryRootId, industryGameName, 2, 1);

        Long companyAUserId = createUser("public_company_it_filter_a@graphhire.com");
        Long companyAId = createCompany(companyAUserId, "PUBLIC_COMPANY_IT_FILTER_AI公司", industryLeafAiId, "5");
        createJob(companyAId, "PUBLIC_COMPANY_IT_FILTER_算法工程师", "杭州", 35000, 50000, 1);

        Long companyBUserId = createUser("public_company_it_filter_b@graphhire.com");
        Long companyBId = createCompany(companyBUserId, "PUBLIC_COMPANY_IT_FILTER_游戏公司", industryLeafGameId, "3");
        createJob(companyBId, "PUBLIC_COMPANY_IT_FILTER_游戏策划", "上海", 22000, 32000, 1);

        mockMvc.perform(get("/public/companies")
                .param("keyword", "PUBLIC_COMPANY_IT_FILTER")
                .param("industryLeafIds", String.valueOf(industryLeafAiId))
                .param("companyScaleCode", "5")
                .param("cityList", "杭州")
                .param("cityList", "深圳")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").value(1))
            .andExpect(jsonPath("$.data.records.length()").value(1))
            .andExpect(jsonPath("$.data.records[0].name").value("PUBLIC_COMPANY_IT_FILTER_AI公司"))
            .andExpect(jsonPath("$.data.records[0].city").value("杭州"))
            .andExpect(jsonPath("$.data.records[0].industryId").value(industryLeafAiId))
            .andExpect(jsonPath("$.data.records[0].industryName").value(industryAiName))
            .andExpect(jsonPath("$.data.records[0].scale").value("5"));
    }

    private Long createUser(String username) {
        jdbcTemplate.update(
            "INSERT INTO sys_user (username, password, user_type, status, deleted, create_time, update_time) VALUES (?, 'pwd', 2, 1, 0, NOW(), NOW())",
            username
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createCompany(Long userId, String name) {
        String uniqueCode = "911100" + Math.abs(System.nanoTime() % 1_000_000_000L);
        jdbcTemplate.update(
            "INSERT INTO company (user_id, name, code, auth_status, create_time, update_time) VALUES (?, ?, ?, 1, NOW(), NOW())",
            userId, name, uniqueCode
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }

    private Long createCompany(Long userId, String name, Long industryId, String scaleCode) {
        String uniqueCode = "911100" + Math.abs(System.nanoTime() % 1_000_000_000L);
        jdbcTemplate.update(
            "INSERT INTO company (user_id, name, code, auth_status, industry_id, scale, create_time, update_time) VALUES (?, ?, ?, 1, ?, ?, NOW(), NOW())",
            userId, name, uniqueCode, industryId, scaleCode
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

    private long createIndustry(Long parentId, String name, int level, int enabled) {
        jdbcTemplate.update(
            "INSERT INTO industry (name, parent_id, level, enabled, sort, deleted, create_time, update_time) VALUES (?, ?, ?, ?, 1, 0, NOW(), NOW())",
            name, parentId, level, enabled
        );
        return jdbcTemplate.queryForObject("SELECT LASTVAL()", Long.class);
    }
}
