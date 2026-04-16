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

@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeAppService resumeService;

    @PostMapping("/upload")
    public Result<Long> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        Resume resume = resumeService.uploadResume(cmd);
        return Result.success(resume.getId());
    }

    @GetMapping("/{id}/detail")
    public Result<ResumeVO> getDetail(@PathVariable Long id) {
        ResumeVO vo = resumeService.getDetail(id);
        return Result.success(vo);
    }

    @GetMapping("/list")
    public Result<PageResult<ResumeVO>> getList(@RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        PageResult<ResumeVO> result = resumeService.getList(page, size);
        return Result.success(result);
    }
}
