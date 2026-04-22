package com.graphhire.resume.infrastructure.ai;

public class OcrRequest {

    private final byte[] fileBytes;
    private final String fileName;
    private final String contentType;
    private final String sourcePath;

    public OcrRequest(byte[] fileBytes, String fileName, String contentType, String sourcePath) {
        this.fileBytes = fileBytes;
        this.fileName = fileName;
        this.contentType = contentType;
        this.sourcePath = sourcePath;
    }

    public byte[] getFileBytes() {
        return fileBytes;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public String getSourcePath() {
        return sourcePath;
    }
}
