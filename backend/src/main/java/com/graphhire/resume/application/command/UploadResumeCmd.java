package com.graphhire.resume.application.command;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public class UploadResumeCmd {
    private MultipartFile file;
    private Long userId;

    public UploadResumeCmd(MultipartFile file) {
        this.file = file;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public byte[] getFileBytes() throws IOException {
        return file.getBytes();
    }

    public String getFileName() {
        return file.getOriginalFilename();
    }
}
