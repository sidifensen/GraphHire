package com.graphhire.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResumeUploadRequest {
    @NotBlank(message = "文件名不能为空")
    private String fileName;
    @NotBlank(message = "文件路径不能为空")
    private String filePath;
    @NotBlank(message = "文件类型不能为空")
    private String fileType;
    private Long fileSize;
}
