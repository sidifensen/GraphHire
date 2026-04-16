package com.graphhire.notification.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 通知持久化对象
 * 对应数据库 notification 表结构
 */
@TableName("notification")
public class NotificationPO {
    /** 通知ID（自增主键） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 所属用户ID */
    @TableField("user_id")
    private Long userId;
    /** 通知类型（整数值，对应 NotificationType 枚举） */
    @TableField("type")
    private Integer type;
    /** 通知标题 */
    @TableField("title")
    private String title;
    /** 通知内容 */
    @TableField("content")
    private String content;
    /** 关联业务ID（可指向职位、简历、候选人等） */
    @TableField("related_id")
    private Long relatedId;
    /** 已读状态：0-未读，1-已读 */
    @TableField("is_read")
    private Integer isRead;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getType() { return type; }
    public void setType(Integer type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }

    public Integer getIsRead() { return isRead; }
    public void setIsRead(Integer isRead) { this.isRead = isRead; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
