package com.graphhire.resume.interfaces.controller;

import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
     * 上传简历
     * @param file 上传的文件
     * @return 上传结果，包含简历ID
     */
    @PostMapping("/upload")
    public Result<Long> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        Resume resume = resumeService.uploadResume(cmd);
        return Result.success(resume.getId());
    }

    /**
     * 获取简历详情
     * @param id 简历ID
     * @return 简历详情
     */
    @GetMapping("/{id}/detail")
    public Result<ResumeVO> getDetail(@PathVariable Long id) {
        ResumeVO vo = resumeService.getDetail(id);
        return Result.success(vo);
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
}
