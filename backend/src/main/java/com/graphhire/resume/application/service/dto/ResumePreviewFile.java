package com.graphhire.resume.application.service.dto;

/**
 * 简历预览文件数据
 */
public class ResumePreviewFile {
    private final byte[] content;
    private final String fileName;
    private final String contentType;

    public ResumePreviewFile(byte[] content, String fileName, String contentType) {
        this.content = content;
        this.fileName = fileName;
        this.contentType = contentType;
    }

    public byte[] getContent() {
        return content;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }
}
