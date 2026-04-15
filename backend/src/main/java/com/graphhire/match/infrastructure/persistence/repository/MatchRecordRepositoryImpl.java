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
        return toDomain(po);
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
        record.setResumeId(po.getResumeId());
        record.setJobId(po.getJobId());
        record.setMatchReason(po.getMatchReport());

        if (po.getSkillScore() != null || po.getExperienceScore() != null ||
            po.getCityScore() != null || po.getEducationScore() != null ||
            po.getSalaryScore() != null) {
            double skill = po.getSkillScore() != null ? po.getSkillScore().doubleValue() : 0;
            double exp = po.getExperienceScore() != null ? po.getExperienceScore().doubleValue() : 0;
            double city = po.getCityScore() != null ? po.getCityScore().doubleValue() : 0;
            double edu = po.getEducationScore() != null ? po.getEducationScore().doubleValue() : 0;
            double sal = po.getSalaryScore() != null ? po.getSalaryScore().doubleValue() : 0;
            record.setScore(MatchScore.of(skill, exp, city, edu, sal));
        }

        // status: 0=pending(not read), 1=viewed(read)
        record.setIsRead(po.getStatus() != null && po.getStatus() == 1);

        return record;
    }

    private MatchRecordPO toPO(MatchRecord record) {
        MatchRecordPO po = new MatchRecordPO();
        po.setId(record.getId());
        po.setResumeId(record.getResumeId());
        po.setJobId(record.getJobId());
        po.setMatchReport(record.getMatchReason());

        if (record.getScore() != null) {
            po.setOverallScore(BigDecimal.valueOf(record.getScore().getTotal()));
            po.setSkillScore(BigDecimal.valueOf(record.getScore().getSkillScore()));
            po.setExperienceScore(BigDecimal.valueOf(record.getScore().getExpScore()));
            po.setCityScore(BigDecimal.valueOf(record.getScore().getCityScore()));
            po.setEducationScore(BigDecimal.valueOf(record.getScore().getEduScore()));
            po.setSalaryScore(BigDecimal.valueOf(record.getScore().getSalScore()));
        }

        // isRead: false=0(pending), true=1(viewed)
        po.setStatus(record.getIsRead() != null && record.getIsRead() ? 1 : 0);

        return po;
    }
}
