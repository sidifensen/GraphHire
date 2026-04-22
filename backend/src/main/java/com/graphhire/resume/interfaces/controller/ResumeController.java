package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.interfaces.dto.ParseProgressResponse;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * 简历管理接口
 * 提供简历上传、详情查询和列表查询功能
 */
@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeAppService resumeService;

    /**
     * 上传简历（当前用户）
     * @param file 上传的文件
     * @return 上传结果，包含简历ID
     */
    @PostMapping("/my/upload")
    public Result<Resume> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        Long userId = StpUtil.getLoginIdAsLong();
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        cmd.setUserId(userId);
        Resume resume = resumeService.uploadResume(cmd);
        return Result.success(resume);
    }

    /**
     * 获取当前用户简历列表
     * @return 简历列表
     */
    @GetMapping("/my")
    public Result<List<Resume>> getMyResumes() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Resume> resumes = resumeService.getResumesByUserId(userId);
        return Result.success(resumes);
    }

    /**
     * 获取简历详情
     * @param id 简历ID
     * @return 简历详情
     */
    @GetMapping("/{id}/detail")
    public Result<Resume> getDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Resume resume = resumeService.getResumeDetail(id, userId);
        return Result.success(resume);
    }

    /**
     * 删除简历（需校验所有权）
     * @param id 简历ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeService.deleteResume(id, userId);
        return Result.success();
    }

    /**
     * 设置默认简历
     * @param id 简历ID
     * @return 设置结果
     */
    @PutMapping("/{id}/default")
    public Result<Void> setDefaultResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeService.setDefaultResume(id, userId);
        return Result.success();
    }

    /**
     * 重新解析简历
     * @param id 简历ID
     * @return 解析结果
     */
    @PostMapping("/{id}/parse")
    public Result<Void> parseResume(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        resumeService.triggerResumeParse(id, userId);
        return Result.success();
    }

    /**
     * 获取简历列表
     * @param page 页码
     * @param size 每页数量
     * @return 简历列表
     */
    @GetMapping("/list")
    public Result<PageResult<ResumeVO>> getList(@RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        PageResult<ResumeVO> result = resumeService.getList(page, size);
        return Result.success(result);
    }

    /**
     * 获取简历解析进度
     * @param id 简历ID
     * @return 解析进度信息
     */
    @GetMapping("/{id}/progress")
    public Result<ParseProgressResponse> getParseProgress(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        ParseProgressResponse progress = resumeService.getParseProgress(id, userId);
        return Result.success(progress);
    }
}
