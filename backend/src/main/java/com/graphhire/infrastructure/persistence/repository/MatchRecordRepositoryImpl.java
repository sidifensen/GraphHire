package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.MatchRecord;
import com.graphhire.domain.repository.MatchRecordRepository;
import com.graphhire.infrastructure.persistence.mapper.MatchRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MatchRecordRepositoryImpl implements MatchRecordRepository {
    private final MatchRecordMapper matchRecordMapper;

    @Override
    public MatchRecord findById(Long id) {
        return matchRecordMapper.selectById(id);
    }

    @Override
    public Optional<MatchRecord> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public List<MatchRecord> findByResumeId(Long resumeId) {
        return matchRecordMapper.selectList(new LambdaQueryWrapper<MatchRecord>().eq(MatchRecord::getResumeId, resumeId));
    }

    @Override
    public List<MatchRecord> findByJobId(Long jobId) {
        return matchRecordMapper.selectList(new LambdaQueryWrapper<MatchRecord>().eq(MatchRecord::getJobId, jobId));
    }

    @Override
    public MatchRecord save(MatchRecord record) {
        if (record.getId() == null) {
            matchRecordMapper.insert(record);
        } else {
            matchRecordMapper.updateById(record);
        }
        return record;
    }
}
