package com.graphhire.resume.domain.vo;

/**
 * 简历解析状态枚举
 * 定义简历文档的解析状态流转
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
