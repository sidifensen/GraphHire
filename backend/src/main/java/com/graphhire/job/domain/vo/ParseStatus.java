package com.graphhire.job.domain.vo;

/**
 * 解析状态枚举
 *
 * 【模块说明】定义职位文档AI解析的处理状态。
 * - PENDING：待解析，任务已创建
 * - PARSING：解析中，正在处理
 * - SUCCESS：解析成功，已提取结构化数据
 * - FAILED：解析失败，发生了错误
 */
public enum ParseStatus {
    /** 待解析 */
    PENDING,
    /** 解析中 */
    PARSING,
    /** 解析成功 */
    SUCCESS,
    /** 解析失败 */
    FAILED
}
