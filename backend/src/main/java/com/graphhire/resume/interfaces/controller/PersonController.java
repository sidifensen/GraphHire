package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.resume.application.service.PersonAbilityAssessmentService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.interfaces.dto.AbilityAssessmentResponse;
import com.graphhire.resume.interfaces.dto.PersonInfoResponse;
import com.graphhire.resume.interfaces.dto.request.PersonUpdateRequest;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
            personInfo.getEducation(),
            personInfo.getCity(),
            personInfo.getTargetCity(),
            personInfo.getExpectedSalary(),
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

        // PUT 语义：请求中的字段按当前值覆盖，允许清空
        personInfo.setRealName(request.getRealName());
        personInfo.setGender(normalizeGender(request.getGender()));
        personInfo.setAge(request.getAge());
        personInfo.setPhone(request.getPhone());
        personInfo.setEducation(request.getEducation());
        personInfo.setCity(request.getCity());
        personInfo.setTargetCity(request.getTargetCity());
        personInfo.setExpectedSalary(request.getExpectedSalary());

        personInfoRepository.save(personInfo);
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
        return Result.success(graph);
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
