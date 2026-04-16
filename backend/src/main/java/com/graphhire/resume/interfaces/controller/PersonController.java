package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.interfaces.dto.PersonInfoResponse;
import com.graphhire.resume.interfaces.dto.request.PersonUpdateRequest;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 个人用户简历管理接口
 * 提供个人信息管理、简历管理、图谱查询和推荐功能
 */
@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private ResumeAppService resumeAppService;

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
     * 上传简历
     * @param file 简历文件
     * @return 上传结果
     */
    @PostMapping("/resume/upload")
    public Result<Resume> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        Long userId = StpUtil.getLoginIdAsLong();

        // 校验文件类型
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".doc") && !fileName.endsWith(".docx") && !fileName.endsWith(".pdf"))) {
            return Result.error(400, "只支持 doc/docx/pdf 格式");
        }

        // 校验文件大小（最大10MB）
        if (file.getSize() > 10 * 1024 * 1024) {
            return Result.error(400, "文件大小不能超过 10MB");
        }

        UploadResumeCmd cmd = new UploadResumeCmd(file);
        cmd.setUserId(userId);
        Resume resume = resumeAppService.uploadResume(cmd);
        return Result.success(resume);
    }

    /**
     * 获取简历列表
     * @return 简历列表
     */
    @GetMapping("/resume/list")
    public Result<List<Resume>> listResumes() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Resume> resumes = resumeAppService.getResumesByUserId(userId);
        return Result.success(resumes);
    }

    /**
     * 删除简历
     * @param id 简历ID
     * @return 删除结果
     */
    @DeleteMapping("/resume/{id}")
    public Result<Void> deleteResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.deleteResume(id, userId);
        return Result.success();
    }

    /**
     * 设置默认简历
     * @param id 简历ID
     * @return 设置结果
     */
    @PutMapping("/resume/{id}/default")
    public Result<Void> setDefaultResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.setDefaultResume(id, userId);
        return Result.success();
    }

    /**
     * 重新解析简历
     * @param id 简历ID
     * @return 解析结果
     */
    @PostMapping("/resume/{id}/parse")
    public Result<Void> parseResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.triggerResumeParse(id, userId);
        return Result.success();
    }

    /**
     * 获取简历详情
     * @param id 简历ID
     * @return 简历详情
     */
    @GetMapping("/resume/{id}/detail")
    public Result<Resume> getResumeDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Resume resume = resumeAppService.getResumeDetail(id, userId);
        return Result.success(resume);
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
