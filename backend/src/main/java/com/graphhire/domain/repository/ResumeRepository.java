package com.graphhire.domain.repository;

import com.graphhire.domain.model.Resume;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository {
    Resume findById(Long id);
    Optional<Resume> findByIdOptional(Long id);
    List<Resume> findByUserId(Long userId);
    List<Resume> findByUserId(Long userId, Integer page, Integer pageSize);
    Resume save(Resume resume);
    void delete(Long id);
    int countByUserId(Long userId);
    Long countAll();
    Resume findDefaultByUserId(Long userId);
    Optional<Resume> findDefaultByUserIdOptional(Long userId);
    List<Resume> findAllDefaultResumes();
    List<Resume> findByKeyword(String keyword, Integer page, Integer pageSize);
    Long countByKeyword(String keyword);
}
