package com.graphhire.resume.iface.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.Resume;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeAppService resumeService;

    @PostMapping("/upload")
    public Result<Long> uploadResume(@RequestParam("file") MultipartFile file) {
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        Resume resume = resumeService.uploadResume(cmd);
        return Result.success(resume.getId());
    }

    @GetMapping("/{id}/detail")
    public Result<Resume> getDetail(@PathVariable Long id) {
        return Result.success(null);
    }

    @GetMapping("/list")
    public Result<Object> getList() {
        return Result.success(null);
    }
}
