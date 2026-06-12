package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.resume.application.service.GraphBuildService;
import com.graphhire.resume.application.service.PersonAbilityAssessmentService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.interfaces.dto.AbilityAssessmentResponse;
import com.graphhire.resume.interfaces.dto.PersonInfoResponse;
import com.graphhire.resume.interfaces.dto.request.PersonUpdateRequest;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

/**
 * 个人用户接口
 * 提供个人信息管理、能力图谱查询和职位推荐功能
 */
@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private MatchAppService matchAppService;

    @Autowired
    private SkillGraphClient skillGraphClient;

    @Autowired
    private PersonAbilityAssessmentService personAbilityAssessmentService;

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private GraphBuildService graphBuildService;

    /**
     * 获取个人信息
     * @return 个人信息
     */
    @GetMapping("/info")
    public Result<PersonInfoResponse> getPersonInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        PersonInfo personInfo = personInfoRepository.findByUserId(userId)
            .orElse(null);
        if (personInfo == null) {
            return Result.success(null);
        }
        PersonInfoResponse response = new PersonInfoResponse(
            personInfo.getId(),
            personInfo.getUserId(),
            personInfo.getRealName(),
            personInfo.getGender(),
            personInfo.getAge(),
            personInfo.getPhone(),
            personInfo.getEmail(),
            personInfo.getEducation(),
            personInfo.getSchool(),
            personInfo.getCity(),
            personInfo.getTargetCity(),
            personInfo.getExpectedSalary(),
            personInfo.getExpectedPositionTypeIds(),
            personInfo.getDefaultPositionTypeId(),
            personInfo.getAvatarUrl() == null ? null : "/person/avatar/public/" + userId
        );
        return Result.success(response);
    }

    /**
     * 更新个人信息
     * @param request 更新请求
     * @return 更新结果
     */
    @PutMapping("/info")
    public Result<Void> updatePersonInfo(@RequestBody PersonUpdateRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        PersonInfo personInfo = personInfoRepository.findByUserId(userId)
            .orElseGet(() -> {
                PersonInfo newInfo = new PersonInfo();
                newInfo.setUserId(userId);
                return newInfo;
            });

        // 记录旧的默认职位类型，用于判断是否需要重分类
        Long oldDefaultPositionTypeId = personInfo.getDefaultPositionTypeId();

        // PUT 语义：请求中的字段按当前值覆盖，允许清空
        personInfo.setRealName(request.getRealName());
        personInfo.setGender(normalizeGender(request.getGender()));
        personInfo.setAge(request.getAge());
        personInfo.setPhone(request.getPhone());
        personInfo.setEmail(request.getEmail());
        personInfo.setEducation(request.getEducation());
        personInfo.setSchool(request.getSchool());
        personInfo.setCity(request.getCity());
        personInfo.setTargetCity(request.getTargetCity());
        personInfo.setExpectedSalary(request.getExpectedSalary());
        List<Long> normalizedExpectedPositionTypeIds = normalizeExpectedPositionTypeIds(request.getExpectedPositionTypeIds());
        Long normalizedDefaultPositionTypeId = normalizeDefaultPositionTypeId(request.getDefaultPositionTypeId(), normalizedExpectedPositionTypeIds);
        personInfo.setExpectedPositionTypeIds(normalizedExpectedPositionTypeIds);
        personInfo.setDefaultPositionTypeId(normalizedDefaultPositionTypeId);

        personInfoRepository.save(personInfo);

        // 若默认职位类型发生变更，异步触发图谱技能重分类
        if (!Objects.equals(oldDefaultPositionTypeId, normalizedDefaultPositionTypeId)) {
            CompletableFuture.runAsync(() -> graphBuildService.reapplyClassificationForUser(userId));
        }

        return Result.success();
    }

    private Integer normalizeGender(Integer gender) {
        if (gender == null || gender == 0) {
            return null;
        }
        return gender;
    }

    /**
     * 获取个人能力图谱
     * @return 个人图谱
     */
    @GetMapping("/graph")
    public Result<Map<String, Object>> getPersonGraph() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> graph = skillGraphClient.getPersonSkillGraph(userId);
        Map<String, Object> classification = skillGraphClient.getPersonPositionTypeClassification(userId);
        PersonInfo personInfo = personInfoRepository.findByUserId(userId).orElse(null);

        graph.put("realName", personInfo == null ? null : personInfo.getRealName());
        graph.put(
            "avatarUrl",
            personInfo == null || personInfo.getAvatarUrl() == null ? null : "/person/avatar/public/" + userId
        );

        // positionTypeMatch 从 SQL 的 defaultPositionTypeId 读取，避免图数据库关系未同步的问题
        Map<String, Object> positionTypeMatchFromSql = buildPositionTypeMatchFromPersonInfo(personInfo);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skillCategories = classification == null
            ? null
            : (List<Map<String, Object>>) classification.get("skillCategories");
        graph.put("positionTypeMatch", positionTypeMatchFromSql);
        graph.put("skillCategories", skillCategories == null ? List.of() : skillCategories);

        return Result.success(graph);
    }

    private Map<String, Object> normalizePositionTypeMatch(Map<String, Object> rawMatch) {
        if (rawMatch == null) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("positionTypeId", null);
            fallback.put("positionTypeName", null);
            fallback.put("matched", false);
            return fallback;
        }
        Object rawMatched = rawMatch.get("matched");
        boolean matched = rawMatched instanceof Boolean value ? value : false;
        Map<String, Object> normalized = new HashMap<>();
        normalized.put("positionTypeId", rawMatch.get("positionTypeId"));
        normalized.put("positionTypeName", rawMatch.get("positionTypeName"));
        normalized.put("matched", matched);
        return normalized;
    }

    /**
     * 从 SQL PersonInfo.defaultPositionTypeId 构建 positionTypeMatch，
     * 避免依赖图数据库中可能未同步的 BELONGS_TO_POSITION_TYPE 关系。
     */
    private Map<String, Object> buildPositionTypeMatchFromPersonInfo(PersonInfo personInfo) {
        Map<String, Object> result = new HashMap<>();
        Long defaultId = personInfo == null ? null : personInfo.getDefaultPositionTypeId();
        if (defaultId == null) {
            result.put("positionTypeId", null);
            result.put("positionTypeName", null);
            result.put("matched", false);
            return result;
        }
        try {
            PositionType pt = positionTypeAppService.getById(defaultId);
            result.put("positionTypeId", pt.getId());
            result.put("positionTypeName", pt.getName());
            result.put("matched", true);
        } catch (Exception e) {
            result.put("positionTypeId", defaultId);
            result.put("positionTypeName", null);
            result.put("matched", false);
        }
        return result;
    }

    private List<Long> normalizeExpectedPositionTypeIds(List<Long> rawIds) {
        if (rawIds == null || rawIds.isEmpty()) {
            return List.of();
        }
        List<Long> enabledLeafIds = positionTypeAppService.listAll().stream()
            .filter(item -> Integer.valueOf(3).equals(item.getLevel()))
            .filter(item -> Integer.valueOf(1).equals(item.getStatus()))
            .filter(item -> !Integer.valueOf(1).equals(item.getDeleted()))
            .map(PositionType::getId)
            .filter(Objects::nonNull)
            .toList();
        return rawIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .filter(enabledLeafIds::contains)
            .toList();
    }

    private Long normalizeDefaultPositionTypeId(Long rawDefaultPositionTypeId, List<Long> expectedPositionTypeIds) {
        if (rawDefaultPositionTypeId == null || expectedPositionTypeIds == null || expectedPositionTypeIds.isEmpty()) {
            return null;
        }
        return expectedPositionTypeIds.contains(rawDefaultPositionTypeId) ? rawDefaultPositionTypeId : null;
    }

    /**
     * 获取个人综合能力评估
     * @return 评估结果
     */
    @GetMapping("/ability-assessment")
    public Result<AbilityAssessmentResponse> getAbilityAssessment() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(personAbilityAssessmentService.assess(userId));
    }

    /**
     * 获取推荐职位列表
     * @return 推荐职位列表
     */
    @GetMapping("/recommend/jobs")
    public Result<List<MatchDetailResponse>> getRecommendedJobs() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<MatchDetailResponse> recommendations = matchAppService.getRecommendedJobsForPerson(userId);
        return Result.success(recommendations);
    }

    /**
     * 获取与职位的匹配详情
     * @param jobId 职位ID
     * @return 匹配详情
     */
    @GetMapping("/match/{jobId}")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        MatchDetailResponse matchDetail = matchAppService.getMatchDetailForPersonAndJob(userId, jobId);
        return Result.success(matchDetail);
    }
}
