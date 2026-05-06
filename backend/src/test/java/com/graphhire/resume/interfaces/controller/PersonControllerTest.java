package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.industryskill.application.service.IndustrySkillClassificationService;
import com.graphhire.resume.application.service.PersonAbilityAssessmentService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.interfaces.dto.AbilityAssessmentResponse;
import com.graphhire.resume.interfaces.dto.request.PersonUpdateRequest;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import com.graphhire.match.application.service.MatchAppService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class PersonControllerTest {

    @Mock
    private PersonInfoRepository personInfoRepository;

    @Mock
    private MatchAppService matchAppService;

    @Mock
    private SkillGraphClient skillGraphClient;

    @Mock
    private PersonAbilityAssessmentService personAbilityAssessmentService;

    @Mock
    private IndustrySkillClassificationService industrySkillClassificationService;

    @InjectMocks
    private PersonController personController;

    @Test
    @DisplayName("更新资料时将 gender=0 归一化为 null，避免约束失败")
    void updatePersonInfo_NormalizesZeroGenderToNull() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(100L);
            when(personInfoRepository.findByUserId(100L)).thenReturn(Optional.empty());

            PersonUpdateRequest request = new PersonUpdateRequest();
            request.setRealName("测试用户");
            request.setGender(0);
            request.setExpectedSalary(32000);

            personController.updatePersonInfo(request);

            ArgumentCaptor<PersonInfo> captor = ArgumentCaptor.forClass(PersonInfo.class);
            verify(personInfoRepository).save(captor.capture());
            PersonInfo saved = captor.getValue();
            assertEquals(100L, saved.getUserId());
            assertNull(saved.getGender());
            assertEquals(32000, saved.getExpectedSalary());
        }
    }

    @Test
    @DisplayName("更新资料时支持将期望薪资清空为 null")
    void updatePersonInfo_AllowsClearingExpectedSalary() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(200L);
            PersonInfo existing = new PersonInfo();
            existing.setId(10L);
            existing.setUserId(200L);
            existing.setExpectedSalary(45000);
            when(personInfoRepository.findByUserId(200L)).thenReturn(Optional.of(existing));

            PersonUpdateRequest request = new PersonUpdateRequest();
            request.setExpectedSalary(null);

            personController.updatePersonInfo(request);

            ArgumentCaptor<PersonInfo> captor = ArgumentCaptor.forClass(PersonInfo.class);
            verify(personInfoRepository).save(captor.capture());
            PersonInfo saved = captor.getValue();
            assertNull(saved.getExpectedSalary());
        }
    }

    @Test
    @DisplayName("获取个人资料时返回头像访问地址")
    void getPersonInfo_IncludesAvatarUrl() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(300L);
            PersonInfo existing = new PersonInfo();
            existing.setId(11L);
            existing.setUserId(300L);
            existing.setRealName("头像用户");
            existing.setAvatarUrl("s3://resumes/avatar_300.jpg");
            when(personInfoRepository.findByUserId(300L)).thenReturn(Optional.of(existing));

            var result = personController.getPersonInfo();

            assertNotNull(result.getData());
            assertEquals("/person/avatar/public/300", result.getData().getAvatarUrl());
        }
    }

    @Test
    @DisplayName("获取综合能力评估时返回五维分数与总分")
    void getAbilityAssessment_ReturnsAssessmentPayload() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(300L);
            AbilityAssessmentResponse expected = new AbilityAssessmentResponse(
                88,
                "HIGH",
                5,
                new AbilityAssessmentResponse.DimensionScores(90, 85, 80, 75, 70),
                "2026-04-25T00:00:00Z"
            );
            when(personAbilityAssessmentService.assess(300L)).thenReturn(expected);

            var result = personController.getAbilityAssessment();

            assertNotNull(result.getData());
            assertEquals(88, result.getData().getTotalScore());
            assertEquals(90, result.getData().getDimensions().getBreadth());
            assertEquals("HIGH", result.getData().getLevel());
            verify(personAbilityAssessmentService).assess(300L);
        }
    }

    @Test
    @DisplayName("获取个人图谱时附带真实姓名与头像访问地址")
    void getPersonGraph_IncludesRealNameAndAvatarUrl() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(400L);
            Map<String, Object> graph = new HashMap<>();
            graph.put("personId", 400L);
            graph.put("skills", List.of("Java", "Spring Boot"));
            graph.put("success", true);
            when(skillGraphClient.getPersonSkillGraph(400L)).thenReturn(graph);

            PersonInfo personInfo = new PersonInfo();
            personInfo.setUserId(400L);
            personInfo.setRealName("斯蒂芬森");
            personInfo.setAvatarUrl("avatar/user_400.png");
            when(personInfoRepository.findByUserId(400L)).thenReturn(Optional.of(personInfo));
            when(industrySkillClassificationService.classifyPersonSkills(List.of("Java", "Spring Boot"))).thenReturn(
                Map.of(
                    "industryMatch", Map.of("industryId", 12L, "industryName", "计算机软件", "matched", true),
                    "skillCategories", List.of(Map.of("code", "backend", "name", "后端开发", "skills", List.of("Java", "Spring Boot")))
                )
            );

            var result = personController.getPersonGraph();

            assertNotNull(result.getData());
            assertEquals("斯蒂芬森", result.getData().get("realName"));
            assertEquals("/person/avatar/public/400", result.getData().get("avatarUrl"));
            assertEquals(List.of("Java", "Spring Boot"), result.getData().get("skills"));
            assertNotNull(result.getData().get("industryMatch"));
            assertNotNull(result.getData().get("skillCategories"));
            verify(skillGraphClient).upsertPersonIndustryClassification(eq(400L), eq(12L), eq("计算机软件"), any());
        }
    }

    @Test
    @DisplayName("获取个人图谱时无资料记录仍返回空姓名和头像")
    void getPersonGraph_AllowsNullRealNameWhenPersonInfoMissing() {
        try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(401L);
            Map<String, Object> graph = new HashMap<>();
            graph.put("personId", 401L);
            graph.put("skills", List.of("React"));
            graph.put("success", true);
            when(skillGraphClient.getPersonSkillGraph(401L)).thenReturn(graph);
            Map<String, Object> unmatchedIndustry = new HashMap<>();
            unmatchedIndustry.put("industryId", null);
            unmatchedIndustry.put("industryName", null);
            unmatchedIndustry.put("matched", false);
            when(industrySkillClassificationService.classifyPersonSkills(List.of("React"))).thenReturn(
                Map.of(
                    "industryMatch", unmatchedIndustry,
                    "skillCategories", List.of()
                )
            );

            var result = personController.getPersonGraph();

            assertNotNull(result.getData());
            assertNull(result.getData().get("realName"));
            assertNull(result.getData().get("avatarUrl"));
            assertEquals(List.of("React"), result.getData().get("skills"));
        }
    }
}
