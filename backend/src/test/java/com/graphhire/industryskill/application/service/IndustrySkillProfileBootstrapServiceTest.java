package com.graphhire.industryskill.application.service;

import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONArray;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
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
    private IndustryAppService industryAppService;

    @Mock
    private IndustrySkillProfileAppService profileAppService;

    @Mock
    private DeepSeekClient deepSeekClient;

    @InjectMocks
    private IndustrySkillProfileBootstrapService service;

    @Test
    @DisplayName("遍历所有二级行业生成分类并落库")
    void bootstrapProfiles_shouldGenerateAtLeastFiveCategoriesForEachLeafIndustry() {
        Industry parent = new Industry();
        parent.setId(1L);
        parent.setName("计算机/互联网/通信/电子");
        parent.setLevel(1);
        parent.setEnabled(1);

        Industry leaf = new Industry();
        leaf.setId(12L);
        leaf.setName("计算机软件");
        leaf.setParentId(1L);
        leaf.setLevel(2);
        leaf.setEnabled(1);

        when(industryAppService.listIndustries(1)).thenReturn(List.of(parent, leaf));
        when(deepSeekClient.generateIndustryProfile("计算机/互联网/通信/电子", "计算机软件")).thenReturn(Map.of(
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
        verify(profileAppService).saveOrUpdate(eq(12L), jsonCaptor.capture());
        JSONObject saved = JSONUtil.parseObj(jsonCaptor.getValue());
        JSONArray categories = saved.getJSONArray("categories");
        assertEquals(5, categories.size());
        assertTrue(categories.toString().contains("backend"));
        assertTrue(categories.toString().contains("architecture"));
    }

    @Test
    @DisplayName("单行业初始化只处理指定二级行业")
    void bootstrapByIndustryId_shouldOnlyBootstrapTargetLeaf() {
        Industry parent = new Industry();
        parent.setId(1L);
        parent.setName("计算机/互联网/通信/电子");
        parent.setLevel(1);
        parent.setEnabled(1);

        Industry leaf = new Industry();
        leaf.setId(12L);
        leaf.setName("计算机软件");
        leaf.setParentId(1L);
        leaf.setLevel(2);
        leaf.setEnabled(1);

        when(industryAppService.listIndustries(1)).thenReturn(List.of(parent, leaf));
        when(deepSeekClient.generateIndustryProfile("计算机/互联网/通信/电子", "计算机软件")).thenReturn(Map.of(
            "categories", List.of(
                Map.of("code", "backend", "name", "后端开发"),
                Map.of("code", "frontend", "name", "前端开发"),
                Map.of("code", "testing", "name", "测试工程"),
                Map.of("code", "ops", "name", "运维工程"),
                Map.of("code", "architecture", "name", "架构设计")
            )
        ));

        service.bootstrapByIndustryId(12L);

        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(profileAppService).saveOrUpdate(eq(12L), jsonCaptor.capture());
        JSONObject saved = JSONUtil.parseObj(jsonCaptor.getValue());
        JSONArray categories = saved.getJSONArray("categories");
        assertEquals(5, categories.size());
        assertTrue(categories.toString().contains("frontend"));
        assertTrue(categories.toString().contains("ops"));
    }
}
