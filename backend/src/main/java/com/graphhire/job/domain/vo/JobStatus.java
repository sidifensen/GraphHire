package com.graphhire.job.domain.vo;

/**
 * 职位状态枚举
 *
 * 【模块说明】定义职位的生命周期状态。
 * - DRAFT：草稿状态，可编辑，可发布
 * - PUBLISHED：已发布状态，可接收投递，可关闭
 * - CLOSED：已关闭状态，不可编辑，可重新发布
 */
public enum JobStatus {
    /** 草稿 */
    DRAFT,
    /** 已发布 */
    PUBLISHED,
    /** 已关闭 */
    CLOSED;

    /** 从数据库 smallint 值转换 */
    public static JobStatus fromCode(int code) {
        return switch (code) {
            case 0 -> DRAFT;
            case 1 -> PUBLISHED;
            case 2 -> CLOSED;
            default -> DRAFT;
        };
    }

    /** 转换为数据库 smallint 值 */
    public int toCode() {
        return ordinal();
    }
}
