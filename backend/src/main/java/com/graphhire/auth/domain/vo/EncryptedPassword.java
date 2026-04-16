package com.graphhire.auth.domain.vo;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 加密密码值对象
 * 使用 BCrypt 算法对密码进行单向加密存储，保证密码安全性
 */
public final class EncryptedPassword {
    /** BCrypt 加密后的密码字符串 */
    private final String value;

    /**
     * 私有构造函数，通过静态工厂方法创建
     * @param encoded BCrypt 加密后的字符串
     */
    private EncryptedPassword(String encoded) {
        this.value = encoded;
    }

    /**
     * 静态工厂方法，对明文密码进行 BCrypt 加密
     * @param raw 明文密码
     * @return EncryptedPassword 实例
     */
    public static EncryptedPassword encode(String raw) {
        return new EncryptedPassword(BCrypt.hashpw(raw, BCrypt.gensalt()));
    }

    /**
     * 校验明文密码是否与加密密码匹配
     * @param raw 明文密码
     * @return true 表示匹配，false 表示不匹配
     */
    public boolean matches(String raw) {
        return BCrypt.checkpw(raw, this.value);
    }

    public String getValue() {
        return value;
    }
}