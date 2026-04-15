package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.Resume;
import java.util.Optional;

public interface ResumeRepository {
    Optional<Resume> findById(Long id);
    Resume save(Resume resume);
    void delete(Resume resume);
}
