package com.graphhire.resume.infrastructure.persistence.repository;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class ResumeRepositoryImpl implements ResumeRepository {

    @Autowired
    private ResumeMapper resumeMapper;

    @Override
    public Optional<Resume> findById(Long id) {
        ResumePO po = resumeMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Resume save(Resume resume) {
        ResumePO po = toPO(resume);
        if (resume.getId() == null) {
            resumeMapper.insert(po);
            resume.setId(po.getId());
        } else {
            resumeMapper.updateById(po);
        }
        return resume;
    }

    @Override
    public void delete(Resume resume) {
        resumeMapper.deleteById(resume.getId());
    }

    private Resume toDomain(ResumePO po) {
        Resume resume = new Resume();
        resume.setId(po.getId());
        resume.setUserId(po.getUserId());
        resume.setFileName(po.getFileName());
        resume.setFilePath(po.getFilePath());
        resume.setStatus(ParseStatus.valueOf(po.getStatus()));
        resume.setParseResult(po.getParseResult());
        resume.setRetryCount(po.getRetryCount());
        return resume;
    }

    private ResumePO toPO(Resume resume) {
        ResumePO po = new ResumePO();
        po.setId(resume.getId());
        po.setUserId(resume.getUserId());
        po.setFileName(resume.getFileName());
        po.setFilePath(resume.getFilePath());
        po.setStatus(resume.getStatus().name());
        po.setParseResult(resume.getParseResult());
        po.setRetryCount(resume.getRetryCount());
        return po;
    }
}
