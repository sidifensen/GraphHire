package com.graphhire.positiontypeskill.application.service;

import com.graphhire.positiontypeskill.domain.model.IndustrySkillProfile;
import com.graphhire.positiontypeskill.application.service.IndustrySkillProfileBootstrapService;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.skill.application.service.SkillTagAppService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PositionTypeSkillClassificationServiceTest {

    @Mock
    private IndustrySkillProfileAppService profileAppService;

    @Mock
    private PositionTypeAppService positionTypeAppService;

    @Mock
    private SkillTagAppService skillTagAppService;

    @Mock
    private DeepSeekClient deepSeekClient;

    @Mock
    private IndustrySkillProfileBootstrapService bootstrapService;

    @InjectMocks
    private PositionTypeSkillClassificationService service;

    @Test
    @DisplayName("技能命中职位类型后返回职位匹配与技能分类")
    void classifyPersonSkills_ShouldReturnPositionTypeAndCategories() {
        when(skillTagAppService.normalizeSkills(List.of("Java", "Spring Boot"))).thenReturn(List.of("Java", "Spring Boot"));
        PositionType leafPositionType = new PositionType();
        leafPositionType.setId(100101L);
        leafPositionType.setName("软件开发工程师");
        leafPositionType.setLevel(3);
        leafPositionType.setStatus(1);
        leafPositionType.setDeleted(0);
        when(positionTypeAppService.listAll()).thenReturn(List.of(leafPositionType));

        Map<String, Object> result = service.classifyPersonSkills(List.of("Java", "Spring Boot"));

        Map<String, Object> positionTypeMatch = (Map<String, Object>) result.get("positionTypeMatch");
        assertEquals(false, positionTypeMatch.get("matched"));
        assertEquals(null, positionTypeMatch.get("positionTypeId"));
        assertNotNull(result.get("skillCategories"));
    }

    @Test
    @DisplayName("存在默认职位且AI返回空skills时回退到首分类承接全部技能")
    void classifyPersonSkills_WhenAiReturnsEmptySkills_ShouldFallbackToFirstCategory() {
        when(skillTagAppService.normalizeSkills(List.of("Java", "Spring Boot"))).thenReturn(List.of("Java", "Spring Boot"));

        PositionType leafPositionType = new PositionType();
        leafPositionType.setId(100101L);
        leafPositionType.setName("软件开发工程师");
        leafPositionType.setLevel(3);
        leafPositionType.setStatus(1);
        leafPositionType.setDeleted(0);
        when(positionTypeAppService.listAll()).thenReturn(List.of(leafPositionType));

        IndustrySkillProfile profile = new IndustrySkillProfile();
        profile.setPositionTypeId(100101L);
        profile.setProfileJson("{\"categories\":[{\"code\":\"backend\",\"name\":\"后端开发\"},{\"code\":\"infra\",\"name\":\"基础设施\"}]}");
        when(profileAppService.getByPositionTypeId(100101L)).thenReturn(Optional.of(profile));

        Map<String, Object> aiCategory = new HashMap<>();
        aiCategory.put("skillCategories", List.of(
            Map.of("code", "backend", "name", "后端开发", "skills", List.of()),
            Map.of("code", "infra", "name", "基础设施", "skills", List.of())
        ));
        when(deepSeekClient.categorizeSkillsByProfile(anyList(), anyString())).thenReturn(aiCategory);

        Map<String, Object> result = service.classifyPersonSkills(List.of("Java", "Spring Boot"), 100101L);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> categories = (List<Map<String, Object>>) result.get("skillCategories");
        assertEquals(2, categories.size());
        @SuppressWarnings("unchecked")
        List<String> firstSkills = (List<String>) categories.get(0).get("skills");
        assertEquals(List.of("Java", "Spring Boot"), firstSkills);
    }

    @Test
    @DisplayName("技能为空时返回未匹配结果")
    void classifyPersonSkills_WhenNoSkills_ReturnsFallback() {
        when(skillTagAppService.normalizeSkills(List.of())).thenReturn(List.of());

        Map<String, Object> result = service.classifyPersonSkills(List.of());

        Map<String, Object> positionTypeMatch = (Map<String, Object>) result.get("positionTypeMatch");
        assertEquals(false, positionTypeMatch.get("matched"));
        assertEquals(null, positionTypeMatch.get("positionTypeId"));
    }

    @Test
    @DisplayName("存在默认职位时优先按默认职位分类")
    void classifyPersonSkills_WithPreferredPositionType_ShouldUsePreferred() {
        when(skillTagAppService.normalizeSkills(List.of("Java", "Spring Boot"))).thenReturn(List.of("Java", "Spring Boot"));

        PositionType preferred = new PositionType();
        preferred.setId(200201L);
        preferred.setName("后端开发工程师");
        preferred.setLevel(3);
        preferred.setStatus(1);
        preferred.setDeleted(0);
        when(positionTypeAppService.listAll()).thenReturn(List.of(preferred));

        IndustrySkillProfile profile = new IndustrySkillProfile();
        profile.setPositionTypeId(200201L);
        profile.setProfileJson("{\"categories\":[{\"code\":\"backend\",\"name\":\"后端开发\"}]}");
        when(profileAppService.getByPositionTypeId(200201L)).thenReturn(Optional.of(profile));

        Map<String, Object> aiCategory = new HashMap<>();
        aiCategory.put("skillCategories", List.of(
            Map.of("code", "backend", "name", "后端开发", "skills", List.of("Java", "Spring Boot"))
        ));
        when(deepSeekClient.categorizeSkillsByProfile(anyList(), anyString())).thenReturn(aiCategory);

        Map<String, Object> result = service.classifyPersonSkills(List.of("Java", "Spring Boot"), 200201L);
        Map<String, Object> positionTypeMatch = (Map<String, Object>) result.get("positionTypeMatch");

        assertEquals(200201L, ((Number) positionTypeMatch.get("positionTypeId")).longValue());
        assertEquals("后端开发工程师", positionTypeMatch.get("positionTypeName"));
        assertEquals(true, positionTypeMatch.get("matched"));
    }

    @Test
    @DisplayName("默认职位无配置时触发bootstrap后继续分类")
    void classifyPersonSkills_WithPreferredPositionTypeAndNoProfile_ShouldBootstrapThenCategorize() {
        when(skillTagAppService.normalizeSkills(List.of("Java"))).thenReturn(List.of("Java"));

        PositionType preferred = new PositionType();
        preferred.setId(300301L);
        preferred.setName("Java工程师");
        preferred.setLevel(3);
        preferred.setStatus(1);
        preferred.setDeleted(0);
        when(positionTypeAppService.listAll()).thenReturn(List.of(preferred));

        IndustrySkillProfile profile = new IndustrySkillProfile();
        profile.setPositionTypeId(300301L);
        profile.setProfileJson("{\"categories\":[{\"code\":\"core\",\"name\":\"核心技能\"}]}");
        when(profileAppService.getByPositionTypeId(300301L)).thenReturn(Optional.empty(), Optional.of(profile));

        Map<String, Object> aiCategory = new HashMap<>();
        aiCategory.put("skillCategories", List.of(
            Map.of("code", "core", "name", "核心技能", "skills", List.of("Java"))
        ));
        when(deepSeekClient.categorizeSkillsByProfile(anyList(), anyString())).thenReturn(aiCategory);

        Map<String, Object> result = service.classifyPersonSkills(List.of("Java"), 300301L);
        Map<String, Object> positionTypeMatch = (Map<String, Object>) result.get("positionTypeMatch");

        assertEquals(300301L, ((Number) positionTypeMatch.get("positionTypeId")).longValue());
        assertEquals("Java工程师", positionTypeMatch.get("positionTypeName"));
    }
}
