package com.graphhire.match.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.match.domain.event.MatchCompletedEvent;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.domain.vo.MatchScore;

/**
 * 匹配记录领域模型
 *
 * 【模块说明】管理人岗匹配记录的完整生命周期，记录匹配结果及状态流转。
 *
 * 【事件发布】
 * - create()：发布 MatchCompletedEvent
 *
 * 【关联实体】
 * - resumeId：关联的简历ID
 * - jobId：关联的职位ID
 * - score：匹配分数（包含五个维度及总分）
 * - level：匹配等级（HIGH/MEDIUM/LOW）
 * - matchReason：匹配原因说明
 */
public class MatchRecord extends BaseAggregateRoot {
    /** 匹配方向：求职者投递 */
    public static final int DIRECTION_PERSON_APPLIES = 1;
    /** 匹配方向：企业推荐 */
    public static final int DIRECTION_COMPANY_RECOMMENDS = 2;

    /** 主键ID */
    private Long id;
    /** 关联简历ID */
    private Long resumeId;
    /** 关联职位ID */
    private Long jobId;
    /** 匹配分数（技能、经验、城市、学历、薪资五个维度） */
    private MatchScore score;
    /** 匹配等级（根据总分自动计算：>=80 HIGH，>=50 MEDIUM，<50 LOW） */
    private MatchLevel level;
    /** 匹配原因说明（AI生成或计算得出） */
    private String matchReason;
    /** 是否已读（求职者/HR是否查看过该匹配记录） */
    private Boolean isRead = false;
    /** 匹配方向：1=求职者投递，2=企业推荐 */
    private Integer matchDirection;

    public static MatchRecord create(Long resumeId, Long jobId, MatchScore score) {
        MatchRecord record = new MatchRecord();
        record.resumeId = resumeId;
        record.jobId = jobId;
        record.score = score;
        record.level = score.getLevel();
        record.registerEvent(new MatchCompletedEvent(record));
        return record;
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public MatchScore getScore() {
        return score;
    }

    public void setScore(MatchScore score) {
        this.score = score;
    }

    public MatchLevel getLevel() {
        return level;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Integer getMatchDirection() {
        return matchDirection;
    }

    public void setMatchDirection(Integer matchDirection) {
        this.matchDirection = matchDirection;
    }
}
