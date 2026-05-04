package com.graphhire.chat.domain.model;

public enum ChatMessageType {
    TEXT((short) 1),
    IMAGE((short) 2),
    RESUME_CARD((short) 3),
    INTERVIEW_INVITE_CARD((short) 4),
    SYSTEM((short) 5);

    private final short code;

    ChatMessageType(short code) {
        this.code = code;
    }

    public short getCode() {
        return code;
    }

    public static ChatMessageType fromCode(short code) {
        for (ChatMessageType value : values()) {
            if (value.code == code) {
                return value;
            }
        }
        throw new IllegalArgumentException("Unknown chat message type: " + code);
    }
}
