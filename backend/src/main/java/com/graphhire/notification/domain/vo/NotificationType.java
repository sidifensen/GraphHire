package com.graphhire.notification.domain.vo;

/**
 * 通知类型枚举
 * 定义系统支持的各类通知类型及其展示标题
 */
public enum NotificationType {
    /** 简历解析完成通知 */
    RESUME_PARSED(1, "Resume Parsed"),
    /** 职位推荐通知 */
    JOB_RECOMMENDATION(2, "Job Recommendation"),
    /** 候选人推荐通知 */
    CANDIDATE_RECOMMENDATION(3, "Candidate Recommendation"),
    /** 企业认证结果通知 */
    COMPANY_AUTH_RESULT(4, "Company Auth Result"),
    /** 简历被查看通知 */
    RESUME_VIEWED(5, "Resume Viewed"),
    /** 简历投递通知 */
    RESUME_SUBMITTED(7, "Resume Submitted"),
    /** 面试邀请通知 */
    INTERVIEW_INVITED(6, "Interview Invited"),
    /** 系统通知 */
    SYSTEM_NOTIFICATION(99, "System Notification");

    /** 枚举值（用于数据库存储） */
    private final int value;
    /** 通知标题 */
    private final String title;

    NotificationType(int value, String title) {
        this.value = value;
        this.title = title;
    }

    public int getValue() {
        return value;
    }

    /** 获取通知标题 */
    public String getTitle() {
        return title;
    }

    /**
     * 根据枚举值查找对应的通知类型
     * @param value 枚举整数值
     * @return 对应的 NotificationType
     * @throws IllegalArgumentException 当值不存在时抛出
     */
    public static NotificationType fromValue(int value) {
        for (NotificationType type : values()) {
            if (type.value == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown notification type value: " + value);
    }
}
