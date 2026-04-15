package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.infrastructure.persistence.mapper.ResumeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ResumeRepositoryImpl implements ResumeRepository {
    private final ResumeMapper resumeMapper;

    @Override
    public Resume findById(Long id) {
        return resumeMapper.selectById(id);
    }

    @Override
    public Optional<Resume> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public List<Resume> findByUserId(Long userId) {
        return resumeMapper.selectList(new LambdaQueryWrapper<Resume>().eq(Resume::getUserId, userId));
    }

    @Override
    public List<Resume> findByUserId(Long userId, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return resumeMapper.selectList(new LambdaQueryWrapper<Resume>()
                .eq(Resume::getUserId, userId)
                .orderByDesc(Resume::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public Resume save(Resume resume) {
        if (resume.getId() == null) {
            resumeMapper.insert(resume);
        } else {
            resumeMapper.updateById(resume);
        }
        return resume;
    }

    @Override
    public void delete(Long id) {
        resumeMapper.deleteById(id);
    }

    @Override
    public int countByUserId(Long userId) {
        return resumeMapper.selectCount(new LambdaQueryWrapper<Resume>().eq(Resume::getUserId, userId)).intValue();
    }

    @Override
    public Long countAll() {
        return resumeMapper.selectCount(null);
    }

    @Override
    public Resume findDefaultByUserId(Long userId) {
        return resumeMapper.selectOne(new LambdaQueryWrapper<Resume>()
                .eq(Resume::getUserId, userId)
                .eq(Resume::getIsDefault, true));
    }

    @Override
    public Optional<Resume> findDefaultByUserIdOptional(Long userId) {
        return Optional.ofNullable(findDefaultByUserId(userId));
    }

    @Override
    public List<Resume> findAllDefaultResumes() {
        return resumeMapper.selectList(new LambdaQueryWrapper<Resume>().eq(Resume::getIsDefault, true));
    }

    @Override
    public List<Resume> findByKeyword(String keyword, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return resumeMapper.selectList(new LambdaQueryWrapper<Resume>()
                .like(Resume::getFileName, keyword)
                .orderByDesc(Resume::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public Long countByKeyword(String keyword) {
        return resumeMapper.selectCount(new LambdaQueryWrapper<Resume>().like(Resume::getFileName, keyword));
    }
}
