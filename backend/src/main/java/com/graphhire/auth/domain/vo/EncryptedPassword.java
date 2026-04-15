package com.graphhire.auth.domain.vo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class EncryptedPassword {
    private final String value;

    private EncryptedPassword(String encoded) {
        this.value = encoded;
    }

    public static EncryptedPassword encode(String raw) {
        return new EncryptedPassword(new BCryptPasswordEncoder().encode(raw));
    }

    public boolean matches(String raw) {
        return new BCryptPasswordEncoder().matches(raw, this.value);
    }

    public String getValue() {
        return value;
    }
}