package com.graphhire.match.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        return matchRecordMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<MatchRecord> findByJobId(Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    /**
     * 按职位ID集合批量统计匹配记录数。
     * 说明：提供企业看板聚合统计能力，避免逐岗位调用findByJobId。
     */
    @Override
    public Map<Long, Long> countByJobIds(List<Long> jobIds) {
        if (jobIds == null || jobIds.isEmpty()) {
            return Map.of();
        }
        List<Map<String, Object>> rows = matchRecordMapper.countByJobIds(jobIds);
        Map<Long, Long> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            if (row == null) {
                continue;
            }
            Object jobIdObj = row.get("jobId");
            Object countObj = row.get("matchCount");
            if (jobIdObj instanceof Number jobIdNumber && countObj instanceof Number countNumber) {
                result.put(jobIdNumber.longValue(), countNumber.longValue());
            }
        }
        return result;
    }

    @Override
    public List<MatchRecord> findByResumeIdAndJobId(Long resumeId, Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getResumeId, resumeId).eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public MatchRecord save(MatchRecord matchRecord) {
        MatchRecordPO po = toPO(matchRecord);
        if (matchRecord.getId() == null) {
            matchRecordMapper.insertScores(
                po.getResumeId(),
                po.getJobId(),
                po.getMatchDirection(),
                po.getOverallScore(),
                po.getSkillScore(),
                po.getRequirementScore()
            );
        } else {
            matchRecordMapper.updateScores(
                po.getId(),
                po.getMatchDirection(),
                po.getOverallScore(),
                po.getSkillScore(),
                po.getRequirementScore()
            );
        }
        return toDomain(po);
    }

    @Override
    public void delete(MatchRecord matchRecord) {
        matchRecordMapper.deleteById(matchRecord.getId());
    }

    @Override
    public void deleteByResumeId(Long resumeId) {
        if (resumeId == null) return;
        matchRecordMapper.deleteByResumeId(resumeId);
    }

    @Override
    public void deleteByJobId(Long jobId) {
        if (jobId == null) return;
        matchRecordMapper.deleteByJobId(jobId);
    }

    @Override
    public long count() {
        return matchRecordMapper.selectCount(null);
    }

    private MatchRecord toDomain(MatchRecordPO po) {
        if (po == null) return null;
        MatchRecord record = new MatchRecord();
        record.setId(po.getId());
        record.setResumeId(po.getResumeId());
        record.setJobId(po.getJobId());
        record.setMatchDirection(po.getMatchDirection());
        record.setScore(MatchScore.of(
            po.getSkillScore() == null ? 0 : po.getSkillScore().doubleValue(),
            po.getRequirementScore() == null ? 0 : po.getRequirementScore().doubleValue()
        ));
        return record;
    }

    private MatchRecordPO toPO(MatchRecord record) {
        MatchRecordPO po = new MatchRecordPO();
        po.setId(record.getId());
        po.setResumeId(record.getResumeId());
        po.setJobId(record.getJobId());
        po.setMatchDirection(record.getMatchDirection());
        if (record.getScore() != null) {
            po.setOverallScore(BigDecimal.valueOf(record.getScore().getTotal()));
            po.setSkillScore(BigDecimal.valueOf(record.getScore().getSkillScore()));
            po.setRequirementScore(BigDecimal.valueOf(record.getScore().getRequirementScore()));
        }
        return po;
    }
}
