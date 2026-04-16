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
     * GET /person/info - 获取个人信息
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
     * PUT /person/info - 更新个人信息
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

        // Update fields from request
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
     * POST /person/resume/upload - 上传简历
     */
    @PostMapping("/resume/upload")
    public Result<Resume> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        Long userId = StpUtil.getLoginIdAsLong();

        // Validate file type
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".doc") && !fileName.endsWith(".docx") && !fileName.endsWith(".pdf"))) {
            return Result.error(400, "只支持 doc/docx/pdf 格式");
        }

        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            return Result.error(400, "文件大小不能超过 10MB");
        }

        UploadResumeCmd cmd = new UploadResumeCmd(file);
        cmd.setUserId(userId);
        Resume resume = resumeAppService.uploadResume(cmd);
        return Result.success(resume);
    }

    /**
     * GET /person/resume/list - 简历列表
     */
    @GetMapping("/resume/list")
    public Result<List<Resume>> listResumes() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Resume> resumes = resumeAppService.getResumesByUserId(userId);
        return Result.success(resumes);
    }

    /**
     * DELETE /person/resume/{id} - 删除简历
     */
    @DeleteMapping("/resume/{id}")
    public Result<Void> deleteResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.deleteResume(id, userId);
        return Result.success();
    }

    /**
     * PUT /person/resume/{id}/default - 设置默认简历
     */
    @PutMapping("/resume/{id}/default")
    public Result<Void> setDefaultResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.setDefaultResume(id, userId);
        return Result.success();
    }

    /**
     * POST /person/resume/{id}/parse - 重新解析简历
     */
    @PostMapping("/resume/{id}/parse")
    public Result<Void> parseResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeAppService.triggerResumeParse(id, userId);
        return Result.success();
    }

    /**
     * GET /person/resume/{id}/detail - 简历详情（解析后）
     */
    @GetMapping("/resume/{id}/detail")
    public Result<Resume> getResumeDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Resume resume = resumeAppService.getResumeDetail(id, userId);
        return Result.success(resume);
    }

    /**
     * GET /person/graph - 获取个人能力图谱
     */
    @GetMapping("/graph")
    public Result<Map<String, Object>> getPersonGraph() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> graph = skillGraphClient.getPersonSkillGraph(userId);
        return Result.success(graph);
    }

    /**
     * GET /person/recommend/jobs - 获取推荐职位列表
     */
    @GetMapping("/recommend/jobs")
    public Result<List<MatchDetailResponse>> getRecommendedJobs() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<MatchDetailResponse> recommendations = matchAppService.getRecommendedJobsForPerson(userId);
        return Result.success(recommendations);
    }

    /**
     * GET /person/match/{jobId} - 获取与职位的匹配详情
     */
    @GetMapping("/match/{jobId}")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        MatchDetailResponse matchDetail = matchAppService.getMatchDetailForPersonAndJob(userId, jobId);
        return Result.success(matchDetail);
    }
}
