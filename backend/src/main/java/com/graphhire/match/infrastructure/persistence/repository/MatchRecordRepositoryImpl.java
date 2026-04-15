package com.graphhire.match.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class MatchRecordRepositoryImpl implements MatchRecordRepository {

    @Autowired
    private MatchRecordMapper matchRecordMapper;

    @Override
    public Optional<MatchRecord> findById(Long id) {
        MatchRecordPO po = matchRecordMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<MatchRecord> findByResumeId(Long resumeId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getResumeId, resumeId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public List<MatchRecord> findByJobId(Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public List<MatchRecord> findByResumeIdAndJobId(Long resumeId, Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getResumeId, resumeId)
               .eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public MatchRecord save(MatchRecord matchRecord) {
        MatchRecordPO po = toPO(matchRecord);
        if (matchRecord.getId() == null) {
            matchRecordMapper.insert(po);
        } else {
            matchRecordMapper.updateById(po);
        }
        return matchRecord;
    }

    @Override
    public void delete(MatchRecord matchRecord) {
        matchRecordMapper.deleteById(matchRecord.getId());
    }

    @Override
    public long count() {
        return matchRecordMapper.selectCount(null);
    }

    private MatchRecord toDomain(MatchRecordPO po) {
        if (po == null) return null;
        MatchRecord record = new MatchRecord();
        record.setId(po.getId());
        record.setMatchReason(po.getMatchReason());
        MatchScore score = MatchScore.of(
            po.getSkillScore().doubleValue(),
            po.getExpScore().doubleValue(),
            po.getCityScore().doubleValue(),
            po.getEduScore().doubleValue(),
            po.getSalScore().doubleValue()
        );
        return record;
    }

    private MatchRecordPO toPO(MatchRecord record) {
        MatchRecordPO po = new MatchRecordPO();
        po.setId(record.getId());
        po.setResumeId(record.getResumeId());
        po.setJobId(record.getJobId());
        if (record.getScore() != null) {
            po.setSkillScore(BigDecimal.valueOf(record.getScore().getSkillScore()));
            po.setExpScore(BigDecimal.valueOf(record.getScore().getExpScore()));
            po.setCityScore(BigDecimal.valueOf(record.getScore().getCityScore()));
            po.setEduScore(BigDecimal.valueOf(record.getScore().getEduScore()));
            po.setSalScore(BigDecimal.valueOf(record.getScore().getSalScore()));
        }
        po.setMatchReason(record.getMatchReason());
        po.setIsRead(record.getIsRead());
        return po;
    }
}
