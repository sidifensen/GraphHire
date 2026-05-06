package com.graphhire.industryskill.application.service;

import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONArray;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

@ExtendWith(MockitoExtension.class)
class IndustrySkillProfileBootstrapServiceTest {

    @Mock
    private PositionTypeAppService positionTypeAppService;

    @Mock
    private IndustrySkillProfileAppService profileAppService;

    @Mock
    private DeepSeekClient deepSeekClient;

    @InjectMocks
    private IndustrySkillProfileBootstrapService service;

    @Test
    @DisplayName("遍历所有二级行业生成分类并落库")
    void bootstrapProfiles_shouldGenerateAtLeastFiveCategoriesForEachLeafPositionType() {
        PositionType parent = new PositionType();
        parent.setId(1L);
        parent.setName("技术");
        parent.setLevel(2);
        parent.setStatus(1);
        parent.setDeleted(0);

        PositionType leaf = new PositionType();
        leaf.setId(100101L);
        leaf.setName("后端开发工程师");
        leaf.setParentId(1L);
        leaf.setLevel(3);
        leaf.setStatus(1);
        leaf.setDeleted(0);

        when(positionTypeAppService.listAll()).thenReturn(List.of(parent, leaf));
        when(deepSeekClient.generateIndustryProfile("技术", "后端开发工程师")).thenReturn(Map.of(
            "categories", List.of(
                Map.of("code", "backend", "name", "后端开发"),
                Map.of("code", "frontend", "name", "前端开发"),
                Map.of("code", "testing", "name", "测试工程"),
                Map.of("code", "ops", "name", "运维工程"),
                Map.of("code", "architecture", "name", "架构设计")
            )
        ));

        int affected = service.bootstrapAllLeafIndustries();

        assertEquals(1, affected);
        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(profileAppService).saveOrUpdate(eq(100101L), jsonCaptor.capture());
        JSONObject saved = JSONUtil.parseObj(jsonCaptor.getValue());
        JSONArray categories = saved.getJSONArray("categories");
        assertEquals(5, categories.size());
        assertTrue(categories.toString().contains("backend"));
        assertTrue(categories.toString().contains("architecture"));
    }

    @Test
    @DisplayName("单行业初始化只处理指定二级行业")
    void bootstrapByPositionTypeId_shouldOnlyBootstrapTargetLeaf() {
        PositionType parent = new PositionType();
        parent.setId(1L);
        parent.setName("技术");
        parent.setLevel(2);
        parent.setStatus(1);
        parent.setDeleted(0);

        PositionType leaf = new PositionType();
        leaf.setId(100101L);
        leaf.setName("后端开发工程师");
        leaf.setParentId(1L);
        leaf.setLevel(3);
        leaf.setStatus(1);
        leaf.setDeleted(0);

        when(positionTypeAppService.listAll()).thenReturn(List.of(parent, leaf));
        when(deepSeekClient.generateIndustryProfile("技术", "后端开发工程师")).thenReturn(Map.of(
            "categories", List.of(
                Map.of("code", "backend", "name", "后端开发"),
                Map.of("code", "frontend", "name", "前端开发"),
                Map.of("code", "testing", "name", "测试工程"),
                Map.of("code", "ops", "name", "运维工程"),
                Map.of("code", "architecture", "name", "架构设计")
            )
        ));

        service.bootstrapByPositionTypeId(100101L);

        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(profileAppService).saveOrUpdate(eq(100101L), jsonCaptor.capture());
        JSONObject saved = JSONUtil.parseObj(jsonCaptor.getValue());
        JSONArray categories = saved.getJSONArray("categories");
        assertEquals(5, categories.size());
        assertTrue(categories.toString().contains("frontend"));
        assertTrue(categories.toString().contains("ops"));
    }
}
