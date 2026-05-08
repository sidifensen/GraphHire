package com.graphhire.resume.interfaces.dto;

import com.graphhire.resume.domain.model.UploadTask;

public record UploadTaskResponse(
    Long taskId,
    String status,
    String errorMessage,
    Long resumeId
) {
    public static UploadTaskResponse from(UploadTask task) {
        return new UploadTaskResponse(
            task.getId(),
            task.getStatus() == null ? null : task.getStatus().name(),
            task.getErrorMessage(),
            task.getResumeId()
        );
    }
}
