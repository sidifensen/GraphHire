package com.graphhire.resume.interfaces.dto;

import com.graphhire.resume.domain.model.UploadTask;

/**
 * 上传任务查询响应。
 * 说明：仅返回轮询任务所需字段，避免暴露内部持久化细节。
 */
public record UploadTaskResponse(
    Long taskId,
    String status,
    String errorMessage,
    Long resumeId
) {
    /**
     * 从领域对象转换为接口响应。
     */
    public static UploadTaskResponse from(UploadTask task) {
        return new UploadTaskResponse(
            task.getId(),
            task.getStatus() == null ? null : task.getStatus().name(),
            task.getErrorMessage(),
            task.getResumeId()
        );
    }
}
