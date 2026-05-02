package com.graphhire.publicapi.interfaces.controller.it;

import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicFilterMetaControllerIT extends BaseControllerIT {

    @AfterEach
    void cleanup() {
        jdbcTemplate.update("DELETE FROM position_type WHERE name LIKE 'PUBLIC_FILTER_META_IT_%'");
        jdbcTemplate.update("DELETE FROM industry WHERE name LIKE 'PUBLIC_FILTER_META_IT_%'");
    }

    @Test
    @DisplayName("公开职位类型树接口返回仅启用节点")
    void getPositionTypeTree_returnsEnabledTree() throws Exception {
        long rootId = createPositionType(null, "PUBLIC_FILTER_META_IT_职位父类", 1, 1);
        long childId = createPositionType(rootId, "PUBLIC_FILTER_META_IT_职位子类", 2, 1);
        createPositionType(childId, "PUBLIC_FILTER_META_IT_职位孙类_启用", 3, 1);
        createPositionType(childId, "PUBLIC_FILTER_META_IT_职位孙类_停用", 3, 0);

        mockMvc.perform(get("/public/position-types/tree"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data[?(@.name=='PUBLIC_FILTER_META_IT_职位父类')]").isNotEmpty())
            .andExpect(jsonPath("$.data[?(@.name=='PUBLIC_FILTER_META_IT_职位父类')].children[0][?(@.name=='PUBLIC_FILTER_META_IT_职位子类')]").isNotEmpty())
            .andExpect(jsonPath("$.data[?(@.name=='PUBLIC_FILTER_META_IT_职位父类')].children[0][?(@.name=='PUBLIC_FILTER_META_IT_职位子类')].children[0][?(@.name=='PUBLIC_FILTER_META_IT_职位孙类_启用')]").isNotEmpty());
    }

    @Test
    @DisplayName("公开行业树接口返回仅启用节点")
    void getIndustryTree_returnsEnabledTree() throws Exception {
        long rootId = createIndustry(null, "PUBLIC_FILTER_META_IT_行业父类", 1, 1);
        createIndustry(rootId, "PUBLIC_FILTER_META_IT_行业子类_启用", 2, 1);
        createIndustry(rootId, "PUBLIC_FILTER_META_IT_行业子类_停用", 2, 0);

        mockMvc.perform(get("/public/industries/tree"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data[?(@.name=='PUBLIC_FILTER_META_IT_行业父类')]").isNotEmpty())
            .andExpect(jsonPath("$.data[?(@.name=='PUBLIC_FILTER_META_IT_行业父类')].children[0][?(@.name=='PUBLIC_FILTER_META_IT_行业子类_启用')]").isNotEmpty());
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
