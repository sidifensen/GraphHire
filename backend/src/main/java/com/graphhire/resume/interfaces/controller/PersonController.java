package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
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
            return Result.error("个人信息不存在");
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
            personInfo.getExpectedSalary()
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

        // 更新请求中的字段
        if (request.getRealName() != null) {
            personInfo.setRealName(request.getRealName());
        }
        if (request.getGender() != null) {
            personInfo.setGender(request.getGender());
        }
        if (request.getAge() != null) {
            personInfo.setAge(request.getAge());
        }
        if (request.getPhone() != null) {
            personInfo.setPhone(request.getPhone());
        }
        if (request.getEducation() != null) {
            personInfo.setEducation(request.getEducation());
        }
        if (request.getCity() != null) {
            personInfo.setCity(request.getCity());
        }
        if (request.getTargetCity() != null) {
            personInfo.setTargetCity(request.getTargetCity());
        }
        if (request.getExpectedSalary() != null) {
            personInfo.setExpectedSalary(request.getExpectedSalary());
        }

        personInfoRepository.save(personInfo);
        return Result.success();
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
