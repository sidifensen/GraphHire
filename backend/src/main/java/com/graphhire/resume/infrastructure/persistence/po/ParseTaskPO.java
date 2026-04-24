package com.graphhire.resume.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 解析任务持久化对象
 * 对应数据库 parse_task 表
 */
@TableName("parse_task")
public class ParseTaskPO {
    /** 任务ID（自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 关联的简历ID */
    @TableField("source_id")
    private Long sourceId;
    /** 任务类型（1:简历解析） */
    @TableField("task_type")
    private Integer taskType;
    /** 任务状态（0:待执行,1:执行中,2:成功,3:失败） */
    @TableField("status")
    private Integer status;
    /** 重试次数 */
    @TableField("retry_count")
    private Integer retryCount;
    /** 错误信息 */
    @TableField("error_msg")
    private String errorMessage;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 完成时间 */
    @TableField("finish_time")
    private LocalDateTime finishTime;
    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }

    public Integer getTaskType() { return taskType; }
    public void setTaskType(Integer taskType) { this.taskType = taskType; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getFinishTime() { return finishTime; }
    public void setFinishTime(LocalDateTime finishTime) { this.finishTime = finishTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
