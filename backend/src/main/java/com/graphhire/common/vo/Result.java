package com.graphhire.common.vo;

/**
 * 统一响应封装
 * 【模块说明】标准化API响应格式，包含状态码、消息、数据三部分
 * @param <T> 响应数据类型
 */
public class Result<T> {
    /** 状态码：200成功，500系统错误，其他为业务错误码 */
    private int code;
    /** 响应消息 */
    private String message;
    /** 响应数据体 */
    private T data;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 成功响应（带数据）
     * @param data 响应数据
     * @param <T> 数据类型
     * @return Result实例
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    /**
     * 成功响应（无数据）
     * @param <T> 数据类型
     * @return Result实例
     */
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }

    /**
     * 错误响应（指定错误码）
     * @param code 错误码
     * @param message 错误消息
     * @param <T> 数据类型
     * @return Result实例
     */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    /**
     * 错误响应（默认500错误码）
     * @param message 错误消息
     * @param <T> 数据类型
     * @return Result实例
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
