package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import java.util.List;
import java.util.Optional;

public interface ResumeRepository {
    Optional<Resume> findById(Long id);
    List<Resume> findByUserId(Long userId);
    List<Resume> findByParseStatus(ParseStatus parseStatus);
    com.baomidou.mybatisplus.core.metadata.IPage<Resume> findPage(int page, int size);
    Resume save(Resume resume);
    void delete(Resume resume);
}
