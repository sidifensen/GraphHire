package com.graphhire.match.domain.repository;

import com.graphhire.match.domain.model.MatchRecord;

import java.util.List;
import java.util.Optional;

/**
 * 匹配记录仓储接口
 * 定义匹配记录的基础CRUD操作，支持按简历、职位查询
 */
public interface MatchRecordRepository {
    /** 根据ID查询匹配记录 */
    Optional<MatchRecord> findById(Long id);
    /** 查询指定简历的所有匹配记录 */
    List<MatchRecord> findByResumeId(Long resumeId);
    /** 查询指定职位的所有匹配记录 */
    List<MatchRecord> findByJobId(Long jobId);
    /** 查询指定简历和职位的匹配记录（可能有多个匹配方向） */
    List<MatchRecord> findByResumeIdAndJobId(Long resumeId, Long jobId);
    /** 保存匹配记录（新增或更新） */
    MatchRecord save(MatchRecord matchRecord);
    /** 删除匹配记录 */
    void delete(MatchRecord matchRecord);
    /** 统计匹配记录总数 */
    long count();
}
