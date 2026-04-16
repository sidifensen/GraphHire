package com.graphhire.resume.application.command;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 上传简历命令对象
 * 封装简历上传请求参数
 */
public class UploadResumeCmd {
    /** 上传的文件 */
    private MultipartFile file;
    /** 上传用户ID */
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

    /** 获取文件字节数据 */
    public byte[] getFileBytes() throws IOException {
        return file.getBytes();
    }

    /** 获取原始文件名 */
    public String getFileName() {
        return file.getOriginalFilename();
    }
}
