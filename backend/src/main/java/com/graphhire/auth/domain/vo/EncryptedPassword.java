package com.graphhire.auth.domain.vo;

import cn.hutool.crypto.digest.BCrypt;

public final class EncryptedPassword {
    private final String value;

    private EncryptedPassword(String encoded) {
        this.value = encoded;
    }

    public static EncryptedPassword encode(String raw) {
        return new EncryptedPassword(BCrypt.hashpw(raw, BCrypt.gensalt()));
    }

    public boolean matches(String raw) {
        return BCrypt.checkpw(raw, this.value);
    }

    public String getValue() {
        return value;
    }
}
