package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.UploadTask;

import java.util.Optional;

/**
 * 上传任务仓储。
 * 说明：提供异步上传任务状态的持久化与查询能力。
 */
public interface UploadTaskRepository {
    UploadTask save(UploadTask uploadTask);
    Optional<UploadTask> findById(Long id);
}
