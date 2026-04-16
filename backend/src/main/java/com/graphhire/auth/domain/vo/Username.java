package com.graphhire.auth.domain.vo;

/**
 * 用户名值对象
 * 使用邮箱格式作为用户名，通过静态工厂方法创建保证不可变性和格式校验
 */
public final class Username {
    /** 用户名字符串值 */
    private final String value;

    /**
     * 私有构造函数，通过静态工厂方法创建实例
     * @param value 用户名字符串
     * @throws IllegalArgumentException 当格式不符合邮箱格式时抛出
     */
    private Username(String value) {
        if (!value.matches("^[\\w.-]+@[\\w.-]+\\.\\w+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        this.value = value;
    }

    /**
     * 静态工厂方法，创建 Username 实例
     * @param value 用户名字符串
     * @return Username 实例
     */
    public static Username of(String value) {
        return new Username(value);
    }

    public String getValue() {
        return value;
    }
}