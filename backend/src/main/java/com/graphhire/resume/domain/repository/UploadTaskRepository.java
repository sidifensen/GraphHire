package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.UploadTask;

import java.util.Optional;

public interface UploadTaskRepository {
    UploadTask save(UploadTask uploadTask);
    Optional<UploadTask> findById(Long id);
}
