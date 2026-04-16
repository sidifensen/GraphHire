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

/**
 * 匹配记录仓储实现
 *
 * 【模块说明】实现MatchRecordRepository接口，负责MatchRecord领域模型与数据库之间的转换。
 *
 * 【数据来源】
 * - MatchRecordMapper：MyBatis-Plus Mapper，对应match_record表
 *
 * 【方法概览】
 * - findById：根据ID查询
 * - findByResumeId：根据简历ID查询
 * - findByJobId：根据职位ID查询
 * - findByResumeIdAndJobId：根据简历和职位联合查询
 * - save：保存（新增或更新）
 * - delete：删除
 * - count：统计总数
 */
@Repository
public class MatchRecordRepositoryImpl implements MatchRecordRepository {

    /** 匹配记录 Mapper */
    @Autowired
    private MatchRecordMapper matchRecordMapper;

    /** 根据ID查询匹配记录 */
    @Override
    public Optional<MatchRecord> findById(Long id) {
        MatchRecordPO po = matchRecordMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /** 根据简历ID查询所有匹配记录 */
    @Override
    public List<MatchRecord> findByResumeId(Long resumeId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getResumeId, resumeId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    /** 根据职位ID查询所有匹配记录 */
    @Override
    public List<MatchRecord> findByJobId(Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    /** 根据简历ID和职位ID查询匹配记录 */
    @Override
    public List<MatchRecord> findByResumeIdAndJobId(Long resumeId, Long jobId) {
        LambdaQueryWrapper<MatchRecordPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchRecordPO::getResumeId, resumeId)
               .eq(MatchRecordPO::getJobId, jobId);
        return matchRecordMapper.selectList(wrapper).stream()
            .map(this::toDomain)
            .toList();
    }

    /** 保存匹配记录（根据ID是否为空判断新增或更新） */
    @Override
    public MatchRecord save(MatchRecord matchRecord) {
        MatchRecordPO po = toPO(matchRecord);
        if (matchRecord.getId() == null) {
            // 新增
            matchRecordMapper.insert(po);
        } else {
            // 更新
            matchRecordMapper.updateById(po);
        }
        return toDomain(po);
    }

    /** 删除匹配记录 */
    @Override
    public void delete(MatchRecord matchRecord) {
        matchRecordMapper.deleteById(matchRecord.getId());
    }

    /** 统计匹配记录总数 */
    @Override
    public long count() {
        return matchRecordMapper.selectCount(null);
    }

    // =====================================================
    // 【第一部分】PO与Domain转换
    // =====================================================

    /** 将PO转换为Domain领域对象 */
    private MatchRecord toDomain(MatchRecordPO po) {
        if (po == null) return null;
        MatchRecord record = new MatchRecord();
        record.setId(po.getId());
        record.setResumeId(po.getResumeId());
        record.setJobId(po.getJobId());
        record.setMatchReason(po.getMatchReport());

        // 转换分数
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

        // 状态转换：0=未读，1=已读
        record.setIsRead(po.getStatus() != null && po.getStatus() == 1);

        return record;
    }

    /** 将Domain领域对象转换为PO */
    private MatchRecordPO toPO(MatchRecord record) {
        MatchRecordPO po = new MatchRecordPO();
        po.setId(record.getId());
        po.setResumeId(record.getResumeId());
        po.setJobId(record.getJobId());
        po.setMatchReport(record.getMatchReason());

        // 转换分数
        if (record.getScore() != null) {
            po.setOverallScore(BigDecimal.valueOf(record.getScore().getTotal()));
            po.setSkillScore(BigDecimal.valueOf(record.getScore().getSkillScore()));
            po.setExperienceScore(BigDecimal.valueOf(record.getScore().getExpScore()));
            po.setCityScore(BigDecimal.valueOf(record.getScore().getCityScore()));
            po.setEducationScore(BigDecimal.valueOf(record.getScore().getEduScore()));
            po.setSalaryScore(BigDecimal.valueOf(record.getScore().getSalScore()));
        }

        // 状态转换：false=0(未读)，true=1(已读)
        po.setStatus(record.getIsRead() != null && record.getIsRead() ? 1 : 0);

        return po;
    }
}
