package com.graphhire.resume.infrastructure.persistence.repository;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
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
    public List<Resume> findByUserId(Long userId) {
        LambdaQueryWrapper<ResumePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ResumePO::getUserId, userId);
        List<ResumePO> pos = resumeMapper.selectList(wrapper);
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<Resume> findByParseStatus(ParseStatus parseStatus) {
        LambdaQueryWrapper<ResumePO> wrapper = new LambdaQueryWrapper<>();
        if (parseStatus != null) {
            wrapper.eq(ResumePO::getParseStatus, parseStatus.ordinal());
        }
        List<ResumePO> pos = resumeMapper.selectList(wrapper);
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public IPage<Resume> findPage(int page, int size) {
        Page<ResumePO> pageObj = new Page<>(page, size);
        IPage<ResumePO> pageResult = resumeMapper.selectPage(pageObj, null);
        return pageResult.convert(this::toDomain);
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
        resume.setFileType(po.getFileType());
        resume.setFileSize(po.getFileSize());
        if (po.getParseStatus() != null) {
            resume.setStatus(ParseStatus.values()[po.getParseStatus()]);
        }
        resume.setParseResult(po.getParseResult());
        resume.setParseError(po.getParseError());
        resume.setConfidence(po.getConfidence());
        resume.setIsDefault(po.getIsDefault());
        return resume;
    }

    private ResumePO toPO(Resume resume) {
        ResumePO po = new ResumePO();
        po.setId(resume.getId());
        po.setUserId(resume.getUserId());
        po.setFileName(resume.getFileName());
        po.setFilePath(resume.getFilePath());
        po.setFileType(resume.getFileType());
        po.setFileSize(resume.getFileSize());
        if (resume.getStatus() != null) {
            po.setParseStatus(resume.getStatus().ordinal());
        }
        po.setParseResult(resume.getParseResult());
        po.setParseError(resume.getParseError());
        po.setConfidence(resume.getConfidence());
        po.setIsDefault(resume.getIsDefault());
        return po;
    }
}
